import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, FilePlus, Mail, MessageCircle, Pencil, Phone, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatKES, formatOrderNo } from '@/lib/format'
import { QUOTE_LABEL, QUOTE_TONE, formatQuoteNo, toWhatsAppNumber } from '@/lib/quote'
import { useBusiness } from '@/context/BusinessContext'
import { useOrderStatuses } from '@/hooks/useOrderStatuses'
import { OrderStatusBadge, PaymentBadge } from '@/pages/orders/Badges'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ClientForm } from '@/pages/clients/ClientForm'
import { OrderForm } from '@/pages/orders/OrderForm'
import type { Client, Order, Quote } from '@/types/database'
import { DataCard } from '@/components/ui/DataCard'
import { TableSkeleton } from '@/components/ui/Skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { PackageSearch } from 'lucide-react'

export function ClientPage() {
  const { id } = useParams()
  const { active } = useBusiness()
  const statuses = useOrderStatuses()
  const [client, setClient] = useState<Client | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [paid, setPaid] = useState<Record<string, number>>({})
  const [quotes, setQuotes] = useState<Quote[]>([])
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [editing, setEditing] = useState(false)
  const [creating, setCreating] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!active || !id) return
    const [c, o, q] = await Promise.all([
      supabase.from('clients').select('*').eq('id', id).eq('business_id', active.id).maybeSingle(),
      supabase.from('orders').select('*').eq('client_id', id).eq('business_id', active.id).order('order_no', { ascending: false }),
      active.slug === 'evia_web'
        ? supabase
            .from('quotes')
            .select('id, quote_no, status, total_kes, monthly_kes, created_at')
            .eq('client_id', id)
            .eq('business_id', active.id)
            .order('created_at', { ascending: false })
        : Promise.resolve({ data: [] }),
    ])
    if (c.error || o.error) {
      setLoadError((c.error ?? o.error)!.message)
      setState('ready')
      return
    }
    setLoadError(null)
    if (!c.data) return setState('missing')

    const orderRows = (o.data ?? []) as Order[]
    const map: Record<string, number> = {}
    if (orderRows.length > 0) {
      const p = await supabase.from('payments').select('order_id, amount_kes').in('order_id', orderRows.map((x) => x.id))
      ;(p.data ?? []).forEach((row: { order_id: string; amount_kes: number }) => {
        map[row.order_id] = (map[row.order_id] ?? 0) + Number(row.amount_kes)
      })
    }

    setClient(c.data as Client)
    setOrders(orderRows)
    setPaid(map)
    setQuotes((q.data ?? []) as Quote[])
    setState('ready')
  }, [active, id])

  useEffect(() => {
    load()
  }, [load])

  if (!active) return null
  if (loadError && !client) return <ErrorState message={loadError} onRetry={load} />
  if (state === 'loading') return <p className="text-sm text-muted">Loading…</p>
  if (state === 'missing' || !client) {
    return (
      <div>
        <p className="text-sm">This client was not found in {active.name}.</p>
        <Link to="/clients" className="mt-2 inline-block text-sm text-plum-900 underline">Back to clients</Link>
      </div>
    )
  }

  const billed = orders.reduce((s, o) => s + Number(o.total_kes), 0)
  const received = orders.reduce((s, o) => s + (paid[o.id] ?? 0), 0)
  const balance = orders.reduce((s, o) => s + Math.max(Number(o.total_kes) - (paid[o.id] ?? 0), 0), 0)
  const whatsapp = toWhatsAppNumber(client.phone)
  const isWeb = active.slug === 'evia_web'

  return (
    <div>
      <Link to="/clients" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Clients
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-plum-900">{client.name}</h1>
          {client.business_name && <p className="text-sm text-muted">{client.business_name}</p>}
          <div className="mt-3 flex flex-wrap gap-4 text-sm">
            {client.phone && (
              <a href={`tel:${client.phone}`} className="inline-flex items-center gap-1.5 text-plum-900 underline"><Phone className="size-4" /> {client.phone}</a>
            )}
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-plum-900 underline"><MessageCircle className="size-4" /> WhatsApp</a>
            )}
            {client.email && (
              <a href={`mailto:${client.email}`} className="inline-flex items-center gap-1.5 text-plum-900 underline"><Mail className="size-4" /> {client.email}</a>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setEditing(true)}><Pencil className="size-4" /> Edit client</Button>
          {isWeb && (
            <Link to={`/quotations/new?client=${client.id}`}>
              <Button variant="secondary"><FilePlus className="size-4" /> New quote</Button>
            </Link>
          )}
          {!isWeb && (
            <Link to={`/events?client=${client.id}`}>
              <Button variant="secondary">View events</Button>
            </Link>
          )}
          <Button onClick={() => setCreating(true)}><Plus className="size-4" /> New order</Button>
        </div>
      </div>

      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          ['Total billed', formatKES(billed)],
          ['Paid', formatKES(received)],
          ['Balance', formatKES(balance)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl text-plum-900">{value}</p>
          </div>
        ))}
      </div>

      <section className="mb-6">
        <h2 className="mb-3 font-display text-xl text-plum-900">Orders</h2>
        {loadError ? (
          <ErrorState message={loadError} onRetry={load} />
        ) : orders.length === 0 ? (
          <EmptyState icon={PackageSearch} title="No orders yet" body="Orders placed by this client will show up here." />
        ) : (
          <>
        <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-sm sm:block">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                {['Order', 'Package', 'Stage', 'Payment', 'Total', 'Deadline'].map((h) => (
                  <th key={h} className="px-4 py-3 font-medium">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o.id}`} className="font-medium text-plum-900 hover:underline">{formatOrderNo(o.order_no)}</Link>
                  </td>
                  <td className="px-4 py-3">{o.package ?? '–'}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} statuses={statuses} /></td>
                  <td className="px-4 py-3"><PaymentBadge value={o.payment_status} /></td>
                  <td className="px-4 py-3">{formatKES(o.total_kes)}</td>
                  <td className="px-4 py-3">{formatDate(o.deadline)}</td>
                </tr>
              ))}
          </tbody>
          </table>
        </div>
        <div className="space-y-3 sm:hidden">
          {orders.map((o) => (
            <Link key={o.id} to={`/orders/${o.id}`}>
              <DataCard
                title={formatOrderNo(o.order_no)}
                subtitle={o.package ?? undefined}
                rows={[
                  { label: 'Stage', value: <OrderStatusBadge status={o.status} statuses={statuses} /> },
                  { label: 'Payment', value: <PaymentBadge value={o.payment_status} /> },
                  { label: 'Total', value: formatKES(o.total_kes) },
                  { label: 'Deadline', value: formatDate(o.deadline) },
                ]}
              />
            </Link>
          ))}
        </div>
          </>
        )}
      </section>

      {isWeb && (
        <section className="mb-6">
          <h2 className="mb-3 font-display text-xl text-plum-900">Quotes</h2>
          <div className="rounded-2xl border border-line bg-white p-2 shadow-sm">
            {quotes.length === 0 ? (
              <p className="p-4 text-center text-sm text-muted">No quotes yet.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {quotes.map((q) => (
                  <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
                    <Link to={`/quotations/${q.id}`} className="font-medium text-plum-900 hover:underline">{formatQuoteNo(q.quote_no)}</Link>
                    <span className="text-muted">{formatDate(q.created_at)}</span>
                    <span>
                      {formatKES(q.total_kes)}
                      {q.monthly_kes > 0 && <span className="text-muted"> + {formatKES(q.monthly_kes)}/mo</span>}
                    </span>
                    <StatusBadge tone={QUOTE_TONE[q.status]}>{QUOTE_LABEL[q.status]}</StatusBadge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      )}

      {client.notes && (
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="mb-2 font-display text-lg text-plum-900">Notes</h2>
          <p className="whitespace-pre-wrap text-sm">{client.notes}</p>
        </section>
      )}

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit client">
        {editing && (
          <ClientForm
            business={active}
            client={client}
            onClose={() => setEditing(false)}
            onSaved={() => {
              setEditing(false)
              load()
            }}
          />
        )}
      </Modal>

      <Modal open={creating} onClose={() => setCreating(false)} title="New order">
        {creating && (
          <OrderForm
            business={active}
            order={null}
            statuses={statuses}
            defaultClientId={client.id}
            onClose={() => setCreating(false)}
            onSaved={() => {
              setCreating(false)
              load()
            }}
          />
        )}
      </Modal>
    </div>
  )
}
