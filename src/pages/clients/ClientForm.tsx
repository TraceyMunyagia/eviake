import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { TextArea, TextInput } from '@/components/ui/Field'
import type { Business, Client } from '@/types/database'

export function ClientForm({ business, client, onClose, onSaved }: {
  business: Business
  client: Client | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(client?.name ?? '')
  const [businessName, setBusinessName] = useState(client?.business_name ?? '')
  const [email, setEmail] = useState(client?.email ?? '')
  const [phone, setPhone] = useState(client?.phone ?? '')
  const [notes, setNotes] = useState(client?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)

    const values = {
      name: name.trim(),
      business_name: businessName.trim() || null,
      email: email.trim() || null,
      phone: phone.trim() || null,
      notes: notes.trim() || null,
    }

    const { error: err } = client
      ? await supabase.from('clients').update(values).eq('id', client.id)
      : await supabase.from('clients').insert({ ...values, business_id: business.id })

    setBusy(false)
    if (err) return setError(err.message)
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextInput id="c-name" label="Client name" required value={name} onChange={(e) => setName(e.target.value)} />
      <TextInput id="c-biz" label="Business name" value={businessName} onChange={(e) => setBusinessName(e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput id="c-email" type="email" label="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <TextInput id="c-phone" type="tel" label="Phone / WhatsApp" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <TextArea id="c-notes" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={busy}>{busy ? 'Saving…' : client ? 'Save changes' : 'Add client'}</Button>
      </div>
    </form>
  )
}