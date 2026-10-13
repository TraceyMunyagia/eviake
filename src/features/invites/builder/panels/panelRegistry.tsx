import type { ComponentType } from 'react'
import type { SectionKey } from '../../sections/catalog'
import { HeroPanel } from './HeroPanel'
import { MessagePanel } from './MessagePanel'
import { EventDetailsPanel } from './EventDetailsPanel'
import { CountdownPanel } from './CountdownPanel'
import { GalleryPanel } from './GalleryPanel'
import { LocationPanel } from './LocationPanel'
import { DressCodePanel } from './DressCodePanel'
import { ClosingPanel } from './ClosingPanel'
import { GiftPanel, GuestbookSectionPanel, RsvpPanel, SchedulePanel, StoryPanel } from './ExistingEditorPanels'

export const PANELS: Record<SectionKey, ComponentType> = {
  hero: HeroPanel,
  message: MessagePanel,
  details: EventDetailsPanel,
  countdown: CountdownPanel,
  story: StoryPanel,
  schedule: SchedulePanel,
  gallery: GalleryPanel,
  dress_code: DressCodePanel,
  location: LocationPanel,
  rsvp: RsvpPanel,
  gift: GiftPanel,
  guestbook: GuestbookSectionPanel,
  closing: ClosingPanel,
}
