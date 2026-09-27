import { tokenStyle } from '@/features/invites/templates/tokenStyle'
import type { TemplateProps } from '@/features/invites/templates/types'
import { Hero } from './sections/Hero'
import { Countdown } from './sections/Countdown'
import { Schedule } from './sections/Schedule'
import { Gallery } from './sections/Gallery'
import { Video } from './sections/Video'
import { RsvpSection } from './sections/RsvpSection'
import { Guestbook } from './sections/Guestbook'

export function EditorialTemplate({ content, tokens, sections, mode }: TemplateProps) {
  const galleryUrls = Array.isArray(content.gallery_urls)
    ? content.gallery_urls.filter((url): url is string => typeof url === 'string')
    : undefined
  const videoUrl = typeof content.video_url === 'string' ? content.video_url : undefined

  return (
    <div style={{ ...tokenStyle(tokens), backgroundColor: 'var(--invite-background)' }} className="min-h-full">
      <Hero content={content} />
      {sections.countdown && <Countdown eventDate={content.event_date} eventTime={content.event_time} />}
      {sections.schedule && <Schedule items={content.schedule} />}
      {sections.gallery && <Gallery urls={galleryUrls} />}
      {sections.video && <Video url={videoUrl} />}
      {sections.rsvp && <RsvpSection content={content} mode={mode} />}
      {sections.guestbook && <Guestbook />}
    </div>
  )
}
