import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useInviteTemplates } from '@/hooks/useInviteTemplates'
import { buildInviteDefaults } from '@/lib/inviteDefaults'
import { Button } from '@/components/ui/Button'
import { inputClass } from '@/components/ui/Field'
import type { Invite, InviteTemplateKey } from '@/types/database'

export function TemplateSwitcher({ invite, onSaved }: { invite: Invite; onSaved: (invite: Invite) => void }) {
  const { templates } = useInviteTemplates()
  const [value, setValue] = useState<InviteTemplateKey>(invite.template)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function apply() {
    if (value === invite.template) return
    setBusy(true)
    setError(null)
    // Switching template resets tokens to that template's defaults, since
    // the old palette was chosen to suit the previous look. Content and
    // package-based sections carry over unchanged.
    const defaults = buildInviteDefaults(value, invite.package)
    const { data, error: err } = await supabase
      .from('invites')
      .update({ template: value, tokens: defaults.tokens })
      .eq('id', invite.id)
      .select('*')
      .single()
    setBusy(false)
    if (err) return setError(err.message)
    onSaved(data as Invite)
  }

  if (invite.status === 'published') return null // avoid changing the look of something already shared

  return (
    <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
      <p className="mb-2 text-sm font-medium text-plum-900">Template</p>
      <div className="flex flex-wrap items-center gap-2">
        <select value={value} onChange={(e) => setValue(e.target.value as InviteTemplateKey)} className={inputClass}>
          {templates.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
        </select>
        <Button type="button" variant="secondary" onClick={apply} disabled={busy || value === invite.template}>
          {busy ? 'Switching…' : 'Switch template'}
        </Button>
      </div>
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}