import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'
import type { InviteContent } from '@/types/database'

export function InvitationMessage({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const message =
    content.invitation_message ||
    `Together with their families, ${content.couple_names || 'we'} joyfully invite you to share in ${
      content.event_type ? `their ${content.event_type.toLowerCase()}` : 'this celebration'
    }.`

  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-md px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <p
          className={`${editorialType.h3} italic`}
          style={{ fontFamily: 'var(--invite-heading-font)', lineHeight: 1.6 }}
        >
          {message}
        </p>
        {content.invitation_signature && (
          <>
            <Divider className="my-6" />
            <p className={`${editorialType.caption} uppercase tracking-widest`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
              {content.invitation_signature}
            </p>
          </>
        )}
      </section>
    </Reveal>
  )
}