import './celebration.css'
import { useMemo, type ReactNode } from 'react'
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
import { isOn } from '../../sections/sectionGate'
import { blockStyle, makeToneFor } from './blocks'

// Render order after the hero. Colour blocks follow the visible sections, not fixed sections,
// so unticking one never puts two bold blocks side by side.
const ORDER = ['message', 'details', 'countdown', 'gallery', 'schedule', 'dress_code', 'location', 'rsvp', 'closing']


// Spec order. Not built yet: Check-in, Event Stats, and Guestbook.
export function CelebrationTemplate({ content, tokens, sections, mode, onRsvp, checkInToken, checkInAvailable }: TemplateProps) {
  // Older invites always showed message/location/closing, so only an explicit false hides those
  const flagOn = (k: string) => k === 'details' || (['message', 'location', 'closing'].includes(k) ? isOn(sections, k) : !!sections?.[k as keyof typeof sections])
  // Dress code and Location render nothing without content, so they must not take a colour slot either
  const hasContent = (k: string) =>
    k === 'dress_code'
      ? Boolean(content.dress_code || content.dress_code_note || content.dress_code_palette?.length || content.dress_code_image_urls?.length)
      : k === 'location' ? Boolean(content.venue || content.address) : true
  const visible = (k: string) => flagOn(k) && hasContent(k)
  const toneFor = useMemo(
    () => makeToneFor(ORDER.filter(visible)),
    [sections, content],
  )
  const block = (key: string, node: ReactNode) =>
    visible(key) && <div data-section={key} style={blockStyle(toneFor(key), tokens)}>{node}</div>

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
        {block('message', <EventIntro content={content} mode={mode} />)}
        {block('details', <EventDetails content={content} mode={mode} />)}
        {block('countdown', <Countdown eventDate={content.event_date} eventTime={content.event_time} mode={mode} showSeconds={content.countdown_show_seconds !== false} doneMessage={content.countdown_finished_message || undefined} />)}
        {block('gallery', <Gallery urls={content.gallery_urls} captions={content.gallery_captions} mode={mode} />)}
        {block('schedule', <Programme items={content.schedule} mode={mode} />)}
        {block('dress_code', <DressCode content={content} mode={mode} />)}
        {block('location', <Location content={content} mode={mode} />)}
        {block('rsvp', <RsvpSection content={content} mode={mode} onRsvp={onRsvp} advanced={sections.rsvp_advanced || sections.guest_management} guestManagement={sections.guest_management} />)}
        {block('closing', <Closing content={content} mode={mode} />)}
        {sections.guest_management && <CheckInSection mode={mode} token={checkInToken} available={checkInAvailable} />}
      </main>
    </div>
  )
}
