import { celebrationType } from '@/features/invites/templates/celebration/type'
import { Reveal } from '@/features/invites/templates/celebration/components/Reveal'
import type { InviteContent } from '@/types/database'

export function EventIntro({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const name = content.couple_names || content.event_name
  const message =
    content.invitation_message ||
    `Get ready! ${name || 'The party'} is happening and you're on the guest list. Come ready to celebrate.`

  return (
    <section
      className="px-5 py-16 sm:px-10 sm:py-24"
      style={{ backgroundColor: 'var(--invite-secondary)', color: 'var(--invite-primary)' }}
    >
      <Reveal mode={mode} className="mx-auto max-w-4xl">
        <span
          className={`inline-block rotate-2 rounded-full border-2 px-4 py-1.5 ${celebrationType.kicker}`}
          style={{ borderColor: 'var(--invite-primary)', backgroundColor: 'var(--invite-background)', fontFamily: 'var(--invite-body-font)' }}
        >
          The lowdown
        </span>
        <p className={`mt-6 ${celebrationType.statement}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>
          {message}
        </p>
        {content.invitation_signature && (
          <p className="mt-8 text-3xl sm:text-4xl" style={{ fontFamily: 'var(--invite-accent-font)' }}>
            {content.invitation_signature}
          </p>
        )}
      </Reveal>
    </section>
  )
}