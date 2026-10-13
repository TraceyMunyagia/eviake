import type { TemplateKey } from '../sections/catalog'
import { T, type Tokens } from './tokenKeys'

export interface Preset { name: string; tokens: Tokens }

// Light backgrounds only: templates assume dark text (primary) on a light page.
export const PRESETS: Record<TemplateKey, Preset[]> = {
  editorial: [
    { name: 'Ivory & gold', tokens: { [T.primary]: '#1f1b16', [T.accent]: '#b08d57', [T.background]: '#faf7f2' } },
    { name: 'Stone & bronze', tokens: { [T.primary]: '#2a2622', [T.accent]: '#8c6a43', [T.background]: '#f1ede6' } },
    { name: 'White & ink', tokens: { [T.primary]: '#111111', [T.accent]: '#9a7b4f', [T.background]: '#ffffff' } },
  ],
  romance: [
    { name: 'Blush', tokens: { [T.primary]: '#5a3a3f', [T.accent]: '#c08a8f', [T.background]: '#fbf4f1' } },
    { name: 'Champagne', tokens: { [T.primary]: '#4a3b2c', [T.accent]: '#c9a96e', [T.background]: '#fbf7ef' } },
    { name: 'Sage & cream', tokens: { [T.primary]: '#33402f', [T.accent]: '#8aa088', [T.background]: '#f8f6ee' } },
  ],
  celebration: [
    { name: 'Electric', tokens: { [T.primary]: '#6c2bd9', [T.secondary]: '#ff5c8a', [T.accent]: '#ffd23f', [T.background]: '#fff8ef' } },
    { name: 'Sunset', tokens: { [T.primary]: '#d9480f', [T.secondary]: '#7048e8', [T.accent]: '#fcc419', [T.background]: '#fff9f0' } },
    { name: 'Mint pop', tokens: { [T.primary]: '#0b7a75', [T.secondary]: '#ff6b6b', [T.accent]: '#ffe066', [T.background]: '#f4fffb' } },
  ],
}

export const COLOUR_FIELDS: Record<TemplateKey, { key: string; label: string; hint: string }[]> = {
  editorial: [
    { key: T.primary, label: 'Main colour', hint: 'Headings and text.' },
    { key: T.accent, label: 'Accent', hint: 'Lines, markers and highlights.' },
    { key: T.background, label: 'Background', hint: 'Page colour.' },
  ],
  romance: [
    { key: T.primary, label: 'Main colour', hint: 'Headings and text.' },
    { key: T.accent, label: 'Accent', hint: 'Ornaments, buttons and the seal.' },
    { key: T.background, label: 'Background', hint: 'Page colour.' },
  ],
  celebration: [
    { key: T.primary, label: 'Main colour', hint: 'Big colour blocks, headings and text.' },
    { key: T.secondary, label: 'Second colour', hint: 'Alternate colour blocks.' },
    { key: T.accent, label: 'Accent', hint: 'Stickers, shapes and highlights.' },
    { key: T.background, label: 'Background', hint: 'Plain sections.' },
  ],
}
