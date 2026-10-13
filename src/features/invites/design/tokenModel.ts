import { TEMPLATE_DEFAULT_TOKENS } from '@/lib/inviteDefaults'
import type { TemplateKey } from '../sections/catalog'
import { TEMPLATE_FONT_OPTIONS, type FontRole } from './fontRegistry'
import { T, type Tokens } from './tokenKeys'

const FONT_ROLES: [FontRole, string][] = [['heading', T.headingFont], ['body', T.bodyFont], ['accent', T.accentFont]]
const defaultsOf = (t: TemplateKey) => (TEMPLATE_DEFAULT_TOKENS[t] ?? {}) as Tokens

/**
 * Switching template: values still at the old template's default move to the new default;
 * anything the user customised stays. Fonts the new template does not offer fall back to its default.
 */
export function carryTokens(old: Tokens | null | undefined, from: TemplateKey, to: TemplateKey): Tokens {
  const prev = old ?? {}
  const fromDef = defaultsOf(from)
  const toDef = defaultsOf(to)
  const next: Tokens = { ...prev }

  for (const key of Object.keys(toDef)) {
    if (prev[key] === undefined || prev[key] === fromDef[key]) next[key] = toDef[key]
  }
  for (const [role, key] of FONT_ROLES) {
    const allowed = TEMPLATE_FONT_OPTIONS[to][role]
    if (!allowed) { delete next[key]; continue }
    if (!next[key] || !allowed.includes(next[key]!)) next[key] = toDef[key]
  }
  return next
}
