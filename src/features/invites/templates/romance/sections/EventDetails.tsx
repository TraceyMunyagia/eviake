import { CalendarPlus } from 'lucide-react'
import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import { buildGoogleCalendarUrl } from '@/lib/calenderLink'
import type { InviteContent } from '@/types/database'

const FIELDS: { key: keyof InviteContent; label: string }[] = [
  { key: 'event_date', label: 'Date' },
  { key: 'event_time', label: 'Time' },
  { key: 'venue', label: 'Venue' },
  { key: 'address', label: 'Address' },
  { key: 'event_type', label: 'Occasion' },
]

export function EventDetails({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const filled = FIELDS.filter((f) => content[f.key])

  return (
    <Reveal mode={mode}>
      <section className="px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <SectionLabel>Save the date</SectionLabel>
        <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>Join us</h2>
        <Divider className="my-6" />

        <div className="mx-auto max-w-sm rounded-[2rem] border px-8 py-8" style={{ borderColor: 'var(--invite-hairline)', backgroundColor: 'var(--invite-surface)' }}>
          {filled.length === 0 ? (
            <p className={romanceType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
              Details are being finalised — check back soon.
            </p>
          ) : (
            <dl className="space-y-4 text-center">
              {filled.map((f) => (
                <div key={f.key}>
                  <dt className={`${romanceType.caption} uppercase tracking-widest`} style={{ color: 'var(--invite-accent)', fontFamily: 'var(--invite-body-font)' }}>{f.label}</dt>
                  <dd className={`mt-1 ${romanceType.body}`} style={{ fontFamily: 'var(--invite-body-font)' }}>{String(content[f.key])}</dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        {content.event_date && (
          <a
            href={buildGoogleCalendarUrl(content)}
            target={mode === 'public' ? '_blank' : undefined}
            rel="noopener noreferrer"
            className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
            style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)', fontFamily: 'var(--invite-body-font)' }}
          >
            <CalendarPlus className="size-4" /> Add to calendar
          </a>
        )}
      </section>
    </Reveal>
  )
}
