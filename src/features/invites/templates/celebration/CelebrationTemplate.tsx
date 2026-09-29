import './celebration.css'
import { tokenStyle } from '@/features/invites/templates/tokenStyle'
import type { TemplateProps } from '@/features/invites/templates/types'
import { Hero } from './sections/Hero'
import { EventIntro } from './sections/EventIntro'
import { EventDetails } from './sections/EventDetails'
import { Countdown } from './sections/Countdown'
import { Gallery } from './sections/Gallery'
import { Programme } from './sections/Programme'
import { DressCode } from './sections/DressCode'
import { Location } from './sections/Location'
import { RsvpSection } from './sections/RsvpSection'
import { Closing } from './sections/Closing'

// Spec order. Not built yet: Guest Pass, Check-in, Event Stats (they wait on
// the guest-linking backend) and Guestbook. `sections.guestbook` and
// `sections.guest_management` have no effect on Celebration until then.
export function CelebrationTemplate({ content, tokens, sections, mode, onRsvp }: TemplateProps) {
  return (
    <div
      style={{
        ...tokenStyle(tokens),
        backgroundColor: 'var(--invite-background)',
        backgroundImage: content.hero_image_url ? `linear-gradient(color-mix(in srgb, var(--invite-background) 78%, transparent), color-mix(in srgb, var(--invite-background) 78%, transparent)), url(${content.hero_image_url})` : undefined,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center',
        backgroundSize: 'cover',
      }}
      className="min-h-full"
    >
      <main>
        <Hero content={content} />
        <EventIntro content={content} mode={mode} />
        <EventDetails content={content} mode={mode} />
        {sections.countdown && <Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} />}
        {sections.gallery && <Gallery urls={content.gallery_urls} captions={content.gallery_captions} mode={mode} />}
        {sections.schedule && <Programme items={content.schedule} mode={mode} />}
        <DressCode content={content} mode={mode} />
        <Location content={content} mode={mode} />
        {sections.rsvp && <RsvpSection content={content} mode={mode} onRsvp={onRsvp} />}
        <Closing content={content} mode={mode} />
      </main>
    </div>
  )
}
