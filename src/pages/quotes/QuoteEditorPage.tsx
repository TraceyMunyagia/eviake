import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatKES } from '@/lib/format'
import { QUOTE_LABEL, QUOTE_TONE, computeTotals, formatQuoteNo } from '@/lib/quote'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { Field, TextArea, TextInput, inputClass } from '@/components/ui/Field'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { QuoteSummary } from '@/components/quotes/QuoteSummary'
import { QuoteToolbar } from '@/components/quotes/QuoteToolbar'
import type { PriceItem, Quote, QuoteItem } from '@/types/database'

type ClientOption = { id: string; name: string; business_name: string | null }
type OrderOption = { id: string; order_no: number; package: string | null }
type CustomLine = { key: number; name: string; qty: string; price: string }

const inTwoWeeks = () => new Date(Date.now() + 14 * 86_400_000).toISOString().slice(0, 10)

export function QuoteEditorPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const { active } = useBusiness()

  const [quote, setQuote] = useState<Quote | null>(null)
  const [savedItems, setSavedItems] = useState<QuoteItem[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>(id ? 'loading' : 'ready')

  const [catalog, setCatalog] = useState<PriceItem[]>([])
  const [clients, setClients] = useState<ClientOption[]>([])
  const [orders, setOrders] = useState<OrderOption[]>([])

  const [clientId, setClientId] = useState(params.get('client') ?? '')
  const [orderId, setOrderId] = useState('')
  const [pkg, setPkg] = useState('')
  const [addons, setAddons] = useState<Record<string, number>>({})
  const [customs, setCustoms] = useState<CustomLine[]>([])
  const [discount, setDiscount] = useState('')
  const [careName, setCareName] = useState('')
  const [monthly, setMonthly] = useState('')
  const [validUntil, setValidUntil] = useState(inTwoWeeks())
  const [notes, setNotes] = useState('')

  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState(false)
  const skipNext = useRef(true)

  useEffect(() => {
    if (!active) return
    Promise.all([
      supabase.from('price_items').select('*').eq('business_id', active.id).order('sort_order'),
      supabase.from('clients').select('id, name, business_name').eq('business_id', active.id).order('name'),
    ]).then(([p, c]) => {
      setCatalog((p.data ?? []) as PriceItem[])
      setClients((c.data ?? []) as ClientOption[])
    })
  }, [active])

  const loadQuote = useCallback(async () => {
    if (!active || !id) return
    const [q, i] = await Promise.all([
      supabase
        .from('quotes')
        .select('*, clients(name, business_name, email, phone), orders(order_no)')
        .eq('id', id)
        .eq('business_id', active.id)
        .maybeSingle(),
      supabase.from('quote_items').select('*').eq('quote_id', id).order('sort_order'),
    ])
    const row = q.data as Quote | null
    if (!row) return setState('missing')
    const items = (i.data ?? []) as QuoteItem[]

    skipNext.current = true
    setQuote(row)
    setSavedItems(items)
    setClientId(row.client_id)
    setOrderId(row.order_id ?? '')
    setPkg(items.find((x) => x.kind === 'package')?.name ?? '')
    setAddons(Object.fromEntries(items.filter((x) => x.kind === 'addon').map((x) => [x.name, x.quantity])))
    setCustoms(
      items
        .filter((x) => x.kind === 'custom')
        .map((x, n) => ({ key: n, name: x.name, qty: String(x.quantity), price: String(x.unit_price_kes) })),
    )
    setDiscount(row.discount_kes > 0 ? String(row.discount_kes) : '')
    setCareName(row.care_name ?? '')
    setMonthly(row.monthly_kes > 0 ? String(row.monthly_kes) : '')
    setValidUntil(row.valid_until ?? '')
    setNotes(row.notes ?? '')
    setDirty(false)
    setState('ready')
  }, [active, id])

  useEffect(() => {
    loadQuote()
  }, [loadQuote])

  const fromOrder = params.get('order')
  useEffect(() => {
    if (id || !fromOrder || !active) return
    supabase
      .from('orders')
      .select('id, client_id')
      .eq('id', fromOrder)
      .eq('business_id', active.id)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) return
        setClientId(data.client_id)
        setOrderId(data.id)
      })
  }, [id, fromOrder, active])

  useEffect(() => {
    if (!active || !clientId) {
      setOrders([])
      return
    }
    supabase
      .from('orders')
      .select('id, order_no, package')
      .eq('business_id', active.id)
      .eq('client_id', clientId)
      .order('order_no', { ascending: false })
      .then(({ data }) => setOrders((data ?? []) as OrderOption[]))
  }, [active, clientId])

  useEffect(() => {
    if (skipNext.current) {
      skipNext.current = false
      return
    }
    setDirty(true)
  }, [clientId, orderId, pkg, addons, customs, discount, careName, monthly, validUntil, notes])

  // Prices already saved on this quote win over today's price list
  const snapshot = useMemo(() => {
    const map = new Map<string, QuoteItem>()
    savedItems.forEach((i) => map.set(`${i.kind}:${i.name}`, i))
    return map
  }, [savedItems])

  const priceOf = (kind: 'package' | 'addon', name: string) =>
    snapshot.get(`${kind}:${name}`)?.unit_price_kes ?? catalog.find((c) => c.kind === kind && c.name === name)?.price_kes ?? 0
  const descOf = (kind: 'package' | 'addon', name: string) =>
    snapshot.get(`${kind}:${name}`)?.description ?? catalog.find((c) => c.kind === kind && c.name === name)?.description ?? null

  const optionsFor = (kind: 'package' | 'addon') => {
    const list = catalog
      .filter((c) => c.kind === kind && (c.active || snapshot.has(`${kind}:${c.name}`)))
      .map((c) => ({ name: c.name, price: priceOf(kind, c.name), description: descOf(kind, c.name) }))
    savedItems
      .filter((i) => i.kind === kind && !list.some((l) => l.name === i.name))
      .forEach((i) => list.push({ name: i.name, price: i.unit_price_kes, description: i.description }))
    return list
  }
  const packageOptions = optionsFor('package')
  const addonOptions = optionsFor('addon')
  const careOptions = catalog.filter((c) => c.kind === 'care' && c.active)

  const items = useMemo<QuoteItem[]>(() => {
    const list: QuoteItem[] = []
    if (pkg) list.push({ kind: 'package', name: pkg, description: descOf('package', pkg), quantity: 1, unit_price_kes: priceOf('package', pkg) })
    addonOptions
      .filter((a) => addons[a.name])
      .forEach((a) => list.push({ kind: 'addon', name: a.name, description: a.description, quantity: addons[a.name], unit_price_kes: a.price }))
    customs
      .filter((c) => c.name.trim())
      .forEach((c) =>
        list.push({ kind: 'custom', name: c.name.trim(), description: null, quantity: Math.max(1, Number(c.qty) || 1), unit_price_kes: Number(c.price) || 0 }),
      )
    return list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pkg, addons, customs, catalog, savedItems])

  const totals = computeTotals(items, Number(discount) || 0)
  const monthlyNum = Number(monthly) || 0
  const editable = !quote || quote.status === 'draft'

  function chooseCare(name: string) {
    setCareName(name)
    const match = careOptions.find((c) => c.name === name)
    setMonthly(match ? String(match.price_kes) : '')
  }

  async function save() {
    if (!active) return
    if (!clientId) return setError('Choose a client.')
    if (items.length === 0) return setError('Add a package, an add-on or a custom line.')
    setBusy(true)
    setError(null)
    const { data, error: err } = await supabase.rpc('save_quote', {
      p_quote_id: quote?.id ?? null,
      p_business_id: active.id,
      p_client_id: clientId,
      p_order_id: orderId || null,
      p_discount: Number(discount) || 0,
      p_care_name: careName || null,
      p_monthly: monthlyNum,
      p_valid_until: validUntil || null,
      p_notes: notes.trim() || null,
      p_items: items,
    })
    setBusy(false)
    if (err) return setError(err.message)
    if (!quote) return navigate(`/quotations/${data as string}`, { replace: true })
    await loadQuote()
  }

  if (!active) return null
  if (active.slug !== 'evia_web') {
    return <p className="text-sm text-muted">Quotations are part of Evia Web. Switch business to use them.</p>
  }
  if (state === 'loading') return <p className="text-sm text-muted">Loading…</p>
  if (state === 'missing') {
    return (
      <div>
        <p className="text-sm">This quote was not found in {active.name}.</p>
        <Link to="/quotations" className="mt-2 inline-block text-sm text-plum-900 underline">Back to quotations</Link>
      </div>
    )
  }

  const title = quote ? `Quote ${formatQuoteNo(quote.quote_no)}` : 'New quote'

  return (
    <div>
      <Link to="/quotations" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Quotations
      </Link>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="font-display text-3xl text-plum-900">{title}</h1>
        {quote && <StatusBadge tone={QUOTE_TONE[quote.status]}>{QUOTE_LABEL[quote.status]}</StatusBadge>}
      </div>

      {/* Quote actions (status, PDF, send) are added on Days 17, 19 and 20 */}
      {quote && <QuoteToolbar quote={quote} locked={dirty} onChanged={loadQuote} />}

      {!editable && quote ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:col-span-2">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Client</dt><dd className="mt-1 font-medium">{quote.clients?.name}</dd></div>
              <div><dt className="text-muted">Order</dt><dd className="mt-1">{quote.orders ? `#${String(quote.orders.order_no).padStart(4, '0')}` : '–'}</dd></div>
              <div><dt className="text-muted">Valid until</dt><dd className="mt-1">{formatDate(quote.valid_until)}</dd></div>
              <div><dt className="text-muted">Sent</dt><dd className="mt-1">{formatDate(quote.sent_at)}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-muted">Notes shown on the quote</dt>
                <dd className="mt-1 whitespace-pre-wrap">{quote.notes ?? '–'}</dd>
              </div>
            </dl>
            <p className="mt-4 text-sm text-muted">Sent quotes are locked. Use Back to draft if you need to change one.</p>
          </section>
          <QuoteSummary
            items={savedItems}
            subtotal={quote.subtotal_kes}
            discount={quote.discount_kes}
            total={quote.total_kes}
            careName={quote.care_name}
            monthly={quote.monthly_kes}
          />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card title="Client and order">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Client" htmlFor="q-client">
                  <select id="q-client" value={clientId} onChange={(e) => { setClientId(e.target.value); setOrderId('') }} className={inputClass}>
                    <option value="" disabled>Choose a client</option>
                    {clients.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}{c.business_name ? ` (${c.business_name})` : ''}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Linked order (optional)" htmlFor="q-order">
                  <select id="q-order" value={orderId} onChange={(e) => setOrderId(e.target.value)} disabled={!clientId} className={inputClass}>
                    <option value="">Not linked to an order</option>
                    {orders.map((o) => (
                      <option key={o.id} value={o.id}>#{String(o.order_no).padStart(4, '0')}{o.package ? ` · ${o.package}` : ''}</option>
                    ))}
                  </select>
                </Field>
                <TextInput id="q-valid" label="Valid until" type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
              {clients.length === 0 && <p className="mt-3 text-sm text-muted">Add a client first from the Clients page.</p>}
            </Card>

            <Card title="Package">
              <Field label="Website package" htmlFor="q-package">
                <select id="q-package" value={pkg} onChange={(e) => setPkg(e.target.value)} className={inputClass}>
                  <option value="">No package</option>
                  {packageOptions.map((p) => (
                    <option key={p.name} value={p.name}>{p.name} · {formatKES(p.price)}</option>
                  ))}
                </select>
              </Field>
              {pkg && descOf('package', pkg) && <p className="mt-2 text-sm text-muted">{descOf('package', pkg)}</p>}
            </Card>

            <Card title="Add-ons">
              {addonOptions.length === 0 ? (
                <p className="text-sm text-muted">No active add-ons. Set prices on the Pricing page to make them available.</p>
              ) : (
                <ul className="divide-y divide-line">
                  {addonOptions.map((a) => {
                    const qty = addons[a.name] ?? 0
                    return (
                      <li key={a.name} className="flex flex-wrap items-center gap-3 py-2.5 text-sm">
                        <label className="flex flex-1 items-center gap-3">
                          <input
                            type="checkbox"
                            checked={qty > 0}
                            onChange={(e) =>
                              setAddons((prev) => {
                                const next = { ...prev }
                                if (e.target.checked) next[a.name] = 1
                                else delete next[a.name]
                                return next
                              })
                            }
                            className="size-4 accent-plum-800"
                          />
                          <span>{a.name}</span>
                        </label>
                        {qty > 0 && (
                          <label className="flex items-center gap-2 text-muted">
                            Qty
                            <input
                              type="number" min={1} value={qty} aria-label={`Quantity for ${a.name}`}
                              onChange={(e) => setAddons((prev) => ({ ...prev, [a.name]: Math.max(1, Number(e.target.value) || 1) }))}
                              className="w-16 rounded-lg border border-line px-2 py-1 text-ink"
                            />
                          </label>
                        )}
                        <span className="w-24 text-right">{formatKES(a.price)}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Card>

            <Card title="Custom lines">
              {customs.map((c) => (
                <div key={c.key} className="mb-3 grid gap-3 sm:grid-cols-[1fr_5rem_8rem_auto] sm:items-end">
                  <TextInput id={`cl-n-${c.key}`} label="Description" value={c.name} onChange={(e) => setCustoms((p) => p.map((x) => (x.key === c.key ? { ...x, name: e.target.value } : x)))} />
                  <TextInput id={`cl-q-${c.key}`} label="Qty" type="number" min={1} value={c.qty} onChange={(e) => setCustoms((p) => p.map((x) => (x.key === c.key ? { ...x, qty: e.target.value } : x)))} />
                  <TextInput id={`cl-p-${c.key}`} label="Price (KSh)" type="number" min={0} value={c.price} onChange={(e) => setCustoms((p) => p.map((x) => (x.key === c.key ? { ...x, price: e.target.value } : x)))} />
                  <Button type="button" variant="ghost" aria-label="Remove line" onClick={() => setCustoms((p) => p.filter((x) => x.key !== c.key))}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button" variant="secondary"
                onClick={() => setCustoms((p) => [...p, { key: Date.now(), name: '', qty: '1', price: '' }])}
              >
                <Plus className="size-4" /> Add custom line
              </Button>
            </Card>

            <Card title="Monthly care and hosting">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Care plan" htmlFor="q-care">
                  <select id="q-care" value={careName} onChange={(e) => chooseCare(e.target.value)} className={inputClass}>
                    <option value="">None</option>
                    {careOptions.map((c) => <option key={c.id} value={c.name}>{c.name} · {formatKES(c.price_kes)}/month</option>)}
                    {careName && !careOptions.some((c) => c.name === careName) && <option value={careName}>{careName}</option>}
                  </select>
                </Field>
                <TextInput id="q-monthly" label="Monthly fee (KSh)" type="number" min={0} value={monthly} onChange={(e) => setMonthly(e.target.value)} />
              </div>
            </Card>

            <Card title="Discount and notes">
              <div className="space-y-4">
                <TextInput id="q-discount" label="Discount on setup (KSh)" type="number" min={0} value={discount} onChange={(e) => setDiscount(e.target.value)} />
                <TextArea id="q-notes" label="Notes shown on the quote (payment terms, what is excluded)" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
            </Card>
          </div>

          <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <QuoteSummary
              items={items}
              subtotal={totals.subtotal}
              discount={Number(discount) || 0}
              total={totals.total}
              careName={careName || null}
              monthly={monthlyNum}
            />
            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <Button onClick={save} disabled={busy} className="w-full">
              {busy ? 'Saving…' : quote ? 'Save changes' : 'Save draft'}
            </Button>
            {dirty && quote && <p className="text-center text-xs text-muted">You have unsaved changes.</p>}
          </div>
        </div>
      )}
    </div>
  )
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-display text-lg text-plum-900">{title}</h2>
      {children}
    </section>
  )
}
