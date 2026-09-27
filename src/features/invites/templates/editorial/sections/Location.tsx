import { MapPin, Navigation } from 'lucide-react'
import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import { SectionLabel } from '@/features/invites/templates/editorial/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'
import { buildDirectionsUrl } from '@/lib/directionsLink'
import type { InviteContent } from '@/types/database'

export function Location({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  if (!content.venue && !content.address) return null

  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-lg px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <SectionLabel>Find Us</SectionLabel>
        <h2 className={`mt-3 ${editorialType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}>
          {content.venue || 'The venue'}
        </h2>
        <Divider className="my-6" />

        {/* Placeholder in place of an embedded map — Week 12 swaps this
            block for a real map while keeping everything else unchanged. */}
        <div
          className="mx-auto flex h-44 w-full max-w-sm items-center justify-center rounded-sm border"
          style={{ borderColor: 'var(--invite-hairline)', backgroundColor: 'var(--invite-surface)' }}
        >
          <MapPin className="size-6" style={{ color: 'var(--invite-accent)' }} />
        </div>

        {content.address && (
          <p className={`mt-5 ${editorialType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            {content.address}
          </p>
        )}

        {content.parking_info && (
          <p className={`mt-3 ${editorialType.caption}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            Parking: {content.parking_info}
          </p>
        )}

        <a
          href={buildDirectionsUrl(content)}
          target={mode === 'public' ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm"
          style={{ borderColor: 'var(--invite-hairline)', fontFamily: 'var(--invite-body-font)', color: 'var(--invite-primary)' }}
        >
          <Navigation className="size-4" /> Get directions
        </a>
      </section>
    </Reveal>
  )
}
