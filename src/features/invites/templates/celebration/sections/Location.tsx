import { useState } from 'react'
import { MapPin, Navigation } from 'lucide-react'
import { celebrationType } from '@/features/invites/templates/celebration/type'
import { ActionButton } from '@/features/invites/templates/celebration/components/ActionButton'
import { Reveal } from '@/features/invites/templates/celebration/components/Reveal'
import { buildDirectionsUrl } from '@/lib/directionsLink'
import { buildMapEmbedUrl } from '@/lib/mapEmbed'
import type { InviteContent } from '@/types/database'

export function Location({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const [mapFailed, setMapFailed] = useState(false)
  const embedUrl = buildMapEmbedUrl(content)
  if (!content.venue && !content.address) return null

  return (
    <section className="px-5 py-16 sm:px-10 sm:py-24" style={{ color: 'var(--invite-primary)' }}>
      <Reveal mode={mode} className="mx-auto max-w-5xl">
        <h2 className={celebrationType.h2} style={{ fontFamily: 'var(--invite-heading-font)' }}>Find the party</h2>

        <div className="mt-8 grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <div
            className="h-72 overflow-hidden rounded-3xl border-4 sm:h-96"
            style={{ borderColor: 'var(--invite-primary)', boxShadow: '8px 8px 0 var(--invite-accent)', backgroundColor: 'var(--invite-surface)' }}
          >
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
              <div className="flex h-full w-full items-center justify-center">
                <MapPin className="size-10" style={{ color: 'var(--invite-accent)' }} />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-4">
            {content.venue && (
              <p className="text-3xl font-extrabold leading-tight sm:text-4xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>{content.venue}</p>
            )}
            {content.address && (
              <p className={celebrationType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>{content.address}</p>
            )}
            {content.parking_info && (
              <div
                className="rounded-2xl border-4 px-4 py-3"
                style={{ borderColor: 'var(--invite-primary)', backgroundColor: 'var(--invite-secondary)', boxShadow: '4px 4px 0 var(--invite-primary)' }}
              >
                <p className={celebrationType.caption} style={{ fontFamily: 'var(--invite-body-font)' }}>Parking</p>
                <p className="mt-1 text-sm font-semibold" style={{ fontFamily: 'var(--invite-body-font)' }}>{content.parking_info}</p>
              </div>
            )}
            <div>
              <ActionButton tone="accent" icon={<Navigation className="size-4" />} href={buildDirectionsUrl(content)}>
                Get directions
              </ActionButton>
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  )
}