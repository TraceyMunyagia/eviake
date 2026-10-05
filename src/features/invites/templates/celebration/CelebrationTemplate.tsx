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
import { MusicPlayer } from '../shared/MusicPlayer'
import { CheckInSection } from '../shared/CheckInSection'

// Spec order. Not built yet: Check-in, Event Stats, and Guestbook.
export function CelebrationTemplate({ content, tokens, sections, mode, onRsvp, checkInToken, checkInAvailable }: TemplateProps) {
  return (
    <div
      style={{
        ...tokenStyle(tokens),
        backgroundColor: 'var(--invite-background)',
        backgroundImage: content.hero_image_url ? `linear-gradient(color-mix(in srgb, var(--invite-background) 24%, transparent), color-mix(in srgb, var(--invite-background) 24%, transparent)), url(${content.hero_image_url})` : undefined,
        backgroundAttachment: 'fixed',
        backgroundPosition: 'center center',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
      }}
      className="invite-template-background min-h-full"
    >
      <MusicPlayer content={content} />
      <main>
        <Hero content={content} />
        <EventIntro content={content} mode={mode} />
        <EventDetails content={content} mode={mode} />
        {sections.countdown && <Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} />}
        {sections.gallery && <Gallery urls={content.gallery_urls} captions={content.gallery_captions} mode={mode} />}
        {sections.schedule && <Programme items={content.schedule} mode={mode} />}
        <DressCode content={content} mode={mode} />
        {sections.dress_code && <DressCode content={content} mode={mode} />}
        <Location content={content} mode={mode} />
        {sections.rsvp && <RsvpSection content={content} mode={mode} onRsvp={onRsvp} advanced={sections.rsvp_advanced || sections.guest_management} guestManagement={sections.guest_management} />}
        <Closing content={content} mode={mode} />
        {sections.guest_management && <CheckInSection mode={mode} token={checkInToken} available={checkInAvailable} />}
      </main>
    </div>
  )
}
