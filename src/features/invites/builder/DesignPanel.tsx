import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/Field'
import type { Invite, InviteTokens } from '@/types/database'

const FONTS = ['Cormorant Garamond', 'Playfair Display', 'Bricolage Grotesque', 'Inter', 'Lora', 'DM Sans', 'Georgia', 'system-ui']

export function DesignPanel({ invite, onSaved }: { invite: Invite; onSaved: (invite: Invite) => void }) {
  const [tokens, setTokens] = useState<InviteTokens>(invite.tokens)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => setTokens(invite.tokens), [invite.id, invite.tokens])

  function set<K extends keyof InviteTokens>(key: K, value: InviteTokens[K]) {
    setTokens((previous) => ({ ...previous, [key]: value }))
  }

  async function save() {
    setBusy(true); setMessage(null)
    const { data, error } = await supabase.from('invites').update({ tokens }).eq('id', invite.id).select('*').single()
    setBusy(false)
    if (error) return setMessage(error.message)
    onSaved(data as Invite); setMessage('Design saved.')
  }

  return <div className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
    <p className="text-sm text-muted">Choose the invitation palette and typography. The preview updates after saving.</p>
    <div className="grid gap-4 sm:grid-cols-3">
      {(['background', 'primary', 'accent'] as const).map((key) => <label key={key} className="block text-sm font-medium capitalize">{key} colour
        <div className="mt-1 flex gap-2"><input type="color" value={tokens[key] || '#ffffff'} onChange={(e) => set(key, e.target.value)} className="h-10 w-12 rounded border border-line bg-white p-1" /><TextInput id={`token-${key}`} label="" value={tokens[key] || ''} onChange={(e) => set(key, e.target.value)} /></div>
      </label>)}
    </div>
    <div className="grid gap-4 sm:grid-cols-3">
      {(['heading_font', 'body_font', 'accent_font'] as const).map((key) => <label key={key} className="block text-sm font-medium capitalize">{key.replace('_', ' ')}
        <select value={tokens[key] || ''} onChange={(e) => set(key, e.target.value)} className="mt-1 w-full rounded-lg border border-line bg-white px-3 py-2 text-sm"><option value="">Default</option>{FONTS.map((font) => <option key={font} value={font}>{font}</option>)}</select>
      </label>)}
    </div>
    {message && <p role="status" className="text-sm text-green-800">{message}</p>}
    <Button type="button" onClick={save} disabled={busy}>{busy ? 'Saving…' : 'Save design'}</Button>
  </div>
}
