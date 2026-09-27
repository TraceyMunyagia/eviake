import { useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import { buildDirectionsUrl } from '@/lib/directionsLink'
import { buildMapEmbedUrl } from '@/lib/mapEmbed'
import type { InviteContent } from '@/types/database'

export function Location({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const [mapFailed, setMapFailed] = useState(false)
  const embedUrl = buildMapEmbedUrl(content)
  if (!content.venue && !content.address) return null

  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-lg px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <SectionLabel>Find us</SectionLabel>
        <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>{content.venue || 'The venue'}</h2>
        <Divider className="my-6" />

        {content.venue_image_url && (
          <img src={content.venue_image_url} alt="" className="mx-auto mb-6 h-44 w-full max-w-sm rounded-3xl object-cover" />
        )}

        <div className="mx-auto h-48 w-full max-w-sm overflow-hidden rounded-3xl border" style={{ borderColor: 'var(--invite-hairline)', backgroundColor: 'var(--invite-surface)' }}>
          {embedUrl && !mapFailed ? (
            <iframe
              title={`Map to ${content.venue || 'venue'}`}
              src={embedUrl}
              className="h-full w-full"
              style={{ border: 0 }}
              loading="lazy"
              onError={() => setMapFailed(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center"><MapPin className="size-6" style={{ color: 'var(--invite-accent)' }} /></div>
          )}
        </div>

        {content.address && <p className={`mt-5 ${romanceType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>{content.address}</p>}
        {content.parking_info && <p className={`mt-3 ${romanceType.caption}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>Parking: {content.parking_info}</p>}

        <a
          href={buildDirectionsUrl(content)}
          target={mode === 'public' ? '_blank' : undefined}
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm"
          style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)', fontFamily: 'var(--invite-body-font)' }}
        >
          <Navigation className="size-4" /> Get directions
        </a>
      </section>
    </Reveal>
  )
}
