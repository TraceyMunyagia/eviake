import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import type { InviteContent } from '@/types/database'

export function Programme({ items, mode }: { items?: InviteContent['schedule']; mode?: 'preview' | 'public' }) {
  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-md px-6 py-16 sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <div className="mb-8 text-center">
          <SectionLabel>The day</SectionLabel>
          <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>Programme</h2>
          <Divider className="mt-6" />
        </div>

        {!items || items.length === 0 ? (
          <p className={`text-center ${romanceType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            The programme will be shared closer to the day.
          </p>
        ) : (
          <ul className="space-y-4">
            {items.map((item, i) => (
              <li key={i} className="flex items-center gap-4 rounded-2xl border px-5 py-3" style={{ borderColor: 'var(--invite-hairline)', backgroundColor: 'var(--invite-surface)' }}>
                <span className="shrink-0 text-sm font-medium" style={{ fontFamily: 'var(--invite-accent-font)', color: 'var(--invite-accent)' }}>{item.time}</span>
                <span className={romanceType.body} style={{ fontFamily: 'var(--invite-body-font)' }}>{item.label}</span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </Reveal>
  )
}