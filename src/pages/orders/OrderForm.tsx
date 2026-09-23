import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Field, TextArea, TextInput, inputClass } from '@/components/ui/Field'
import type { Business, Order, OrderStatus, PriceItem } from '@/types/database'

type ClientOption = { id: string; name: string; business_name: string | null }

export function OrderForm({ business, order, statuses, onClose, onSaved }: {
  business: Business
  order: Order | null
  statuses: OrderStatus[]
  onClose: () => void
  onSaved: () => void
}) {
  const [clients, setClients] = useState<ClientOption[]>([])
  const [packages, setPackages] = useState<PriceItem[]>([])
  const [ready, setReady] = useState(false)

  const [clientId, setClientId] = useState(order?.client_id ?? '')
  const [pkg, setPkg] = useState(order?.package ?? '')
  const [total, setTotal] = useState(order ? String(order.total_kes) : '')
  const [totalTouched, setTotalTouched] = useState(!!order)
  const [status, setStatus] = useState(order?.status ?? statuses[0]?.key ?? '')
  const [deadline, setDeadline] = useState(order?.deadline ?? '')
  const [notes, setNotes] = useState(order?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      supabase.from('clients').select('id, name, business_name').eq('business_id', business.id).order('name'),
      supabase.from('price_items').select('*').eq('business_id', business.id).eq('kind', 'package').eq('active', true).order('sort_order'),
    ]).then(([c, p]) => {
      setClients((c.data ?? []) as ClientOption[])
      setPackages((p.data ?? []) as PriceItem[])
      setReady(true)
    })
  }, [business.id])

  function choosePackage(name: string) {
    setPkg(name)
    const match = packages.find((p) => p.name === name)
    if (match && !totalTouched) setTotal(String(match.price_kes))
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const values = {
      client_id: clientId,
      package: pkg || null,
      total_kes: Number(total) || 0,
      status,
      deadline: deadline || null,
      notes: notes.trim() || null,
    }
    const { error: err } = order
      ? await supabase.from('orders').update(values).eq('id', order.id)
      : await supabase.from('orders').insert({ ...values, business_id: business.id })
    setBusy(false)
    if (err) return setError(err.message)
    onSaved()
  }

  const packageNames = packages.map((p) => p.name)
  const showCurrentPackage = pkg && !packageNames.includes(pkg)

  if (ready && clients.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm">Add a client first, then come back to create an order for them.</p>
        <div className="flex justify-end"><Button variant="secondary" onClick={onClose}>Close</Button></div>
      </div>
    )
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Client" htmlFor="o-client">
        <select id="o-client" required value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass}>
          <option value="" disabled>Choose a client</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>{c.name}{c.business_name ? ` (${c.business_name})` : ''}</option>
          ))}
        </select>
      </Field>

      <Field label="Package" htmlFor="o-package">
        <select id="o-package" value={pkg} onChange={(e) => choosePackage(e.target.value)} className={inputClass}>
          <option value="">No package / custom</option>
          {showCurrentPackage && <option value={pkg}>{pkg}</option>}
          {packages.map((p) => <option key={p.id} value={p.name}>{p.name}</option>)}
        </select>
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput
          id="o-total" label="Total (KSh)" type="number" min={0} step={50} required value={total}
          onChange={(e) => { setTotal(e.target.value); setTotalTouched(true) }}
        />
        <TextInput id="o-deadline" label="Deadline" type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} />
      </div>

      <Field label="Status" htmlFor="o-status">
        <select id="o-status" value={status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
          {statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </Field>

      <TextArea id="o-notes" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={busy || !ready || !status}>{busy ? 'Saving…' : order ? 'Save changes' : 'Create order'}</Button>
      </div>
    </form>
  )
}