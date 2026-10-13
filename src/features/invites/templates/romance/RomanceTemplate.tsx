import { useState } from 'react'
import { tokenStyle } from '@/features/invites/templates/tokenStyle'
import type { TemplateProps } from '@/features/invites/templates/types'
import { EntryGate } from './components/EntryGate'
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
import { MusicPlayer } from '../shared/MusicPlayer'
import { CheckInSection } from '../shared/CheckInSection'
import { isOn } from '../../sections/sectionGate'
import { deriveInitials } from '@/features/invites/builder/panels/initials'


// Full Romance section set, per the spec's order, now preceded by a tap-to-open
// cover (EntryGate) — the "envelope" moment before the invite reveals.
// Skipped automatically in the builder preview so editing isn't interrupted
// by a tap on every re-render; always shown to a real guest on the public page.
export function RomanceTemplate({ content, tokens, sections, mode, onRsvp, guestbookMessages, onGuestbookSubmit, guestbookAvailable, checkInToken, checkInAvailable }: TemplateProps) {
  // The cover never shows in the builder preview, so editing isn't interrupted; it can be switched off per invite
  const showCover = mode !== 'preview' && content.cover_enabled !== false
  const [opened, setOpened] = useState(!showCover)
  const initials = (content.cover_initials || deriveInitials(content.couple_names) || deriveInitials(content.event_name)).toUpperCase()

  return (
    <div
      data-invite-root
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
      {!opened && (
        <EntryGate
          initials={initials}
          line={content.cover_line || "You're invited"}
          hint={content.cover_hint || 'Tap to open'}
          onOpen={() => setOpened(true)}
        />
      )}

      {opened && (
        <main>
          <div data-section="hero"><Hero content={content} /></div>
          {isOn(sections, 'message') && <div data-section="message"><WelcomeMessage content={content} mode={mode} /></div>}
          <div data-section="details"><EventDetails content={content} mode={mode} /></div>
          {isOn(sections, 'story') && <div data-section="story"><OurStory items={content.story_items} mode={mode} /></div>}
          {sections.countdown && <div data-section="countdown"><Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} showSeconds={content.countdown_show_seconds !== false} doneMessage={content.countdown_finished_message || undefined} /></div>}
          {sections.gallery && <div data-section="gallery"><Gallery urls={content.gallery_urls} captions={content.gallery_captions} alts={content.gallery_alts} mode={mode} /></div>}
          {sections.schedule && <div data-section="schedule"><Programme items={content.schedule} mode={mode} /></div>}
          {isOn(sections, 'dress_code') && <div data-section="dress_code"><DressCode content={content} mode={mode} /></div>}
          {isOn(sections, 'location') && <div data-section="location"><Location content={content} mode={mode} /></div>}
          {sections.rsvp && <div data-section="rsvp"><RsvpSection content={content} mode={mode} onRsvp={onRsvp} advanced={sections.rsvp_advanced || sections.guest_management} guestManagement={sections.guest_management} /></div>}
          {isOn(sections, 'gift') && <div data-section="gift"><GiftRegistry content={content} mode={mode} /></div>}
          {sections.guestbook && <div data-section="guestbook"><Guestbook messages={guestbookMessages} mode={mode} onSubmit={onGuestbookSubmit} available={guestbookAvailable} /></div>}
          {isOn(sections, 'closing') && <div data-section="closing"><Closing content={content} mode={mode} /></div>}
          {sections.guest_management && <CheckInSection mode={mode} token={checkInToken} available={checkInAvailable} />}
        </main>
      )}
    </div>
  )
}
