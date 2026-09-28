import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { TextArea, TextInput } from '@/components/ui/Field'
import type { Invite, InviteContent } from '@/types/database'
import { ScheduleEditor } from './ScheduleEditor'
import { StoryEditor } from './StoryEditor'
import { RegistryEditor } from './RegistryEditor'

export function DetailsPanel({ invite, onSaved }: { invite: Invite; onSaved: (invite: Invite) => void }) {
  const [form, setForm] = useState<InviteContent>(invite.content)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  // Resets local form state if the invite prop changes from elsewhere
  // (e.g. after a publish action reloads it).
  useEffect(() => { setForm(invite.content) }, [invite.id])

  function set<K extends keyof InviteContent>(key: K, value: InviteContent[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    setBusy(true)
    setMessage(null)
    const { data, error } = await supabase.from('invites').update({ content: form }).eq('id', invite.id).select('*').single()
    setBusy(false)
    if (error) return setMessage({ ok: false, text: error.message })
    onSaved(data as Invite)
    setMessage({ ok: true, text: 'Saved.' })
  }

  return (
    <div className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <TextInput
        id="d-names"
        label="Couple / event names"
        value={form.couple_names || form.event_name || ''}
        onChange={(e) => set('couple_names', e.target.value)}
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput id="d-date" label="Event date" type="date" value={form.event_date || ''} onChange={(e) => set('event_date', e.target.value)} />
        <TextInput id="d-time" label="Event time" type="time" value={form.event_time || ''} onChange={(e) => set('event_time', e.target.value)} />
      </div>
      <TextInput id="d-venue" label="Venue" value={form.venue || ''} onChange={(e) => set('venue', e.target.value)} />
      <TextInput id="d-dress" label="Dress code" value={form.dress_code || ''} onChange={(e) => set('dress_code', e.target.value)} />
      <TextArea id="d-desc" label="Description / message to guests" value={form.description || ''} onChange={(e) => set('description', e.target.value)} />
      <ScheduleEditor items={form.schedule || []} onChange={(schedule) => set('schedule', schedule)} />
      <StoryEditor items={form.story_items || []} onChange={(story_items) => set('story_items', story_items)} />
      <TextArea id="d-gift-msg" label="Gift message (optional)" value={form.gift_message || ''} onChange={(e) => set('gift_message', e.target.value)} />
      <RegistryEditor items={form.registries || []} onChange={(registries) => set('registries', registries)} />
      <TextArea id="d-closing" label="Closing message" value={form.closing_message || ''} onChange={(e) => set('closing_message', e.target.value)} />
      <TextInput id="d-hashtag" label="Event hashtag (without #)" value={form.hashtag || ''} onChange={(e) => set('hashtag', e.target.value)} />
      <RegistryEditor
      idPrefix="soc"
      title="Social links"
      nameLabel="Platform"
      namePlaceholder="Instagram"
      items={form.social_links || []}
      onChange={(social_links) => set('social_links', social_links)}/>
      <TextArea id="d-invite-msg" label="Invitation message (leave blank for an auto-generated line)" value={form.invitation_message || ''} onChange={(e) => set('invitation_message', e.target.value)} />
      <TextInput id="d-invite-sig" label={'Signature (e.g. "The Otieno & Wanjiru families")'} value={form.invitation_signature || ''} onChange={(e) => set('invitation_signature', e.target.value)} />
      <TextInput id="d-about-title" label="Story heading" placeholder="How it began" value={form.about_title || ''} onChange={(e) => set('about_title', e.target.value)} />
      <TextArea id="d-about-text" label="Story text" value={form.about_text || ''} onChange={(e) => set('about_text', e.target.value)} />
      <TextInput id="d-dress" label="Dress code" value={form.dress_code || ''} onChange={(e) => set('dress_code', e.target.value)} />
      <TextArea id="d-dress-note" label="Dress code notes" value={form.dress_code_note || ''} onChange={(e) => set('dress_code_note', e.target.value)} />
      <TextInput id="d-address" label="Address" value={form.address || ''} onChange={(e) => set('address', e.target.value)} />
      <TextInput id="d-parking" label="Parking notes" value={form.parking_info || ''} onChange={(e) => set('parking_info', e.target.value)} />
      <TextInput id="d-welcome-quote" label="Quote (optional — shown above the welcome message)" value={form.welcome_quote || ''} onChange={(e) => set('welcome_quote', e.target.value)} />
      {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-sm text-green-800' : 'text-sm text-red-700'}>{message.text}</p>}
      <Button onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save details'}</Button>
      <p className="text-xs text-muted">The preview on the right updates once you save — live-as-you-type comes with the Design tab next week.</p>
    </div>
  )
}
