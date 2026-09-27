import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import type { InviteContent } from '@/types/database'

export function WelcomeMessage({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const message =
    content.invitation_message ||
    `With hearts full of joy, ${content.couple_names || 'we'} warmly welcome you to ${
      content.event_type ? `our ${content.event_type.toLowerCase()}` : 'our celebration'
    }.`

  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-md px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        {content.welcome_quote && (
          <p className={romanceType.h3} style={{ fontFamily: 'var(--invite-accent-font)', color: 'var(--invite-accent)' }}>
            "{content.welcome_quote}"
          </p>
        )}
        <p className={`mt-4 ${romanceType.body}`} style={{ fontFamily: 'var(--invite-body-font)', lineHeight: 1.7 }}>
          {message}
        </p>
        {content.invitation_signature && (
          <>
            <Divider className="my-6" />
            <p className={`${romanceType.caption} uppercase tracking-widest`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
              {content.invitation_signature}
            </p>
          </>
        )}
      </section>
    </Reveal>
  )
}