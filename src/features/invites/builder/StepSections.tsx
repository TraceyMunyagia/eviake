import { Lock } from 'lucide-react'
import type { InviteContent } from '@/types/database'
import { PACKAGE_LABEL, type PackageKey, type TemplateKey } from '../sections/catalog'
import { sectionWarning } from '../sections/sectionWarnings'
import { catalogFor, defaultFlags, isUnlocked, toggleSection, type SectionFlags } from '../sections/sectionModel'

export function StepSections({ template, pkg, flags, content, busy, onChange }: {
  template: TemplateKey
  pkg: PackageKey
  flags: SectionFlags
  content: InviteContent | null
  busy: boolean
  onChange: (flags: SectionFlags) => void
}) {
  const defs = catalogFor(template)
  const onCount = defs.filter((d) => d.required || flags[d.key]).length

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="font-display text-lg text-plum-900">Choose the sections</h2>
          <p className="text-sm text-muted">
            {onCount} of {defs.length} on · {PACKAGE_LABEL[pkg]} package · the order is fixed by the template
          </p>
        </div>
        <button
          type="button"
          disabled={busy}
          className="text-sm text-plum-900 underline-offset-4 hover:underline disabled:opacity-50"
          onClick={() => onChange({ ...flags, ...defaultFlags(template, pkg) })}
        >
          Reset to package defaults
        </button>
      </div>

      <ul className="divide-y divide-line rounded-2xl border border-line bg-white shadow-sm">
        {defs.map((def) => {
          const locked = !def.required && !isUnlocked(def, pkg)
          const checked = !!def.required || (!!flags[def.key] && !locked)
          const warning = checked ? sectionWarning(def.key, content) : null
          return (
            <li key={def.key} className={`flex items-start gap-3 p-3 ${locked ? 'opacity-60' : ''}`}>
              <input
                id={`sec-${def.key}`}
                type="checkbox"
                className="mt-1 size-4 accent-plum-800"
                checked={checked}
                disabled={def.required || locked || busy}
                onChange={(e) => onChange(toggleSection(flags, template, pkg, def.key, e.target.checked))}
              />
              <label htmlFor={`sec-${def.key}`} className="flex-1 cursor-pointer">
                <span className="text-sm font-medium">{def.label}</span>
                {def.required && <span className="ml-2 rounded bg-gold-100 px-1.5 py-0.5 text-xs text-plum-900">Always on</span>}
                <span className="block text-xs text-muted">{def.hint}</span>
                {locked && (
                  <span className="mt-1 flex items-center gap-1 text-xs text-amber-800">
                    <Lock className="size-3" />
                    Available on {PACKAGE_LABEL[def.minPackage]} and above. Upgrade the package to unlock.
                  </span>
                )}
                {warning && <span className="mt-1 block text-xs text-amber-800">⚠ {warning}</span>}
              </label>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
