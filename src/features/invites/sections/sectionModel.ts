import { PACKAGE_SECTIONS } from '@/lib/inviteDefaults'
import {
  CATALOG, PACKAGE_RANK,
  type PackageKey, type SectionDef, type SectionKey, type TemplateKey,
} from './catalog'

export type SectionFlags = Record<string, boolean>

// Package features that are not tickable sections.
const FEATURE_KEYS = ['rsvp_advanced', 'guest_management', 'video'] as const

function packageFeatures(pkg: PackageKey): SectionFlags {
  const raw = (PACKAGE_SECTIONS as unknown as Record<string, unknown>)[pkg]
  const on: string[] = Array.isArray(raw)
    ? (raw as string[])
    : Object.entries((raw ?? {}) as Record<string, boolean>).filter(([, v]) => v).map(([k]) => k)
  return Object.fromEntries(FEATURE_KEYS.map((k) => [k, on.includes(k)]))
}

export const catalogFor = (template: TemplateKey): SectionDef[] => CATALOG[template] ?? CATALOG.editorial

export const isUnlocked = (def: SectionDef, pkg: PackageKey) =>
  PACKAGE_RANK[pkg] >= PACKAGE_RANK[def.minPackage]

/** Flags for a brand-new invite. */
export function defaultFlags(template: TemplateKey, pkg: PackageKey): SectionFlags {
  const flags: SectionFlags = { ...packageFeatures(pkg) }
  for (const def of catalogFor(template)) {
    flags[def.key] = !!def.required || (isUnlocked(def, pkg) && def.defaultOn !== false)
  }
  return flags
}

/** Read whatever is stored in invites.sections (old or new) into complete flags. */
export function resolveSections(raw: unknown, template: TemplateKey, pkg: PackageKey): SectionFlags {
  const stored: SectionFlags = {}
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    for (const [k, v] of Object.entries(raw as Record<string, unknown>)) {
      if (typeof v === 'boolean') stored[k] = v
    }
  }
  const out: SectionFlags = { ...packageFeatures(pkg), ...stored }
  for (const def of catalogFor(template)) {
    if (def.required) out[def.key] = true
    else if (typeof stored[def.key] === 'boolean') out[def.key] = stored[def.key]
    else if (def.legacyAlwaysOn) out[def.key] = true
    else out[def.key] = isUnlocked(def, pkg) && def.defaultOn !== false
  }
  return out
}

/** Tick or untick one section. Required and locked sections cannot be switched on. */
export function toggleSection(
  flags: SectionFlags, template: TemplateKey, pkg: PackageKey, key: SectionKey, on: boolean,
): SectionFlags {
  const def = catalogFor(template).find((x) => x.key === key)
  if (!def || def.required) return flags
  if (on && !isUnlocked(def, pkg)) return flags
  return { ...flags, [key]: on }
}

/** Switching template: keep the ticks that still make sense, default the rest. */
export function carryFlags(old: SectionFlags, newTemplate: TemplateKey, pkg: PackageKey): SectionFlags {
  const fresh = defaultFlags(newTemplate, pkg)
  for (const def of catalogFor(newTemplate)) {
    if (typeof old[def.key] === 'boolean') {
      fresh[def.key] = def.required ? true : old[def.key] && isUnlocked(def, pkg)
    }
  }
  return { ...old, ...fresh } // old keys for sections the new template lacks survive, so switching back restores them
}

/** Keys that are on, in render order. */
export function enabledKeys(template: TemplateKey, flags: SectionFlags): SectionKey[] {
  return catalogFor(template).filter((d) => d.required || flags[d.key]).map((d) => d.key)
}