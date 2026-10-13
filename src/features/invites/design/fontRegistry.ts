import type { TemplateKey } from '../sections/catalog'
import { T, type Tokens } from './tokenKeys'

export type FontRole = 'heading' | 'body' | 'accent'

export interface FontDef {
  family: string
  category: 'serif' | 'sans' | 'script' | 'display'
  roles: FontRole[]
  /** Every weight the family really has on Google Fonts (checked Oct 2026). Asking for one it lacks fails the whole request. */
  weights: number[]
  italic?: boolean
  fallback: string
  /** Size tweak so fonts look the same size. Starting values: eyeball in the builder and adjust. */
  scale: number
  /** Kept so older invites still render. Not offered in the picker. */
  legacy?: boolean
}

const serif = 'Georgia, "Times New Roman", serif'
const sans = 'system-ui, -apple-system, "Segoe UI", sans-serif'
const script = 'cursive'
const ALL = [300, 400, 500, 600, 700, 800, 900]

export const FONTS: FontDef[] = [
  // Serif headings
  { family: 'Cormorant Garamond', category: 'serif', roles: ['heading'], weights: [300, 400, 500, 600, 700], italic: true, fallback: serif, scale: 1.08 },
  { family: 'Playfair Display', category: 'serif', roles: ['heading'], weights: [400, 500, 600, 700, 800, 900], italic: true, fallback: serif, scale: 0.97 },
  { family: 'Bodoni Moda', category: 'serif', roles: ['heading'], weights: [400, 500, 600, 700, 800, 900], italic: true, fallback: serif, scale: 0.96 },
  { family: 'DM Serif Display', category: 'serif', roles: ['heading'], weights: [400], italic: true, fallback: serif, scale: 0.97 },
  // Body
  { family: 'Lora', category: 'serif', roles: ['body'], weights: [400, 500, 600, 700], italic: true, fallback: serif, scale: 1 },
  { family: 'Libre Baskerville', category: 'serif', roles: ['body'], weights: [400, 700], italic: true, fallback: serif, scale: 0.93 },
  { family: 'Montserrat', category: 'sans', roles: ['body'], weights: ALL, italic: true, fallback: sans, scale: 0.95 },
  { family: 'Inter', category: 'sans', roles: ['body'], weights: ALL, italic: true, fallback: sans, scale: 1 },
  { family: 'Manrope', category: 'sans', roles: ['body'], weights: [300, 400, 500, 600, 700, 800], fallback: sans, scale: 1 },
  { family: 'DM Sans', category: 'sans', roles: ['body'], weights: ALL, italic: true, fallback: sans, scale: 1 },
  { family: 'Poppins', category: 'sans', roles: ['body'], weights: ALL, italic: true, fallback: sans, scale: 0.95 },
  // Heading and body
  { family: 'Outfit', category: 'sans', roles: ['heading', 'body'], weights: ALL, fallback: sans, scale: 1 },
  // Display headings (Celebration)
  { family: 'Space Grotesk', category: 'sans', roles: ['heading'], weights: [300, 400, 500, 600, 700], fallback: sans, scale: 0.98 },
  { family: 'Sora', category: 'sans', roles: ['heading'], weights: [300, 400, 500, 600, 700, 800], fallback: sans, scale: 0.96 },
  { family: 'Bebas Neue', category: 'display', roles: ['heading'], weights: [400], fallback: 'Impact, sans-serif', scale: 1.16 },
  { family: 'Anton', category: 'display', roles: ['heading'], weights: [400], fallback: 'Impact, sans-serif', scale: 1.08 },
  { family: 'Archivo Black', category: 'display', roles: ['heading'], weights: [400], fallback: sans, scale: 0.94 },
  { family: 'Bangers', category: 'display', roles: ['heading'], weights: [400], fallback: 'Impact, sans-serif', scale: 1.1 },
  // Script accents (Romance)
  { family: 'Parisienne', category: 'script', roles: ['accent'], weights: [400], fallback: script, scale: 1.15 },
  { family: 'Great Vibes', category: 'script', roles: ['accent'], weights: [400], fallback: script, scale: 1.25 },
  { family: 'Allura', category: 'script', roles: ['accent'], weights: [400], fallback: script, scale: 1.2 },
  // Legacy (old Celebration invites)
  { family: 'Bricolage Grotesque', category: 'sans', roles: ['heading'], weights: [300, 400, 500, 600, 700, 800], fallback: sans, scale: 1, legacy: true },
  { family: 'Caveat', category: 'script', roles: ['accent'], weights: [400, 500, 600, 700], fallback: script, scale: 1.2, legacy: true },
]

export const getFont = (family: string | undefined) => FONTS.find((f) => f.family === family)
export const fontStack = (f: FontDef) => `"${f.family}", ${f.fallback}`

export const TEMPLATE_FONT_OPTIONS: Record<TemplateKey, Partial<Record<FontRole, string[]>>> = {
  romance: {
    heading: ['Cormorant Garamond', 'Playfair Display', 'Bodoni Moda'],
    body: ['Lora', 'Montserrat', 'DM Sans'],
    accent: ['Parisienne', 'Great Vibes', 'Allura'],
  },
  editorial: {
    heading: ['Cormorant Garamond', 'Bodoni Moda', 'Playfair Display', 'DM Serif Display'],
    body: ['Libre Baskerville', 'Montserrat', 'Inter', 'Manrope', 'DM Sans'],
  },
  celebration: {
    heading: ['Space Grotesk', 'Sora', 'Bebas Neue', 'Anton', 'Archivo Black', 'Outfit', 'Bangers'],
    body: ['Poppins', 'DM Sans', 'Outfit'],
  },
}

export const TEMPLATE_FONT_DEFAULTS: Record<TemplateKey, Tokens> = {
  romance: { [T.headingFont]: 'Cormorant Garamond', [T.bodyFont]: 'Montserrat', [T.accentFont]: 'Parisienne' },
  editorial: { [T.headingFont]: 'Cormorant Garamond', [T.bodyFont]: 'Montserrat' },
  celebration: { [T.headingFont]: 'Space Grotesk', [T.bodyFont]: 'DM Sans' },
}

const FONT_KEYS = [T.headingFont, T.bodyFont, T.accentFont]

/**
 * Every real weight is listed; the browser only downloads the faces a page actually uses,
 * so template classes like font-extrabold get a true face wherever the family has one.
 */
function familySpec(def: FontDef): string {
  const name = def.family.replace(/ /g, '+')
  const ws = [...def.weights].sort((a, b) => a - b)
  if (def.italic) return `${name}:ital,wght@${[...ws.map((w) => `0,${w}`), ...ws.map((w) => `1,${w}`)].join(';')}`
  return `${name}:wght@${ws.join(';')}`
}

/** One Google Fonts URL containing ONLY the fonts this invite uses. */
export function fontsUrl(tokens: Tokens | null | undefined): string | null {
  const defs = new Map<string, FontDef>()
  for (const key of FONT_KEYS) {
    const def = getFont(tokens?.[key])
    if (def) defs.set(def.family, def)
  }
  if (!defs.size) return null
  return `https://fonts.googleapis.com/css2?family=${[...defs.values()].map(familySpec).join('&family=')}&display=swap`
}

/** CSS variables for fonts in the registry. Families outside it (e.g. "Georgia") are left to tokenStyle. */
export function fontVars(tokens: Tokens | null | undefined): Record<string, string> {
  const out: Record<string, string> = {}
  const h = getFont(tokens?.[T.headingFont])
  const b = getFont(tokens?.[T.bodyFont])
  const a = getFont(tokens?.[T.accentFont])
  if (h) { out['--invite-heading-font'] = fontStack(h); out['--invite-heading-scale'] = String(h.scale) }
  if (b) { out['--invite-body-font'] = fontStack(b); out['--invite-body-scale'] = String(b.scale) }
  if (a) { out['--invite-accent-font'] = fontStack(a); out['--invite-accent-scale'] = String(a.scale) }
  return out
}
