import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Field, TextArea, TextInput, inputClass } from '@/components/ui/Field'
import type { Order, Revision, RevisionStatus } from '@/types/database'

export const REVISION_LABEL: Record<RevisionStatus, string> = {
  requested: 'Requested',
  in_progress: 'In progress',
  done: 'Done',
}

export function RevisionForm({ order, revision, onClose, onSaved }: {
  order: Order
  revision: Revision | null
  onClose: () => void
  onSaved: () => void
}) {
  const [title, setTitle] = useState(revision?.title ?? '')
  const [description, setDescription] = useState(revision?.description ?? '')
  const [requestedOn, setRequestedOn] = useState(revision?.requested_on ?? new Date().toISOString().slice(0, 10))
  const [status, setStatus] = useState<RevisionStatus>(revision?.status ?? 'requested')
  const [notes, setNotes] = useState(revision?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const values = {
      title: title.trim(),
      description: description.trim() || null,
      requested_on: requestedOn,
      status,
      notes: notes.trim() || null,
    }
    const { error: err } = revision
      ? await supabase.from('revisions').update(values).eq('id', revision.id)
      : await supabase.from('revisions').insert({ ...values, business_id: order.business_id, order_id: order.id })
    setBusy(false)
    if (err) return setError(err.message)
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextInput id="rv-title" label="What needs changing" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextArea id="rv-desc" label="Details from the client" value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput id="rv-date" label="Date requested" type="date" required value={requestedOn} onChange={(e) => setRequestedOn(e.target.value)} />
        <Field label="Status" htmlFor="rv-status">
          <select id="rv-status" value={status} onChange={(e) => setStatus(e.target.value as RevisionStatus)} className={inputClass}>
            {Object.entries(REVISION_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
        </Field>
      </div>
      <TextArea id="rv-notes" label="Your notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={busy}>{busy ? 'Saving…' : revision ? 'Save changes' : 'Log revision'}</Button>
      </div>
    </form>
  )
}