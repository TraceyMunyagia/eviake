import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState } from '@/components/ui/ErrorState'
import { InviteLivePreview } from '@/features/invites/builder/InviteLivePreview'
import { BuilderTabs } from '@/features/invites/builder/BuilderTabs'
import { DetailsPanel } from '@/features/invites/builder/DetailsPanel'
import type { Invite } from '@/types/database'
import { TemplateSwitcher } from '@/features/invites/builder/TemplateSwitcher'
import { RsvpSettingsPanel } from '@/features/invites/builder/RspvSettingsPanel'
import { PublishButton } from '@/features/invites/builder/PublishButton'
import { DesignPanel } from '@/features/invites/builder/DesignPanel'
import { SectionsPanel } from '@/features/invites/builder/SectionsPanel'
import { MediaPanel } from '@/features/invites/builder/MediaPanel'
import { GuestbookPanel } from '@/features/invites/builder/GuestbookPanel'

export function InviteEditPage() {
  const { id } = useParams()
  const { active, loading: businessLoading } = useBusiness()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('details')
  const [copied, setCopied] = useState<'invite' | 'rsvp' | null>(null)

  const load = useCallback(async () => {
    if (businessLoading) return
    if (!active) {
      setError('No active business is available for this invite.')
      setState('missing')
      return
    }
    if (!id) {
      setError('This invite link is missing an invite ID.')
      setState('missing')
      return
    }
    setState('loading')
    setError(null)
    try {
      const { data, error: err } = await supabase
        .from('invites')
        .select('*')
        .eq('id', id)
        .eq('business_id', active.id)
        .maybeSingle()
      if (err) throw new Error(err.message)
      let loadedInvite = (data as Invite | null) ?? null
      if (loadedInvite?.status === 'published' && !loadedInvite.event_id) {
        const { data: eventId, error: eventError } = await supabase.rpc('ensure_invite_event', { p_invite_id: loadedInvite.id })
        if (eventError) throw new Error(eventError.message)
        loadedInvite = { ...loadedInvite, event_id: eventId as string }
      }
      setInvite(loadedInvite)
      setState(data ? 'ready' : 'missing')
    } catch (err) {
      setInvite(null)
      setError(err instanceof Error ? err.message : 'Could not load this invite.')
      setState('missing')
    }
  }, [active, businessLoading, id])

  useEffect(() => { load() }, [load])

  function copy(text: string, which: 'invite' | 'rsvp') {
    navigator.clipboard.writeText(text)
    setCopied(which)
    setTimeout(() => setCopied(null), 1500)
  }

  if (businessLoading) return <p className="text-sm text-muted">Loading business…</p>
  if (!active) return <ErrorState message={error ?? 'No active business is available.'} onRetry={load} />
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
          {invite.status === 'draft' && <PublishButton invite={invite} onSaved={setInvite} />}
        </div>
      </div>
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
      {invite.status === 'published' && invite.package === 'experience' && invite.event_id && (
        <div className="mb-6 flex flex-wrap gap-4 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <Link to={`/events/${invite.event_id}/check-in`} className="text-sm text-plum-900 underline">Open check-in scanner</Link>
          <Link to={`/events/${invite.event_id}/stats`} className="text-sm text-plum-900 underline">View live stats</Link>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <div className="mb-4"><TemplateSwitcher invite={invite} onSaved={setInvite} /></div>
          <BuilderTabs
            active={tab}
            onChange={setTab}
            extra={invite.template === 'romance' ? [{ key: 'guestbook', label: 'Guestbook' }] : []}
          />
          <div className="mt-4">
            {tab === 'details' && <DetailsPanel invite={invite} onSaved={setInvite} />}
            {tab === 'design' && <DesignPanel invite={invite} onSaved={setInvite} />}
            {tab === 'sections' && <SectionsPanel invite={invite} onSaved={setInvite} />}
            {tab === 'media' && <MediaPanel invite={invite} onSaved={setInvite} />}
            {tab === 'rsvp' && <RsvpSettingsPanel invite={invite} onSaved={setInvite} />}
            {tab === 'guestbook' && invite.template === 'romance' && <GuestbookPanel invite={invite} />}
          </div>
        </div>
        <InviteLivePreview invite={invite} />
      </div>
    </div>
  )
}
