import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'

export function CheckInSection({ mode, token, available }: {
  mode?: 'preview' | 'public'
  token?: string | null
  available?: boolean
}) {
  const inPreview = mode === 'preview'
  const canOpen = inPreview || available

  return (
    <Reveal mode={mode}>
      <section className="px-6 py-16 text-center sm:py-24" style={{ backgroundColor: 'var(--invite-surface)', color: 'var(--invite-primary)' }}>
        <SectionLabel>For the day</SectionLabel>
        <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>Check-in</h2>
        <Divider className="my-6" />
        {!canOpen ? (
          <p className={romanceType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            Your check-in pass will be available on the day of the event.
          </p>
        ) : token ? (
          <a
            href={`${window.location.origin}/pass/${token}`}
            className="inline-block rounded-full px-5 py-2.5 text-sm font-medium"
            style={{ backgroundColor: 'var(--invite-primary)', color: 'var(--invite-background)', fontFamily: 'var(--invite-body-font)' }}
          >
            Open your guest pass
          </a>
        ) : (
          <p className={romanceType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            RSVP to receive your check-in pass.
          </p>
        )}
      </section>
    </Reveal>
  )
}
