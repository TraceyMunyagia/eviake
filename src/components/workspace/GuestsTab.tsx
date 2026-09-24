import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TextInput } from '@/components/ui/Field'
import { StatusBadge, type Tone } from '@/components/ui/StatusBadge'
import type { EventRecord, Guest, RsvpStatus } from '@/types/database'

const RSVP_LABEL: Record<RsvpStatus, string> = { pending: 'Pending', attending: 'Attending', declined: 'Declined' }
const RSVP_TONE: Record<RsvpStatus, Tone> = { pending: 'pending', attending: 'live', declined: 'overdue' }

type Row = Guest & { rsvps: { status: RsvpStatus } | null }

export function GuestsTab({ event }: { event: EventRecord }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Guest | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase.from('guests').select('*, rsvps(status)').eq('event_id', event.id).order('name')
    setError(err ? err.message : null)
    setRows((data ?? []) as unknown as Row[])
    setLoading(false)
  }, [event.id])

  useEffect(() => {
    load()
  }, [load])

  async function remove(guest: Guest) {
    setRows((prev) => prev.filter((g) => g.id !== guest.id))
    const { error: err } = await supabase.from('guests').delete().eq('id', guest.id)
    if (err) {
      setError(err.message)
      load()
    }
  }

  const totalHeads = rows.reduce((s, g) => s + 1 + g.plus_ones, 0)

  return (
    <div className="mt-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted">{rows.length} guest{rows.length === 1 ? '' : 's'} · {totalHeads} expected with plus-ones</p>
        <Button onClick={() => setEditing('new')}><Plus className="size-4" /> Add guest</Button>
      </div>

      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>{['Name', 'Group', 'Contact', 'Plus ones', 'RSVP', ''].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((g) => (
              <tr key={g.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{g.name}</td>
                <td className="px-4 py-3">{g.group_name || '–'}</td>
                <td className="px-4 py-3">{g.phone || g.email || '–'}</td>
                <td className="px-4 py-3">{g.plus_ones}</td>
                <td className="px-4 py-3"><StatusBadge tone={RSVP_TONE[g.rsvps?.status ?? 'pending']}>{RSVP_LABEL[g.rsvps?.status ?? 'pending']}</StatusBadge></td>
                <td className="px-4 py-3 text-right">
                  <button aria-label={`Edit ${g.name}`} onClick={() => setEditing(g)} className="rounded-lg p-1.5 text-muted hover:bg-gold-100"><Pencil className="size-4" /></button>
                  <button aria-label={`Remove ${g.name}`} onClick={() => remove(g)} className="rounded-lg p-1.5 text-muted hover:text-red-700"><Trash2 className="size-4" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && <p className="p-6 text-center text-sm text-muted">No guests yet.</p>}
      </div>

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Add guest' : 'Edit guest'}>
        {editing !== null && (
          <GuestForm event={event} guest={editing === 'new' ? null : editing} onClose={() => setEditing(null)} onSaved={() => { setEditing(null); load() }} />
        )}
      </Modal>
    </div>
  )
}

function GuestForm({ event, guest, onClose, onSaved }: {
  event: EventRecord
  guest: Guest | null
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(guest?.name ?? '')
  const [group, setGroup] = useState(guest?.group_name ?? '')
  const [phone, setPhone] = useState(guest?.phone ?? '')
  const [email, setEmail] = useState(guest?.email ?? '')
  const [plusOnes, setPlusOnes] = useState(String(guest?.plus_ones ?? 0))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const values = {
      name: name.trim(),
      group_name: group.trim() || null,
      phone: phone.trim() || null,
      email: email.trim() || null,
      plus_ones: Math.max(0, Math.floor(Number(plusOnes) || 0)),
    }
    const { error: err } = guest
      ? await supabase.from('guests').update(values).eq('id', guest.id)
      : await supabase.from('guests').insert({ ...values, event_id: event.id, business_id: event.business_id })
    setBusy(false)
    if (err) return setError(err.message)
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextInput id="g-name" label="Guest name" required value={name} onChange={(e) => setName(e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput id="g-group" label="Group (family, work, ...)" value={group} onChange={(e) => setGroup(e.target.value)} />
        <TextInput id="g-plus" label="Plus ones" type="number" min={0} step={1} value={plusOnes} onChange={(e) => setPlusOnes(e.target.value)} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput id="g-phone" label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <TextInput id="g-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={busy}>{busy ? 'Saving…' : guest ? 'Save changes' : 'Add guest'}</Button>
      </div>
    </form>
  )
}