import type { InviteContent } from '@/types/database'

// A plain "open in Maps" link — works with no API key and no embed, which is
// exactly right for this first pass. The real embedded map (Week 12) reuses
// the same address string, so nothing here gets thrown away later.
export function buildDirectionsUrl(content: InviteContent) {
  const query = [content.venue, content.address].filter(Boolean).join(', ')
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}