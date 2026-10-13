import { ChevronDown } from 'lucide-react'
import type { Invite } from '@/types/database'
import type { PackageKey, SectionKey, TemplateKey } from '../sections/catalog'
import { catalogFor, enabledKeys, type SectionFlags } from '../sections/sectionModel'
import { sectionWarning } from '../sections/sectionWarnings'
import { PanelProvider, type UpdateInvite } from './content/PanelContext'
import { PANELS } from './panels/panelRegistry'
import { previewScrollTo } from './previewBridge'

export function DetailsStep({ invite, template, pkg, flags, updateInvite, replaceInvite, upload, active, onActive, onGoSections }: {
  invite: Invite
  template: TemplateKey
  pkg: PackageKey
  flags: SectionFlags
  updateInvite: UpdateInvite
  replaceInvite: (invite: Invite) => void
  upload: (file: File, kind?: 'image' | 'video' | 'audio') => Promise<string>
  active: SectionKey | null
  onActive: (k: SectionKey | null) => void
  onGoSections: () => void
}) {
  const keys = enabledKeys(template, flags)
  const defs = catalogFor(template)
  const openKey = active && keys.includes(active) ? active : null

  return (
    <PanelProvider invite={invite} template={template} pkg={pkg} updateInvite={updateInvite} replaceInvite={replaceInvite} upload={upload}>
      <div className="space-y-3">
        <div>
          <h2 className="font-display text-lg text-plum-900">Add your details</h2>
          <p className="text-sm text-muted">Open a section to edit it. The preview jumps to it, and changes save as you type.</p>
        </div>

        <ul className="divide-y divide-line rounded-2xl border border-line bg-white shadow-sm">
          {keys.map((k) => {
            const def = defs.find((d) => d.key === k)
            const Panel = PANELS[k]
            const open = openKey === k
            const warn = sectionWarning(k, invite.content)
            return (
              <li key={k}>
                <button
                  type="button"
                  aria-expanded={open}
                  className="flex w-full items-center justify-between gap-3 p-3 text-left hover:bg-gold-100/40"
                  onClick={() => {
                    onActive(open ? null : k)
                    if (!open) previewScrollTo(k)
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium">{def?.label ?? k}</span>
                    {warn && <span title={warn} role="img" aria-label={warn} className="size-2 rounded-full bg-amber-500" />}
                  </span>
                  <ChevronDown className={`size-4 text-muted transition ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="border-t border-line p-4">
                    {warn && <p className="mb-3 text-xs text-amber-800">⚠ {warn}</p>}
                    <Panel />
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        <p className="text-sm text-muted">
          Need a different section?{' '}
          <button type="button" className="text-plum-900 underline underline-offset-4" onClick={onGoSections}>Change sections</button>
        </p>
      </div>
    </PanelProvider>
  )
}
