import type { SectionKey } from './catalog'
import { getIn, type Content } from '../builder/content/contentPath'
import { P } from '../builder/content/contentPaths'

const len = (v: unknown) => (Array.isArray(v) ? v.length : 0)

/**
 * Gentle nudge for a ticked section that has nothing in it yet. Reads the same paths as the panels.
 * No warning for the message: Editorial and Romance write an automatic line when it's blank.
 */
export function sectionWarning(key: SectionKey, content: Content | null | undefined): string | null {
  const c = content ?? {}
  switch (key) {
    case 'gallery': return len(getIn(c, P.gallery)) ? null : 'No photos added yet.'
    case 'schedule': return len(getIn(c, P.schedule)) ? null : 'No programme items yet.'
    // Editorial uses the about text, Romance the story timeline
    case 'story': return getIn(c, P.aboutText) || len(getIn(c, P.story)) ? null : 'No story added yet.'
    case 'gift': return getIn(c, P.giftMessage) || len(getIn(c, P.registry)) ? null : 'No gift message or registry links yet.'
    case 'dress_code':
      return getIn(c, P.dressTitle) || getIn(c, P.dressBody) || len(getIn(c, P.dressColours)) || len(c.dress_code_image_urls)
        ? null : 'No dress code added yet.'
    case 'location': return getIn(c, P.venueName) || getIn(c, P.venueAddress) ? null : 'No venue or address yet.'
    case 'countdown': return getIn(c, P.date) ? null : 'No event date set.'
    case 'rsvp': return getIn(c, P.rsvpBy) ? null : 'No RSVP-by date yet.'
    default: return null
  }
}
