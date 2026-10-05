import { tokenStyle } from '@/features/invites/templates/tokenStyle'
import type { TemplateProps } from '@/features/invites/templates/types'
import { Hero } from './sections/Hero'
import { EventDetails } from './sections/EventDetails'
import { Countdown } from './sections/Countdown'
import { Schedule } from './sections/Schedule'
import { Gallery } from './sections/Gallery'
import { RsvpSection } from './sections/RsvpSection'
import { Closing } from './sections/Closing'
import { InvitationMessage } from './sections/InvitationMessage'
import { AboutStory } from './sections/AboutStory'
import { DressCode } from './sections/DressCode'
import { Location } from './sections/Location'
import { MusicPlayer } from '../shared/MusicPlayer'
import { CheckInSection } from '../shared/CheckInSection'

// Section order follows the Editorial spec: Hero, [Invitation Message —
// Week 11], Event Details, Countdown, [About/Story — Week 11], Schedule,
// Gallery, [Dress Code, Location — Week 11], RSVP, [Guest Pass — later],
// Guestbook, Closing. Video is intentionally not part of Editorial's own
// section list (it's a Celebration feature) — the `sections.video` flag
// exists on the shared schema but Editorial doesn't render it.
export function EditorialTemplate({ content, tokens, sections, mode, onRsvp, checkInToken, checkInAvailable }: TemplateProps) {  return (
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
        <InvitationMessage content={content} mode={mode} />
        <EventDetails content={content} mode={mode} />
        {sections.countdown && <Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} />}
        <AboutStory content={content} mode={mode} />
        {sections.schedule && <Schedule items={content.schedule} mode={mode} />}
        {sections.gallery && <Gallery urls={content.gallery_urls} mode={mode} />}
        <DressCode content={content} mode={mode} />
        <Location content={content} mode={mode} />
        {sections.rsvp && <RsvpSection content={content} mode={mode} onRsvp={onRsvp} advanced={sections.rsvp_advanced || sections.guest_management} guestManagement={sections.guest_management} />}
        <Closing content={content} mode={mode} />
        {sections.guest_management && <CheckInSection mode={mode} token={checkInToken} available={checkInAvailable} />}
      </main>
    </div>
  )
}
