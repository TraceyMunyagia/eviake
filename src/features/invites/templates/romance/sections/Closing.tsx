import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import type { InviteContent } from '@/types/database'

export function Closing({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  return (
    <Reveal mode={mode}>
      <section className="px-6 py-20 text-center sm:py-28" style={{ color: 'var(--invite-primary)' }}>
        {content.closing_image_url && (
          <img
            src={content.closing_image_url}
            alt=""
            className="mx-auto mb-6 h-40 w-40 rounded-full border-4 object-cover shadow-md"
            style={{ borderColor: 'var(--invite-background)' }}
          />
        )}
        <p className={`mx-auto max-w-md ${romanceType.body} italic`} style={{ fontFamily: 'var(--invite-body-font)' }}>
          {content.closing_message || 'With all our love, thank you for being part of our story.'}
        </p>
        <Divider className="my-6" />
        <p className={romanceType.script} style={{ fontFamily: 'var(--invite-accent-font)' }}>
          {content.couple_names || content.event_name}
        </p>
        {content.event_date && (
          <p className={`mt-2 ${romanceType.caption} uppercase tracking-widest`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            {content.event_date}
          </p>
        )}
      </section>
    </Reveal>
  )
}