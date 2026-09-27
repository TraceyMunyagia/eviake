import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import { SectionLabel } from '@/features/invites/templates/editorial/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'
import type { InviteContent } from '@/types/database'

export function RsvpSection({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  return (
    <Reveal mode={mode}>
      <section className="px-6 py-16 text-center sm:py-24" style={{ backgroundColor: 'var(--invite-surface)', color: 'var(--invite-primary)' }}>
        <SectionLabel>Kindly Respond</SectionLabel>
        <h2 className={`mt-3 ${editorialType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}>RSVP</h2>
        <Divider className="my-6" />
        {content.description && (
          <p className={`mx-auto max-w-md ${editorialType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            {content.description}
          </p>
        )}
        <button
          type="button"
          disabled={mode === 'preview'}
          className="mt-8 rounded-none border px-10 py-3 text-sm uppercase tracking-widest transition-opacity disabled:opacity-60"
          style={{ borderColor: 'var(--invite-primary)', color: 'var(--invite-primary)', fontFamily: 'var(--invite-body-font)' }}
        >
          {mode === 'preview' ? 'RSVP (guest form ships later)' : 'Respond now'}
        </button>
      </section>
    </Reveal>
  )
}