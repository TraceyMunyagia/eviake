import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import type { Invite, InviteSections } from '@/types/database'

const LABELS: { key: keyof InviteSections; label: string; description: string }[] = [
  { key: 'countdown', label: 'Countdown', description: 'Show the time remaining until the event.' },
  { key: 'schedule', label: 'Schedule', description: 'Show the event programme.' },
  { key: 'gallery', label: 'Gallery', description: 'Show the invitation photo gallery.' },
  { key: 'video', label: 'Video', description: 'Show an event video.' },
  { key: 'rsvp', label: 'RSVP', description: 'Collect guest responses.' },
  { key: 'guestbook', label: 'Guestbook', description: 'Reserve space for guest messages.' },
  { key: 'guest_management', label: 'Guest management', description: 'Enable guest pass and check-in features.' },
]

export function SectionsPanel({ invite, onSaved }: { invite: Invite; onSaved: (invite: Invite) => void }) {
  const [sections, setSections] = useState<InviteSections>(invite.sections)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  useEffect(() => setSections(invite.sections), [invite.id, invite.sections])

  async function save() {
    setBusy(true); setMessage(null)
    const { data, error } = await supabase.from('invites').update({ sections }).eq('id', invite.id).select('*').single()
    setBusy(false)
    if (error) return setMessage(error.message)
    onSaved(data as Invite); setMessage('Sections saved.')
  }

  return <div className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
    <p className="text-sm text-muted">Choose which sections appear in the published invitation.</p>
    <div className="space-y-2">{LABELS.map(({ key, label, description }) => <label key={key} className="flex items-start gap-3 rounded-lg border border-line p-3"><input type="checkbox" checked={Boolean(sections[key])} onChange={(e) => setSections((previous) => ({ ...previous, [key]: e.target.checked }))} className="mt-1 size-4 accent-plum-800" /><span><span className="block text-sm font-medium">{label}</span><span className="block text-xs text-muted">{description}</span></span></label>)}</div>
    {message && <p role="status" className="text-sm text-green-800">{message}</p>}
    <Button type="button" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save sections'}</Button>
  </div>
}
