import type { CSSProperties } from 'react'
import type { InviteTokens } from '@/types/database'
import { fontVars } from '@/features/invites/design/fontRegistry'

export function tokenStyle(tokens: InviteTokens): CSSProperties {
  const primary = tokens.primary || '#2B1530'
  const accent = tokens.accent || '#C7A046'
  const background = tokens.background || '#FBF7F0'
  // Registry fonts get a full stack and a size scale; anything else (e.g. "Georgia") is used as typed
  const fonts = fontVars(tokens)
  const heading = fonts['--invite-heading-font'] ?? (tokens.heading_font || 'Georgia, serif')
  return {
    '--invite-primary': primary,
    '--invite-accent': accent,
    '--invite-secondary': tokens.secondary || accent,
    '--invite-background': background,
    '--invite-heading-font': heading,
    '--invite-body-font': tokens.body_font || 'system-ui, sans-serif',
    // No accent font chosen: script text uses the heading font
    '--invite-accent-font': tokens.accent_font || heading,
    '--invite-accent-scale': fonts['--invite-heading-scale'] ?? '1',
    '--invite-hairline': `color-mix(in srgb, ${accent} 45%, transparent)`,
    '--invite-muted': `color-mix(in srgb, ${primary} 58%, transparent)`,
    '--invite-surface': `color-mix(in srgb, ${primary} 4%, ${background})`,
    ...fonts,
  } as CSSProperties
}