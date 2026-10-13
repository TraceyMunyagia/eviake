import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useInviteTemplates } from '@/hooks/useInviteTemplates'
import { EVENT_TYPES } from '@/pages/events/EventForm'
import { Button } from '@/components/ui/Button'
import { Field, TextArea, TextInput, inputClass } from '@/components/ui/Field'
import type { Business, Order, OrderStatus } from '@/types/database'

type ClientOption = { id: string; name: string; business_name: string | null }
type Details = NonNullable<Order['invitation_details']>

// Same names the public request form and quotes use
const PACKAGES = ['Essential', 'Signature', 'Experience']

// Evia Invites order from scratch: client (existing or new), invite choices and event details.
// Event details live in orders.invitation_details, like orders from the public request form.
export function InviteOrderForm({ business, order, statuses, defaultClientId, onClose, onSaved }: {
  business: Business
  order: Order | null
  statuses: OrderStatus[]
  defaultClientId?: string
  onClose: () => void
  onSaved: () => void
}) {
  const { templates } = useInviteTemplates()
  const [clients, setClients] = useState<ClientOption[]>([])
  const [ready, setReady] = useState(false)

  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing')
  const [clientId, setClientId] = useState(order?.client_id ?? defaultClientId ?? '')
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '' })

  const [details, setDetails] = useState<Details>(order?.invitation_details ?? {})
  const [pkg, setPkg] = useState(order?.package ?? 'Signature')
  const [total, setTotal] = useState(order ? String(order.total_kes) : '')
  const [status, setStatus] = useState(order?.status ?? statuses[0]?.key ?? '')
  const [notes, setNotes] = useState(order?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase
      .from('clients')
      .select('id, name, business_name')
      .eq('business_id', business.id)
      .order('name')
      .then(({ data }) => {
        const list = (data ?? []) as ClientOption[]
        setClients(list)
        if (list.length === 0 && !order) setClientMode('new')
        setReady(true)
      })
  }, [business.id, order])

  const set = <K extends keyof Details>(key: K, value: Details[K]) => setDetails((d) => ({ ...d, [key]: value }))
  const text = (key: 'eventName' | 'hostName' | 'eventDate' | 'eventTime' | 'venue' | 'address' | 'mapsUrl' | 'dressCode' | 'description') => ({
    value: details[key] ?? '',
    onChange: (e: { target: { value: string } }) => set(key, e.target.value),
  })

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (clientMode === 'new' && !newClient.name.trim()) return setError('Enter the client name.')
    if (clientMode === 'existing' && !clientId) return setError('Choose a client.')
    if (!details.eventDate) return setError('Enter the event date.')
    setBusy(true)

    let cid = clientId
    if (clientMode === 'new') {
      const { data, error: err } = await supabase
        .from('clients')
        .insert({
          business_id: business.id,
          name: newClient.name.trim(),
          phone: newClient.phone.trim() || null,
          email: newClient.email.trim().toLowerCase() || null,
        })
        .select('id, name, business_name')
        .single()
      if (err || !data) {
        setBusy(false)
        return setError(err?.message ?? 'Could not add the client.')
      }
      cid = data.id
      // If the order save fails below, a retry reuses this client instead of adding it twice
      setClients((list) => [...list, data as ClientOption])
      setClientId(cid)
      setClientMode('existing')
    }

    const trimmed = Object.fromEntries(
      Object.entries(details).map(([k, v]) => [k, typeof v === 'string' ? v.trim() || undefined : v]),
    ) as Details
    const values = {
      client_id: cid,
      package: pkg,
      total_kes: Number(total) || 0,
      status,
      deadline: details.eventDate,
      notes: notes.trim() || null,
      invitation_details: trimmed,
    }
    const { error: err } = order
      ? await supabase.from('orders').update(values).eq('id', order.id)
      : await supabase.from('orders').insert({ ...values, business_id: business.id })
    setBusy(false)
    if (err) return setError(err.message)
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Group title="Client">
        {clients.length > 0 && (
          <div role="radiogroup" aria-label="Client" className="flex gap-2 text-sm">
            {(['existing', 'new'] as const).map((m) => (
              <button
                key={m} type="button" role="radio" aria-checked={clientMode === m} onClick={() => setClientMode(m)}
                className={clientMode === m ? 'rounded-lg border border-plum-800 bg-gold-100 px-3 py-1.5 font-medium text-plum-900' : 'rounded-lg border border-line px-3 py-1.5 text-muted hover:text-ink'}
              >
                {m === 'existing' ? 'Existing client' : 'New client'}
              </button>
            ))}
          </div>
        )}
        {clientMode === 'existing' ? (
          <Field label="Client" htmlFor="io-client">
            <select id="io-client" value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
              <option value="" disabled>Choose a client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}{c.business_name ? ` (${c.business_name})` : ''}</option>
              ))}
            </select>
          </Field>
        ) : (
          <>
            <TextInput id="io-c-name" label="Client name" value={newClient.name} onChange={(e) => setNewClient((c) => ({ ...c, name: e.target.value }))} />
            <div className="grid gap-4 sm:grid-cols-2">
              <TextInput id="io-c-phone" type="tel" label="Phone / WhatsApp" value={newClient.phone} onChange={(e) => setNewClient((c) => ({ ...c, phone: e.target.value }))} />
              <TextInput id="io-c-email" type="email" label="Email" value={newClient.email} onChange={(e) => setNewClient((c) => ({ ...c, email: e.target.value }))} />
            </div>
          </>
        )}
      </Group>

      <Group title="Invite">
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Event type" htmlFor="io-type">
            <select id="io-type" value={details.eventType ?? ''} onChange={(e) => set('eventType', e.target.value || undefined)} className={inputClass}>
              <option value="">Not set</option>
              {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              {details.eventType && !EVENT_TYPES.includes(details.eventType) && <option value={details.eventType}>{details.eventType}</option>}
            </select>
          </Field>
          <Field label="Template" htmlFor="io-template">
            <select id="io-template" value={details.template ?? ''} onChange={(e) => set('template', e.target.value || undefined)} className={inputClass}>
              <option value="">Decide later</option>
              {templates.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </Field>
          <Field label="Package" htmlFor="io-package">
            <select id="io-package" value={pkg} onChange={(e) => setPkg(e.target.value)} className={inputClass}>
              {PACKAGES.map((p) => <option key={p} value={p}>{p}</option>)}
              {!PACKAGES.includes(pkg) && <option value={pkg}>{pkg}</option>}
            </select>
          </Field>
        </div>
      </Group>

      <Group title="Event details">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="io-name" label="Event name" placeholder="Tracey's 22nd Birthday" {...text('eventName')} />
          <TextInput id="io-host" label="Host / couple names" {...text('hostName')} />
          <TextInput id="io-date" label="Event date" type="date" {...text('eventDate')} />
          <TextInput id="io-time" label="Event time" type="time" {...text('eventTime')} />
          <TextInput id="io-venue" label="Venue" {...text('venue')} />
          <TextInput id="io-address" label="Address" {...text('address')} />
          <TextInput id="io-maps" label="Google Maps link" type="url" placeholder="https://" {...text('mapsUrl')} />
          <TextInput id="io-dress" label="Dress code" {...text('dressCode')} />
        </div>
        <TextArea id="io-desc" label="Message to guests" {...text('description')} />
      </Group>

      <Group title="Order">
        <div className="grid gap-4 sm:grid-cols-2">
          <TextInput id="io-total" label="Total (KSh)" type="number" min={0} step={50} required value={total} onChange={(e) => setTotal(e.target.value)} />
          <Field label="Status" htmlFor="io-status">
            <select id="io-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              {statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>
          </Field>
        </div>
        <TextArea id="io-notes" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
        <p className="text-xs text-muted">The event date is used as the order deadline.</p>
      </Group>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={busy || !ready || !status}>{busy ? 'Saving…' : order ? 'Save changes' : 'Create order'}</Button>
      </div>
    </form>
  )
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <fieldset className="space-y-4">
      <legend className="mb-3 font-display text-base text-plum-900">{title}</legend>
      {children}
    </fieldset>
  )
}
