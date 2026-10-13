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
import { isOn } from '../../sections/sectionGate'



// Section order follows the Editorial spec: Hero, [Invitation Message —
// Week 11], Event Details, Countdown, [About/Story — Week 11], Schedule,
// Gallery, [Dress Code, Location — Week 11], RSVP, [Guest Pass — later],
// Guestbook, Closing. Video is intentionally not part of Editorial's own
// section list (it's a Celebration feature) — the `sections.video` flag
// exists on the shared schema but Editorial doesn't render it.
export function EditorialTemplate({ content, tokens, sections, mode, onRsvp, checkInToken, checkInAvailable }: TemplateProps) {
  return (
    <div
      style={{
        ...tokenStyle(tokens),
        backgroundColor: 'var(--invite-background)',
      }}
      className="invite-template-background relative min-h-full"
    >
      {content.hero_image_url && (
        <div
          className="invite-fixed-background"
          aria-hidden="true"
          style={{ backgroundImage: `linear-gradient(color-mix(in srgb, var(--invite-background) 24%, transparent), color-mix(in srgb, var(--invite-background) 24%, transparent)), url(${content.hero_image_url})` }}
        />
      )}
      <MusicPlayer content={content} />
      <main>
        <div data-section="hero"><Hero content={content} /></div>
        {isOn(sections, 'message') && <div data-section="message"><InvitationMessage content={content} mode={mode} /></div>}
        <div data-section="details"><EventDetails content={content} mode={mode} /></div>
        {sections.countdown && <div data-section="countdown"><Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} showSeconds={content.countdown_show_seconds !== false} doneMessage={content.countdown_finished_message || undefined} /></div>}
        {isOn(sections, 'story') && <div data-section="story"><AboutStory content={content} mode={mode} /></div>}
        {sections.schedule && <div data-section="schedule"><Schedule items={content.schedule} mode={mode} /></div>}
        {sections.gallery && <div data-section="gallery"><Gallery urls={content.gallery_urls} mode={mode} /></div>}
        {isOn(sections, 'dress_code') && <div data-section="dress_code"><DressCode content={content} mode={mode} /></div>}
        {isOn(sections, 'location') && <div data-section="location"><Location content={content} mode={mode} /></div>}
        {sections.rsvp && <div data-section="rsvp"><RsvpSection content={content} mode={mode} onRsvp={onRsvp} advanced={sections.rsvp_advanced || sections.guest_management} guestManagement={sections.guest_management} /></div>}
        {isOn(sections, 'closing') && <div data-section="closing"><Closing content={content} mode={mode} /></div>}
        {sections.guest_management && <CheckInSection mode={mode} token={checkInToken} available={checkInAvailable} />}
      </main>
    </div>
  )
}
