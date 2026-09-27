import type { CSSProperties } from 'react'
import type { InviteTokens } from '@/types/database'

// Converts an invite's saved tokens into CSS custom properties that every
// template reads instead of hardcoding colours or fonts. "Customize colours
// and fonts" in the builder becomes editing this object, not editing a
// component's source.
export function tokenStyle(tokens: InviteTokens): CSSProperties {
  return {
    '--invite-primary': tokens.primary || '#2B1530',
    '--invite-accent': tokens.accent || '#C7A046',
    '--invite-background': tokens.background || '#FBF7F0',
    '--invite-heading-font': tokens.heading_font || 'Georgia, serif',
    '--invite-body-font': tokens.body_font || 'system-ui, sans-serif',
  } as CSSProperties
}