import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import { SectionLabel } from '@/features/invites/templates/editorial/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'
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
      <section className="px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <div
          className="mx-auto max-w-lg border px-6 py-10 sm:px-10 sm:py-12"
          style={{ borderColor: 'var(--invite-hairline)', backgroundColor: 'var(--invite-surface)' }}
        >
          <SectionLabel>Kindly Respond</SectionLabel>
          <h2 className={`mt-3 ${editorialType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}>RSVP</h2>
          <Divider className="my-6" />
          {content.description && (
            <p className={`mx-auto max-w-md ${editorialType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
              {content.description}
            </p>
          )}
          <div className="mt-8">
            <SimpleRsvpForm content={content} mode={mode} onRsvp={onRsvp} buttonLabel="Respond" advanced={advanced} />
          </div>
        </div>
      </section>
    </Reveal>
  )
}
