import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import { usePublishInvite } from '@/hooks/usePublishInvite'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState } from '@/components/ui/ErrorState'
import { InviteLivePreview } from '@/features/invites/builder/InviteLivePreview'
import { BuilderTabs } from '@/features/invites/builder/BuilderTabs'
import { DetailsPanel } from '@/features/invites/builder/DetailsPanel'
import type { Invite } from '@/types/database'
import { TemplateSwitcher } from '@/features/invites/builder/TemplateSwitcher'
import { RsvpSettingsPanel } from '@/features/invites/builder/RspvSettingsPanel'

export function InviteEditPage() {
  const { id } = useParams()
  const { active } = useBusiness()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('details')
  const { publish, busy, error: publishError } = usePublishInvite()
  const [copied, setCopied] = useState<'invite' | 'rsvp' | null>(null)

  const load = useCallback(async () => {
    if (!active || !id) return
    setState('loading')
    const { data, error: err } = await supabase.from('invites').select('*').eq('id', id).eq('business_id', active.id).maybeSingle()
    if (err) { setError(err.message); return }
    setError(null)
    setInvite((data as Invite | null) ?? null)
    setState(data ? 'ready' : 'missing')
  }, [active, id])

  useEffect(() => { load() }, [load])

  async function onPublish() {
    if (!invite) return
    const updated = await publish(invite, invite.content.couple_names || invite.content.event_name || '')
    if (updated) setInvite(updated)
  }

  function copy(text: string, which: 'invite' | 'rsvp') {
    navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 1500)
  }

  if (!active) return null
  if (error) return <ErrorState message={error} onRetry={load} />
  if (state === 'loading') return <p className="text-sm text-muted">Loading…</p>
  if (state === 'missing' || !invite) {
    return (
      <div>
        <p className="text-sm">This invite was not found.</p>
        <Link to="/invites" className="mt-2 inline-block text-sm text-plum-900 underline">Back to Invite Builder</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/invites" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Invite Builder
      </Link>

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl capitalize text-plum-900">{invite.template} invite</h1>
          <p className="mt-1 text-sm capitalize text-muted">{invite.package} package</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge tone={invite.status === 'published' ? 'live' : 'pending'}>{invite.status}</StatusBadge>
          {invite.status === 'draft' && <Button onClick={onPublish} disabled={busy}>{busy ? 'Publishing…' : 'Finish up & publish'}</Button>}
        </div>
      </div>
      {publishError && <p role="alert" className="mb-4 text-sm text-red-700">{publishError}</p>}

      {invite.status === 'published' && invite.public_slug && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
            <p className="text-sm text-muted">Invite link</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate text-sm">{window.location.origin}/invite/{invite.public_slug}</code>
              <button onClick={() => copy(`${window.location.origin}/invite/${invite.public_slug}`, 'invite')} className="rounded p-1.5 text-muted hover:bg-gold-100"><Copy className="size-4" /></button>
            </div>
            {copied === 'invite' && <p className="mt-1 text-xs text-green-800">Copied.</p>}
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
            <p className="text-sm text-muted">Client RSVP-tracking link</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate text-sm">{window.location.origin}/rsvp-track/{invite.rsvp_track_token}</code>
              <button onClick={() => copy(`${window.location.origin}/rsvp-track/${invite.rsvp_track_token}`, 'rsvp')} className="rounded p-1.5 text-muted hover:bg-gold-100"><Copy className="size-4" /></button>
            </div>
            {copied === 'rsvp' && <p className="mt-1 text-xs text-green-800">Copied.</p>}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="mb-4"><TemplateSwitcher invite={invite} onSaved={setInvite} /></div>
          <BuilderTabs active={tab} onChange={setTab} />
          <div className="mt-4">
            {tab === 'details' && <DetailsPanel invite={invite} onSaved={setInvite} />}
            {tab === 'design' && <p className="text-sm text-muted">Colours and fonts arrive Week 10.</p>}
            {tab === 'sections' && <p className="text-sm text-muted">Section on/off toggles arrive Week 10.</p>}
            {tab === 'media' && <p className="text-sm text-muted">Hero, gallery, video and logo uploads arrive Week 10.</p>}
            {tab === 'rsvp' && <RsvpSettingsPanel invite={invite} onSaved={setInvite} />}
          </div>
        </div>
        <InviteLivePreview invite={invite} />
      </div>
    </div>
  )
}