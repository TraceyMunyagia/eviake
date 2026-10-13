// The keys in invites.tokens. Fix names here only.
export const T = {
  headingFont: 'heading_font',
  bodyFont: 'body_font',
  accentFont: 'accent_font',
  primary: 'primary',
  accent: 'accent',
  secondary: 'secondary',
  background: 'background',
} as const

export type Tokens = Record<string, string | undefined>
