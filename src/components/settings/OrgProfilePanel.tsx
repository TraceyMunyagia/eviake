import { useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/Field'
import { ErrorState } from '@/components/ui/ErrorState'

export function OrgProfilePanel() {
  const { active, refresh } = useBusiness()
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function load() {
    if (!active) return
    setLoading(true)
    const { data, error } = await supabase.from('businesses').select('display_name, support_email, support_phone').eq('id', active.id).single()
    if (error) { setLoadError(error.message); setLoading(false); return }
    setLoadError(null)
    setDisplayName(data.display_name ?? active.name)
    setEmail(data.support_email ?? '')
    setPhone(data.support_phone ?? '')
    setLoading(false)
  }

  useEffect(() => { load() }, [active])

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!active) return
    setBusy(true)
    setMessage(null)
    const { error } = await supabase
      .from('businesses')
      .update({ display_name: displayName.trim() || null, support_email: email.trim() || null, support_phone: phone.trim() || null })
      .eq('id', active.id)
    setBusy(false)
    if (error) return setMessage({ ok: false, text: error.message })
    setMessage({ ok: true, text: 'Saved.' })
    await refresh()
  }

  if (loadError) return <div className="mt-6"><ErrorState message={loadError} onRetry={load} /></div>
  if (loading) return <p className="mt-6 text-sm text-muted">Loading…</p>

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-lg space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg text-plum-900">Organization profile</h2>
      <TextInput id="org-name" label="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      <TextInput id="org-email" label="Support email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextInput id="org-phone" label="Support phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
      {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-sm text-green-800' : 'text-sm text-red-700'}>{message.text}</p>}
      <Button disabled={busy}>{busy ? 'Saving…' : 'Save changes'}</Button>
    </form>
  )
}
