import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Field, TextArea, TextInput, inputClass } from '@/components/ui/Field'
import type { Business, Client, EventRecord } from '@/types/database'

const EVENT_TYPES = ['Wedding', 'Corporate', 'Birthday', 'Baby shower', 'Graduation', 'Other']

export function EventForm({ business, event, defaultClientId, onClose, onSaved }: {
  business: Business
  event: EventRecord | null
  defaultClientId?: string
  onClose: () => void
  onSaved: () => void
}) {
  const [clients, setClients] = useState<Client[]>([])
  const [clientId, setClientId] = useState(event?.client_id ?? defaultClientId ?? '')
  const [name, setName] = useState(event?.name ?? '')
  const [eventType, setEventType] = useState(event?.event_type ?? '')
  const [eventDate, setEventDate] = useState(event?.event_date ?? '')
  const [venue, setVenue] = useState(event?.venue ?? '')
  const [notes, setNotes] = useState(event?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    supabase.from('clients').select('*').eq('business_id', business.id).order('name').then(({ data }) => setClients((data ?? []) as Client[]))
  }, [business.id])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!clientId) return setError('Choose a client.')
    setBusy(true)
    setError(null)
    const values = {
      client_id: clientId,
      name: name.trim(),
      event_type: eventType || null,
      event_date: eventDate || null,
      venue: venue.trim() || null,
      notes: notes.trim() || null,
    }
    const { error: err } = event
      ? await supabase.from('events').update(values).eq('id', event.id)
      : await supabase.from('events').insert({ ...values, business_id: business.id })
    setBusy(false)
    if (err) return setError(err.message)
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field label="Client" htmlFor="ev-client">
        <select id="ev-client" value={clientId} onChange={(e) => setClientId(e.target.value)} className={inputClass} required>
          <option value="">Select a client</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </Field>
      <TextInput id="ev-name" label="Event name" required value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Event type" htmlFor="ev-type">
          <select id="ev-type" value={eventType} onChange={(e) => setEventType(e.target.value)} className={inputClass}>
            <option value="">Not set</option>
            {EVENT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </Field>
        <TextInput id="ev-date" label="Event date" type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} />
      </div>
      <TextInput id="ev-venue" label="Venue" value={venue} onChange={(e) => setVenue(e.target.value)} />
      <TextArea id="ev-notes" label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={busy}>{busy ? 'Saving…' : event ? 'Save changes' : 'Create event'}</Button>
      </div>
    </form>
  )
}