import type { InviteContent } from '@/types/database'

// Uses Google's keyless embed endpoint (maps.google.com/maps?...&output=embed) —
// no API key, no billing account, no quota to manage. This is a deliberate
// trade-off: it's less customizable than the official Maps Embed API (no
// custom pins, no styling), but it needs zero setup and costs nothing,
// which matters more here than visual control over the map itself.
export function buildMapEmbedUrl(content: InviteContent) {
  const query = [content.venue, content.address].filter(Boolean).join(', ')
  if (!query) return null
  return `https://maps.google.com/maps?q=${encodeURIComponent(query)}&output=embed`
}