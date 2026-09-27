import { tokenStyle } from '@/features/invites/templates/tokenStyle'
import type { TemplateProps } from '@/features/invites/templates/types'
import { Hero } from './sections/Hero'
import { WelcomeMessage } from './sections/WelcomeMessage'
import { EventDetails } from './sections/EventDetails'
import { Countdown } from './sections/Countdown'
import { Gallery } from './sections/Gallery'
import { RsvpSection } from './sections/RsvpSection'
import { Closing } from './sections/Closing'

// Built so far: Hero, Welcome Message, Event Details, Countdown, Gallery,
// RSVP, Closing. Still pending (Week 14): Our Story, Programme, Dress Code,
// Venue/Location, Gift/Registry, Guestbook. Guest Pass/QR waits on the
// guest-linking backend work, same as Editorial.
export function RomanceTemplate({ content, tokens, sections, mode }: TemplateProps) {
  return (
    <div style={{ ...tokenStyle(tokens), backgroundColor: 'var(--invite-background)' }} className="min-h-full">
      <Hero content={content} />
      <WelcomeMessage content={content} mode={mode} />
      <EventDetails content={content} mode={mode} />
      {sections.countdown && <Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} />}
      {sections.gallery && <Gallery urls={content.gallery_urls} captions={content.gallery_captions} mode={mode} />}
      {sections.rsvp && <RsvpSection content={content} mode={mode} />}
      <Closing content={content} mode={mode} />
    </div>
  )
}