import { useState } from 'react'
import { CalendarPlus, Check, Navigation, Share2 } from 'lucide-react'
import { celebrationType } from '@/features/invites/templates/celebration/type'
import { ActionButton } from '@/features/invites/templates/celebration/components/ActionButton'
import { Reveal } from '@/features/invites/templates/celebration/components/Reveal'
import { buildGoogleCalendarUrl } from '@/lib/calenderLink'
import { buildDirectionsUrl } from '@/lib/directionsLink'
import { formatEventTime, parseEventDate } from '@/lib/eventFormat'
import type { InviteContent } from '@/types/database'

const tileCls = 'rounded-3xl border-4 p-5 sm:p-7'
const tileStyle = { borderColor: 'var(--invite-primary)', boxShadow: '6px 6px 0 var(--invite-primary)' }

export function EventDetails({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const [copied, setCopied] = useState(false)
  const date = parseEventDate(content.event_date)
  const time = formatEventTime(content.event_time)
  const hasVenue = Boolean(content.venue || content.address)
  const inPreview = mode === 'preview'

  async function share() {
    const url = window.location.href
    const title = content.couple_names || content.event_name || 'Invitation'
    if (navigator.share) {
      try { await navigator.share({ title, url }) } catch { /* dismissed */ }
      return
    }
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch { /* clipboard unavailable */ }
  }

  return (
    <section className="px-5 py-16 sm:px-10 sm:py-24" style={{ color: 'var(--invite-primary)' }}>
      <Reveal mode={mode} className="mx-auto max-w-5xl">
        <h2 className={celebrationType.h2} style={{ fontFamily: 'var(--invite-heading-font)' }}>Save the date</h2>

        {!date && !time && !hasVenue ? (
          <p className={`mt-6 ${celebrationType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            Details are being locked in. Check back soon.
          </p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-5 lg:grid-cols-3">
              {date && (
                <div
                  className={`${tileCls} ${time ? '' : 'col-span-2 lg:col-span-1'}`}
                  style={{ ...tileStyle, backgroundColor: 'var(--invite-accent)' }}
                >
                  <p className={celebrationType.caption} style={{ fontFamily: 'var(--invite-body-font)' }}>
                    {date.toLocaleDateString('en-GB', { weekday: 'long' })}
                  </p>
                  <p className={celebrationType.number} style={{ fontFamily: 'var(--invite-heading-font)' }}>{date.getDate()}</p>
                  <p className="text-lg font-bold uppercase" style={{ fontFamily: 'var(--invite-body-font)' }}>
                    {date.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}

              {time && (
                <div
                  className={`${tileCls} ${date ? '' : 'col-span-2 lg:col-span-1'}`}
                  style={{ ...tileStyle, backgroundColor: 'var(--invite-secondary)' }}
                >
                  <p className={celebrationType.caption} style={{ fontFamily: 'var(--invite-body-font)' }}>Time</p>
                  <p className="mt-2 text-[clamp(1.75rem,7vw,3.5rem)] font-extrabold leading-none" style={{ fontFamily: 'var(--invite-heading-font)' }}>
                    {time}
                  </p>
                </div>
              )}

              {hasVenue && (
                <div
                  className={`${tileCls} col-span-2 lg:col-span-1`}
                  style={{ ...tileStyle, backgroundColor: 'var(--invite-primary)', color: 'var(--invite-background)' }}
                >
                  <p className={celebrationType.caption} style={{ fontFamily: 'var(--invite-body-font)' }}>Where</p>
                  {content.venue && (
                    <p className="mt-2 text-2xl font-extrabold leading-tight sm:text-3xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>
                      {content.venue}
                    </p>
                  )}
                  {content.address && (
                    <p className="mt-2 text-sm opacity-80" style={{ fontFamily: 'var(--invite-body-font)' }}>{content.address}</p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap gap-4">
              {date && (
                <ActionButton tone="accent" icon={<CalendarPlus className="size-4" />} href={buildGoogleCalendarUrl(content)}>
                  Add to calendar
                </ActionButton>
              )}
              {hasVenue && (
                <ActionButton tone="secondary" icon={<Navigation className="size-4" />} href={buildDirectionsUrl(content)}>
                  Get directions
                </ActionButton>
              )}
              <ActionButton
                tone="light"
                icon={copied ? <Check className="size-4" /> : <Share2 className="size-4" />}
                onClick={share}
                disabled={inPreview}
              >
                {copied ? 'Link copied' : 'Share invite'}
              </ActionButton>
            </div>
          </>
        )}
      </Reveal>
    </section>
  )
}