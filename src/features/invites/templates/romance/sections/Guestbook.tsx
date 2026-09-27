import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'

export function Guestbook({ mode }: { mode?: 'preview' | 'public' }) {
  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-md px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <SectionLabel>Well wishes</SectionLabel>
        <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>Guestbook</h2>
        <Divider className="my-6" />
        <p className={romanceType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
          Loving messages from your guests will appear here once RSVPs open.
        </p>
      </section>
    </Reveal>
  )
}