import { tokenStyle } from '@/features/invites/templates/tokenStyle'
import type { TemplateProps } from '@/features/invites/templates/types'
import { Hero } from './sections/Hero'
import { WelcomeMessage } from './sections/WelcomeMessage'
import { OurStory } from './sections/OurStory'
import { Countdown } from './sections/Countdown'
import { EventDetails } from './sections/EventDetails'
import { Gallery } from './sections/Gallery'
import { Programme } from './sections/Programme'
import { DressCode } from './sections/DressCode'
import { Location } from './sections/Location'
import { RsvpSection } from './sections/RsvpSection'
import { GiftRegistry } from './sections/GiftRegistry'
import { Guestbook } from './sections/Guestbook'
import { Closing } from './sections/Closing'

// Full Romance section set, per the spec's order. Guest Pass/QR is the only
// listed section not present — deferred with Editorial's, pending the
// guest-linking backend work.
export function RomanceTemplate({ content, tokens, sections, mode }: TemplateProps) {
  return (
    <div style={{ ...tokenStyle(tokens), backgroundColor: 'var(--invite-background)' }} className="min-h-full">
      <Hero content={content} />
      <WelcomeMessage content={content} mode={mode} />
      <EventDetails content={content} mode={mode} />
      <OurStory items={content.story_items} mode={mode} />
      {sections.countdown && <Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} />}
      {sections.gallery && <Gallery urls={content.gallery_urls} captions={content.gallery_captions} mode={mode} />}
      {sections.schedule && <Programme items={content.schedule} mode={mode} />}
      <DressCode content={content} mode={mode} />
      <Location content={content} mode={mode} />
      {sections.rsvp && <RsvpSection content={content} mode={mode} />}
      <GiftRegistry content={content} mode={mode} />
      {sections.guestbook && <Guestbook mode={mode} />}
      <Closing content={content} mode={mode} />
    </div>
  )
}
