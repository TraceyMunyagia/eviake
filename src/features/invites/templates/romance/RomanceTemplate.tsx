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

// Full Romance section set, per the spec's order, now preceded by a tap-to-open
// cover (EntryGate) — the "envelope" moment before the invite reveals.
// Skipped automatically in the builder preview so editing isn't interrupted
// by a tap on every re-render; always shown to a real guest on the public page.
export function RomanceTemplate({ content, tokens, sections, mode, onRsvp, guestbookMessages, onGuestbookSubmit, guestbookAvailable, checkInToken, checkInAvailable }: TemplateProps) {  const [opened, setOpened] = useState(mode === 'preview')

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
      {!opened && <EntryGate content={content} onOpen={() => setOpened(true)} />}

      {opened && (
        <main>
          <Hero content={content} />
          <WelcomeMessage content={content} mode={mode} />
          <EventDetails content={content} mode={mode} />
          <OurStory items={content.story_items} mode={mode} />
          {sections.countdown && <Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} />}
          {sections.gallery && <Gallery urls={content.gallery_urls} captions={content.gallery_captions} mode={mode} />}
          {sections.schedule && <Programme items={content.schedule} mode={mode} />}
          <DressCode content={content} mode={mode} />
          <Location content={content} mode={mode} />
          {sections.rsvp && <RsvpSection content={content} mode={mode} onRsvp={onRsvp} advanced={sections.rsvp_advanced || sections.guest_management} guestManagement={sections.guest_management} />}
          <GiftRegistry content={content} mode={mode} />
          {sections.guestbook && <Guestbook messages={guestbookMessages} mode={mode} onSubmit={onGuestbookSubmit} available={guestbookAvailable} />}
          <Closing content={content} mode={mode} />
          {sections.guest_management && <CheckInSection mode={mode} token={checkInToken} available={checkInAvailable} />}
        </main>
      )}
    </div>
  )
}
