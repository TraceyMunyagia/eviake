import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'
import type { InviteContent } from '@/types/database'

export function Closing({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  return (
    <Reveal mode={mode}>
      <section className="px-6 py-20 text-center sm:py-28" style={{ color: 'var(--invite-primary)' }}>
        <p className={`mx-auto max-w-md ${editorialType.body} italic`} style={{ fontFamily: 'var(--invite-heading-font)' }}>
          {content.closing_message || 'We can\'t wait to celebrate with you.'}
        </p>
        <Divider className="my-6" />
        <p className={editorialType.h3} style={{ fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}>
          {content.couple_names || content.event_name}
        </p>
        {content.event_date && (
          <p className={`mt-2 ${editorialType.caption} uppercase tracking-widest`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            {content.event_date}
          </p>
        )}
      </section>
    </Reveal>
  )
}