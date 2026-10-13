import { useCallback, useEffect, useMemo, useState } from 'react'
import { publicInviteUrl, rsvpTrackUrl } from '@/lib/inviteLinks'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState } from '@/components/ui/ErrorState'
import { InviteLivePreview } from '@/features/invites/builder/InviteLivePreview'
import { BuilderTabs } from '@/features/invites/builder/BuilderTabs'
import { BuilderSteps, StepNav, type StepId } from '@/features/invites/builder/BuilderSteps'
import { StepTemplate } from '@/features/invites/builder/StepTemplate'
import { StepSections } from '@/features/invites/builder/StepSections'
import { carryFlags, resolveSections, type SectionFlags } from '@/features/invites/sections/sectionModel'
import type { PackageKey, TemplateKey } from '@/features/invites/sections/catalog'
import { buildInviteDefaults } from '@/lib/inviteDefaults'
import { DetailsPanel } from '@/features/invites/builder/DetailsPanel'
import type { Invite } from '@/types/database'
import { RsvpSettingsPanel } from '@/features/invites/builder/RspvSettingsPanel'
import { PublishButton } from '@/features/invites/builder/PublishButton'
import { DesignPanel } from '@/features/invites/builder/DesignPanel'
import { MediaPanel } from '@/features/invites/builder/MediaPanel'
import { GuestbookPanel } from '@/features/invites/builder/GuestbookPanel'

export function InviteEditPage() {
  const { id } = useParams()
  const { active, loading: businessLoading } = useBusiness()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [step, setStep] = useState<StepId | null>(null)
  const [detailsTab, setDetailsTab] = useState('details')
  const [designTab, setDesignTab] = useState('design')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
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
      // A brand-new draft (never saved since it was created) opens on Template; everything else on Details
      if (loadedInvite) {
        const fresh = loadedInvite.status === 'draft' && loadedInvite.created_at === loadedInvite.updated_at
        setStep((current) => current ?? (fresh ? 'template' : 'details'))
      }
      setState(data ? 'ready' : 'missing')
    } catch (err) {
      setInvite(null)
      setError(err instanceof Error ? err.message : 'Could not load this invite.')
      setState('missing')
    }
  }, [active, businessLoading, id])

  useEffect(() => { load() }, [load])

  // Always work from resolved flags, never the raw column (older invites lack the newer keys)
  const flags = useMemo(
    () => (invite ? resolveSections(invite.sections, invite.template as TemplateKey, invite.package as PackageKey) : {}),
    [invite],
  )

  // Optimistic, so the preview updates straight away; rolled back if the save fails
  async function patchInvite(patch: Partial<Invite>) {
    if (!invite) return
    const previous = invite
    setInvite({ ...invite, ...patch })
    setSaving(true)
    setSaveError(null)
    const { data, error: err } = await supabase.from('invites').update(patch).eq('id', invite.id).select('*').single()
    setSaving(false)
    if (err) {
      setInvite(previous)
      return setSaveError(err.message)
    }
    setInvite(data as Invite)
  }

  function changeTemplate(t: TemplateKey) {
    if (!invite || t === invite.template) return
    // The old palette was chosen for the previous look, so colours and fonts reset to the new template's defaults
    patchInvite({
      template: t,
      tokens: buildInviteDefaults(t, invite.package).tokens,
      sections: carryFlags(flags, t, invite.package as PackageKey),
    })
  }

  const changeSections = (next: SectionFlags) => patchInvite({ sections: next })

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
        </div>
      </div>
      {invite.status === 'published' && invite.public_slug && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
            <p className="text-sm text-muted">Invite link</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate text-sm">{publicInviteUrl(invite.public_slug)}</code>
              <button onClick={() => copy(publicInviteUrl(invite.public_slug!), 'invite')} className="rounded p-1.5 text-muted hover:bg-gold-100"><Copy className="size-4" /></button>
            </div>
            {copied === 'invite' && <p className="mt-1 text-xs text-green-800">Copied.</p>}
          </div>
          <div className="rounded-2xl border border-line bg-white p-4 shadow-sm">
            <p className="text-sm text-muted">Client RSVP-tracking link</p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate text-sm">{rsvpTrackUrl(invite.rsvp_track_token ?? '')}</code>
              <button onClick={() => copy(rsvpTrackUrl(invite.rsvp_track_token ?? ''), 'rsvp')} className="rounded p-1.5 text-muted hover:bg-gold-100"><Copy className="size-4" /></button>
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

      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <BuilderSteps step={step ?? 'details'} onStep={setStep} />
        {saving && <span className="text-xs text-muted">Saving…</span>}
      </div>
      {saveError && <p role="alert" className="mb-4 text-sm text-red-700">{saveError}</p>}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          {step === 'template' && (
            <StepTemplate template={invite.template as TemplateKey} locked={invite.status === 'published'} busy={saving} onSelect={changeTemplate} />
          )}
          {step === 'sections' && (
            <StepSections
              template={invite.template as TemplateKey}
              pkg={invite.package as PackageKey}
              flags={flags}
              content={invite.content}
              busy={saving}
              onChange={changeSections}
            />
          )}
          {(step ?? 'details') === 'details' && (
            <>
              <BuilderTabs
                tabs={[
                  { key: 'details', label: 'Details' },
                  { key: 'rsvp', label: 'RSVP' },
                  ...(invite.template === 'romance' ? [{ key: 'guestbook', label: 'Guestbook' }] : []),
                ]}
                active={detailsTab}
                onChange={setDetailsTab}
              />
              <div className="mt-4">
                {detailsTab === 'details' && <DetailsPanel invite={invite} onSaved={setInvite} />}
                {detailsTab === 'rsvp' && <RsvpSettingsPanel invite={invite} onSaved={setInvite} />}
                {detailsTab === 'guestbook' && invite.template === 'romance' && <GuestbookPanel invite={invite} />}
              </div>
            </>
          )}
          {step === 'design' && (
            <>
              <BuilderTabs tabs={[{ key: 'design', label: 'Design' }, { key: 'media', label: 'Media' }]} active={designTab} onChange={setDesignTab} />
              <div className="mt-4">
                {designTab === 'design' && <DesignPanel invite={invite} onSaved={setInvite} />}
                {designTab === 'media' && <MediaPanel invite={invite} onSaved={setInvite} />}
              </div>
            </>
          )}
          {step === 'publish' && (
            <div className="space-y-3 rounded-2xl border border-line bg-white p-5 shadow-sm">
              <h2 className="font-display text-lg text-plum-900">Publish</h2>
              {invite.status === 'draft' ? (
                <>
                  <p className="text-sm text-muted">Publishing creates the guest link and the client's RSVP-tracking link. Check the preview first.</p>
                  <PublishButton invite={invite} onSaved={setInvite} />
                </>
              ) : (
                <p className="text-sm text-muted">This invite is live. Its guest and RSVP-tracking links are at the top of this page.</p>
              )}
            </div>
          )}
          <StepNav step={step ?? 'details'} onStep={setStep} />
        </div>
        <InviteLivePreview invite={invite} sections={flags} />
      </div>
    </div>
  )
}
