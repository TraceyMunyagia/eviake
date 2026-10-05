import { CalendarPlus } from 'lucide-react'
import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import { SectionLabel } from '@/features/invites/templates/editorial/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'
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
      <section className="mx-auto max-w-lg px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <div
          className="border px-6 py-10 sm:px-10 sm:py-12"
          style={{ borderColor: 'var(--invite-hairline)', backgroundColor: 'var(--invite-surface)' }}
        >
          <SectionLabel>The Details</SectionLabel>
          <h2 className={`mt-3 ${editorialType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}>
            When & where
          </h2>
          <Divider className="my-6" />

          {filled.length === 0 ? (
            <p className={editorialType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
              Details are being finalized — check back soon.
            </p>
          ) : (
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 text-left sm:grid-cols-1 sm:text-center">
              {filled.map((f) => (
                <div key={f.key}>
                  <dt className={editorialType.caption} style={{ color: 'var(--invite-accent)', fontFamily: 'var(--invite-body-font)' }}>{f.label}</dt>
                  <dd className={`mt-1 ${editorialType.body}`} style={{ fontFamily: 'var(--invite-body-font)' }}>{String(content[f.key])}</dd>
                </div>
              ))}
            </dl>
          )}

          {content.event_date && (
            <a
              href={buildGoogleCalendarUrl(content)}
              target={mode === 'public' ? '_blank' : undefined}
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm"
              style={{ borderColor: 'var(--invite-hairline)', fontFamily: 'var(--invite-body-font)', color: 'var(--invite-primary)' }}
            >
              <CalendarPlus className="size-4" /> Add to calendar
            </a>
          )}
        </div>
      </section>
    </Reveal>
  )
}
