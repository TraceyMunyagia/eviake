import { tokenStyle } from '@/features/invites/templates/tokenStyle'
import type { TemplateProps } from '@/features/invites/templates/types'
import { Hero } from './sections/Hero'
import { EventDetails } from './sections/EventDetails'
import { Countdown } from './sections/Countdown'
import { Schedule } from './sections/Schedule'
import { Gallery } from './sections/Gallery'
import { RsvpSection } from './sections/RsvpSection'
import { Guestbook } from './sections/Guestbook'
import { Closing } from './sections/Closing'

// Section order follows the Editorial spec: Hero, [Invitation Message —
// Week 11], Event Details, Countdown, [About/Story — Week 11], Schedule,
// Gallery, [Dress Code, Location — Week 11], RSVP, [Guest Pass — later],
// Guestbook, Closing. Video is intentionally not part of Editorial's own
// section list (it's a Celebration feature) — the `sections.video` flag
// exists on the shared schema but Editorial doesn't render it.
export function EditorialTemplate({ content, tokens, sections, mode }: TemplateProps) {
  return (
    <div style={{ ...tokenStyle(tokens), backgroundColor: 'var(--invite-background)' }} className="min-h-full">
      <Hero content={content} />
      <EventDetails content={content} mode={mode} />
      {sections.countdown && <Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} />}
      {sections.schedule && <Schedule items={content.schedule} mode={mode} />}
      {sections.gallery && <Gallery urls={content.gallery_urls} mode={mode} />}
      {sections.rsvp && <RsvpSection content={content} mode={mode} />}
      {sections.guestbook && <Guestbook />}
      <Closing content={content} mode={mode} />
    </div>
  )
}