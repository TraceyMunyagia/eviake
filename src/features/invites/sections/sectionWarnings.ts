import type { InviteContent } from '@/types/database'
import type { SectionKey } from './catalog'

const len = (v: unknown) => (Array.isArray(v) ? v.length : 0)

/** Gentle nudge for a ticked section that has nothing in it yet. */
export function sectionWarning(key: SectionKey, content: InviteContent | null | undefined): string | null {
  const c = content ?? {}
  switch (key) {
    case 'gallery': return len(c.gallery_urls) ? null : 'No photos added yet.'
    case 'schedule': return len(c.schedule) ? null : 'No programme items yet.'
    // Editorial uses the about fields, Romance the story timeline
    case 'story': return c.about_text || len(c.story_items) ? null : 'No story added yet.'
    case 'gift': return c.gift_message || len(c.registries) ? null : 'No gift message or registry links yet.'
    case 'dress_code':
      return c.dress_code || c.dress_code_note || len(c.dress_code_palette) || len(c.dress_code_image_urls) ? null : 'No dress code added yet.'
    case 'location': return c.venue || c.address ? null : 'No venue or address yet.'
    case 'countdown': return c.event_date ? null : 'No event date set.'
    default: return null
  }
}
