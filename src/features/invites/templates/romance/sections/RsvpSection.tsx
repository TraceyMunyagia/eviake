import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import type { InviteContent } from '@/types/database'
import { SimpleRsvpForm } from '@/features/invites/templates/shared/SimpleRsvpForm'
import type { TemplateProps } from '@/features/invites/templates/types'

export function RsvpSection({ content, mode, onRsvp, advanced, guestManagement }: {
  content: InviteContent
  mode?: 'preview' | 'public'
  onRsvp?: TemplateProps['onRsvp']
  advanced?: boolean
  guestManagement?: boolean
}) {  return (
    <Reveal mode={mode}>
      <section className="px-6 py-16 text-center sm:py-24" style={{ backgroundColor: 'var(--invite-surface)', color: 'var(--invite-primary)' }}>
        <SectionLabel>We'd love to know</SectionLabel>
        <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>RSVP</h2>
        <Divider className="my-6" />
        {content.description && (
          <p className={`mx-auto max-w-md ${romanceType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            {content.description}
          </p>
        )}
        <div className="mt-8">
          <SimpleRsvpForm content={content} mode={mode} onRsvp={onRsvp} rounded buttonLabel="Respond with love" advanced={advanced} />
        </div>
      </section>
    </Reveal>
  )
}
