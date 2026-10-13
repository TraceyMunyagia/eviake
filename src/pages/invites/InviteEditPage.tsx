import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { publicInviteUrl, rsvpTrackUrl } from '@/lib/inviteLinks'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Copy } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState } from '@/components/ui/ErrorState'
import { InviteLivePreview } from '@/features/invites/builder/InviteLivePreview'
import { DesignStep } from '@/features/invites/design/DesignStep'
import { carryTokens } from '@/features/invites/design/tokenModel'
import { useInviteFonts } from '@/features/invites/design/useInviteFonts'
import { BuilderSteps, StepNav, type StepId } from '@/features/invites/builder/BuilderSteps'
import { useBuilderStep } from '@/features/invites/builder/useBuilderStep'
import { DetailsStep } from '@/features/invites/builder/DetailsStep'
import { PublishStep } from '@/features/invites/builder/PublishStep'
import { runPublishChecks } from '@/features/invites/builder/publishChecks'
import { previewScrollTo } from '@/features/invites/builder/previewBridge'
import type { InvitePatch } from '@/features/invites/builder/content/PanelContext'
import { StepTemplate } from '@/features/invites/builder/StepTemplate'
import { StepSections } from '@/features/invites/builder/StepSections'
import { carryFlags, resolveSections, type SectionFlags } from '@/features/invites/sections/sectionModel'
import type { PackageKey, SectionKey, TemplateKey } from '@/features/invites/sections/catalog'
import type { Invite } from '@/types/database'

export function InviteEditPage() {
  const { id } = useParams()
  const { active, loading: businessLoading } = useBusiness()
  const [invite, setInvite] = useState<Invite | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<SectionKey | null>('hero')
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
      replaceInvite(loadedInvite)
      setState(data ? 'ready' : 'missing')
    } catch (err) {
      replaceInvite(null)
      setError(err instanceof Error ? err.message : 'Could not load this invite.')
      setState('missing')
    }
  }, [active, businessLoading, id])

  useEffect(() => { load() }, [load])

  // A brand-new draft (never saved since it was created) opens on Template; everything else on Details.
  // The step lives in the URL, so a refresh stays put.
  const fresh = !!invite && invite.status === 'draft' && invite.created_at === invite.updated_at
  const [urlStep, setUrlStep] = useBuilderStep(fresh ? 'template' : 'details')

  // The builder page shows font samples, so it loads this invite's fonts too
  useInviteFonts(invite?.tokens)

  // Always work from resolved flags, never the raw column (older invites lack the newer keys)
  const flags = useMemo(
    () => (invite ? resolveSections(invite.sections, invite.template as TemplateKey, invite.package as PackageKey) : {}),
    [invite],
  )

  // ---- Autosave -------------------------------------------------------------------------------
  // Edits apply locally at once (so the preview updates as you type) and are written after a short pause.
  // Only the changed columns are sent, using their latest local values, so quick edits never overwrite each other.
  const inviteRef = useRef<Invite | null>(null)
  const pending = useRef(new Set<keyof Invite>())
  const timer = useRef<number | undefined>(undefined)

  function replaceInvite(next: Invite | null) {
    inviteRef.current = next
    setInvite(next)
  }

  const flush = useCallback(async (): Promise<boolean> => {
    window.clearTimeout(timer.current)
    const current = inviteRef.current
    const keys = [...pending.current]
    if (!current || keys.length === 0) return true
    pending.current.clear()
    setSaving(true)
    const patch = Object.fromEntries(keys.map((k) => [k, current[k]]))
    const { error: err } = await supabase.from('invites').update(patch).eq('id', current.id)
    setSaving(false)
    if (err) {
      keys.forEach((k) => pending.current.add(k)) // retried with the next change or step switch
      setSaveError(`Changes not saved: ${err.message}`)
      return false
    }
    setSaveError(null)
    return true
  }, [])

  function updateInvite(patch: InvitePatch) {
    const current = inviteRef.current
    if (!current) return
    const p = typeof patch === 'function' ? patch(current) : patch
    ;(Object.keys(p) as (keyof Invite)[]).forEach((k) => pending.current.add(k))
    replaceInvite({ ...current, ...p })
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(flush, 700)
  }

  // Save anything pending when leaving the page, and warn if the tab closes mid-save
  useEffect(() => {
    const warn = (e: BeforeUnloadEvent) => { if (pending.current.size) e.preventDefault() }
    window.addEventListener('beforeunload', warn)
    return () => { window.removeEventListener('beforeunload', warn); flush() }
  }, [flush])

  const step = urlStep
  function setStep(s: StepId) {
    flush()
    setUrlStep(s)
  }

  function changeTemplate(t: TemplateKey) {
    if (!invite || t === invite.template) return
    // Colours and fonts still at the old template's defaults move to the new ones; customised values stay
    updateInvite({
      template: t,
      tokens: carryTokens(invite.tokens, invite.template as TemplateKey, t),
      sections: carryFlags(flags, t, invite.package as PackageKey),
    })
  }

  const changeSections = (next: SectionFlags) => updateInvite({ sections: next })

  const checks = useMemo(
    () => (invite ? runPublishChecks(invite.template as TemplateKey, flags, invite.content) : []),
    [invite, flags],
  )

  function fix(s: StepId, section?: SectionKey) {
    setStep(s)
    if (section) {
      setActiveSection(section)
      setTimeout(() => previewScrollTo(section), 150)
    }
  }

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
        <BuilderSteps step={step} onStep={setStep} />
        <span className="text-xs text-muted" aria-live="polite">{saving ? 'Saving…' : saveError ? '' : 'All changes saved'}</span>
      </div>
      {saveError && (
        <p role="alert" className="mb-4 text-sm text-red-700">
          {saveError} <button type="button" className="underline" onClick={() => flush()}>Try again</button>
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        {/* min-w-0: wide content (like the music strip) scrolls inside the column instead of stretching it */}
        <div className="min-w-0">
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
          {step === 'details' && (
            <DetailsStep
              invite={invite}
              template={invite.template as TemplateKey}
              pkg={invite.package as PackageKey}
              flags={flags}
              updateInvite={updateInvite}
              replaceInvite={replaceInvite}
              active={activeSection}
              onActive={setActiveSection}
              onGoSections={() => setStep('sections')}
            />
          )}
          {step === 'design' && (
            <DesignStep
              invite={invite}
              template={invite.template as TemplateKey}
              pkg={invite.package as PackageKey}
              flags={flags}
              updateInvite={updateInvite}
              replaceInvite={replaceInvite}
            />
          )}
          {step === 'publish' && (
            <PublishStep invite={invite} checks={checks} onFix={fix} onPublished={replaceInvite} beforePublish={flush} />
          )}
          <StepNav step={step} onStep={setStep} />
        </div>
        <InviteLivePreview invite={invite} sections={flags} />
      </div>
    </div>
  )
}
