import type { CSSProperties } from 'react'
import type { InviteTokens } from '@/types/database'

export function tokenStyle(tokens: InviteTokens): CSSProperties {
  const primary = tokens.primary || '#2B1530'
  const accent = tokens.accent || '#C7A046'
  const background = tokens.background || '#FBF7F0'
  return {
    '--invite-primary': primary,
    '--invite-accent': accent,
    '--invite-secondary': tokens.secondary || accent,
    '--invite-background': background,
    '--invite-heading-font': tokens.heading_font || 'Georgia, serif',
    '--invite-body-font': tokens.body_font || 'system-ui, sans-serif',
    '--invite-accent-font': tokens.accent_font || tokens.heading_font || 'Georgia, serif',
    '--invite-hairline': `color-mix(in srgb, ${accent} 45%, transparent)`,
    '--invite-muted': `color-mix(in srgb, ${primary} 58%, transparent)`,
    '--invite-surface': `color-mix(in srgb, ${primary} 4%, ${background})`,
  } as CSSProperties
}