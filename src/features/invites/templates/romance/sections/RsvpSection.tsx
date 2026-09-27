import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import type { InviteContent } from '@/types/database'

export function RsvpSection({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  return (
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
        <button
          type="button"
          disabled={mode === 'preview'}
          className="mt-8 rounded-full px-10 py-3 text-sm shadow-sm disabled:opacity-60"
          style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)', fontFamily: 'var(--invite-body-font)' }}
        >
          {mode === 'preview' ? 'RSVP (guest form ships later)' : 'Respond with love'}
        </button>
      </section>
    </Reveal>
  )
}