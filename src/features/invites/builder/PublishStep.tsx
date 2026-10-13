import type { Invite } from '@/types/database'
import { CopyLinkButton } from '@/features/invites/CopyLinkButton'
import { publicInviteUrl, rsvpTrackUrl } from '@/lib/inviteLinks'
import { PublishButton } from './PublishButton'
import type { StepId } from './BuilderSteps'
import type { SectionKey } from '../sections/catalog'
import type { Check } from './publishChecks'

export function PublishStep({ invite, checks, onFix, onPublished, beforePublish }: {
  invite: Invite
  checks: Check[]
  onFix: (step: StepId, section?: SectionKey) => void
  onPublished: (invite: Invite) => void
  beforePublish: () => Promise<boolean>
}) {
  const errors = checks.filter((c) => c.level === 'error')
  const warns = checks.filter((c) => c.level === 'warn')
  const live = invite.status === 'published' && !!invite.public_slug

  return (
    <div className="space-y-4">
      <div>
        <h2 className="font-display text-lg text-plum-900">Publish</h2>
        <p className="text-sm text-muted">
          {live ? 'This invite is live. Changes you make now show on the public link straight away.' : 'Check the list, then publish. You can keep editing after.'}
        </p>
      </div>

      {checks.length === 0 ? (
        <p className="rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-800">Everything looks ready.</p>
      ) : (
        <ul className="space-y-2">
          {[...errors, ...warns].map((c, i) => (
            <li key={i} className={`flex items-center justify-between gap-3 rounded-xl border p-2.5 text-sm ${c.level === 'error' ? 'border-red-200 bg-red-50 text-red-800' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
              <span>{c.level === 'error' ? '✕' : '⚠'} {c.message}</span>
              <button type="button" className="shrink-0 underline underline-offset-4" onClick={() => onFix(c.step, c.section)}>Fix</button>
            </li>
          ))}
        </ul>
      )}

      {!live && (
        <div>
          <PublishButton invite={invite} onSaved={onPublished} disabled={errors.length > 0} beforePublish={beforePublish} />
          {errors.length > 0 && <p className="mt-2 text-xs text-muted">Fix the items marked ✕ to publish.</p>}
        </div>
      )}

      {live && (
        <div className="space-y-2 rounded-2xl border border-line bg-white p-4 shadow-sm">
          <p className="text-sm font-medium">Links</p>
          <div className="flex flex-wrap gap-2">
            <CopyLinkButton url={publicInviteUrl(invite.public_slug!)} label="Copy invite link" />
            {invite.rsvp_track_token && <CopyLinkButton url={rsvpTrackUrl(invite.rsvp_track_token)} label="Copy RSVP tracker link" />}
          </div>
          <p className="text-xs text-muted">The same links are always on the Invitations page.</p>
        </div>
      )}
    </div>
  )
}
