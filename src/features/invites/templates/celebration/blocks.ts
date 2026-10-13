import type { CSSProperties } from 'react'
import type { InviteTokens } from '@/types/database'
import { tokenStyle } from '../tokenStyle'

export type Tone = 'plain' | 'secondary' | 'primary' | 'accent'

// Rhythm of the page after the hero: plain, bold, plain, bold…
const PATTERN: Tone[] = ['plain', 'secondary', 'plain', 'primary', 'plain', 'accent']

/** keys = visible sections in render order, excluding the hero. */
export function makeToneFor(keys: string[]) {
  const index = new Map(keys.map((k, i) => [k, i]))
  return (key: string): Tone => PATTERN[(index.get(key) ?? 0) % PATTERN.length]
}

function luminance(hex: string): number | null {
  const m = hex.trim().replace('#', '')
  const full = m.length === 3 ? m.split('').map((c) => c + c).join('') : m
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16) / 255)
  const lin = (c: number) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

function contrast(a: string, b: string): number | null {
  const la = luminance(a)
  const lb = luminance(b)
  if (la == null || lb == null) return null
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05)
}

/**
 * Background for a block plus the invite colour variables to use inside it.
 * Text ("ink") is whichever of primary/background reads better on the block; on a dark block the two swap,
 * so every card, border and tile inside that uses --invite-primary / --invite-background stays readable.
 * Defaults match tokenStyle.
 */
export function blockStyle(tone: Tone, tokens: InviteTokens): CSSProperties {
  const primary = tokens.primary || '#2B1530'
  const background = tokens.background || '#FBF7F0'
  const accent = tokens.accent || '#C7A046'
  const bg = { plain: background, primary, accent, secondary: tokens.secondary || accent }[tone]

  const onPrimary = contrast(primary, bg)
  const onBackground = contrast(background, bg)
  const swap = onPrimary == null || onBackground == null ? tone === 'primary' : onBackground > onPrimary
  const vars = swap ? tokenStyle({ ...tokens, primary: background, background: primary }) : {}

  return { ...vars, backgroundColor: bg, color: 'var(--invite-primary)' }
}
