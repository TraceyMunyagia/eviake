import { catalogFor, enabledKeys, type SectionFlags } from '../sections/sectionModel'
import { sectionWarning } from '../sections/sectionWarnings'
import type { SectionKey, TemplateKey } from '../sections/catalog'
import { getIn, type Content } from './content/contentPath'
import { P } from './content/contentPaths'
import type { StepId } from './BuilderSteps'

export interface Check { level: 'error' | 'warn'; message: string; step: StepId; section?: SectionKey }

export function runPublishChecks(template: TemplateKey, flags: SectionFlags, content: Content | null): Check[] {
  const c = content ?? {}
  const out: Check[] = []
  if (!getIn(c, P.title) && !getIn(c, P.names)) out.push({ level: 'error', message: "Add an event title or the hosts' names.", step: 'details', section: 'hero' })
  if (!getIn(c, P.date)) out.push({ level: 'error', message: 'Set the event date.', step: 'details', section: 'details' })

  const labels = new Map(catalogFor(template).map((d) => [d.key, d.label]))
  for (const k of enabledKeys(template, flags)) {
    if (k === 'details' || k === 'countdown') continue // the date is already covered above
    const w = sectionWarning(k, c)
    if (w) out.push({ level: 'warn', message: `${labels.get(k) ?? k}: ${w}`, step: 'details', section: k })
  }
  return out
}
