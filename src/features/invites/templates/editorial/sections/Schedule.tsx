import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import { SectionLabel } from '@/features/invites/templates/editorial/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'
import type { InviteContent } from '@/types/database'

export function Schedule({ items, mode }: { items?: InviteContent['schedule']; mode?: 'preview' | 'public' }) {
  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-md px-6 py-16 sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <div className="mb-8 text-center">
          <SectionLabel>Programme</SectionLabel>
          <h2 className={`mt-3 ${editorialType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}>Schedule</h2>
          <Divider className="mt-6" />
        </div>

        {!items || items.length === 0 ? (
          <p className={`text-center ${editorialType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            The schedule will be shared closer to the day.
          </p>
        ) : (
          <ol className="relative border-l" style={{ borderColor: 'var(--invite-hairline)' }}>
            {items.map((item, i) => (
              <li key={i} className="mb-8 ml-6 last:mb-0">
                <span
                  className="absolute -left-[5px] mt-1.5 size-2.5 rounded-full"
                  style={{ backgroundColor: 'var(--invite-accent)' }}
                />
                <p className={`${editorialType.caption} uppercase tracking-widest`} style={{ color: 'var(--invite-accent)', fontFamily: 'var(--invite-body-font)' }}>
                  {item.time}
                </p>
                <p className={`mt-1 ${editorialType.body}`} style={{ fontFamily: 'var(--invite-body-font)' }}>{item.label}</p>
              </li>
            ))}
          </ol>
        )}
      </section>
    </Reveal>
  )
}