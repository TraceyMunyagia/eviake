import { useEffect, useState } from 'react'
import { inputClass } from '@/components/ui/Field'
import { TEMPLATE_DEFAULT_TOKENS } from '@/lib/inviteDefaults'
import { usePanel } from '../builder/content/PanelContext'
import { contrast, isHex } from './contrast'
import { COLOUR_FIELDS, PRESETS } from './colourPresets'
import { T, type Tokens } from './tokenKeys'

function ColourRow({ label, hint, value, onChange }: { label: string; hint: string; value: string; onChange: (v: string) => void }) {
  const [text, setText] = useState(value)
  useEffect(() => setText(value), [value])
  return (
    <div className="flex items-center gap-3">
      <input type="color" aria-label={`${label} colour picker`} value={isHex(value) ? value : '#000000'}
        className="h-10 w-12 shrink-0 cursor-pointer rounded-lg border border-line bg-white p-0.5" onChange={(e) => onChange(e.target.value)} />
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{label}</div>
        <div className="text-xs text-muted">{hint}</div>
      </div>
      {/* Only a complete #rrggbb is applied; a half-typed value waits */}
      <input aria-label={`${label} hex`} className={`${inputClass.replace('mt-1 ', '')} w-28 font-mono`} value={text} maxLength={7}
        onChange={(e) => { setText(e.target.value); if (isHex(e.target.value)) onChange(e.target.value.toLowerCase()) }}
        onBlur={() => setText(value)} />
    </div>
  )
}

export function ColourPanel() {
  const { invite, template, updateInvite } = usePanel()
  const tokens = (invite.tokens ?? {}) as Tokens
  const defaults = (TEMPLATE_DEFAULT_TOKENS[template] ?? {}) as Tokens
  const fields = COLOUR_FIELDS[template]
  const set = (patch: Tokens) => updateInvite((current) => ({ tokens: { ...current.tokens, ...patch } }))
  const valueOf = (key: string) => tokens[key] ?? defaults[key] ?? '#000000'

  // Text sits on the background in every template (Celebration's plain blocks too; its bold blocks pick their own text colour)
  const text = valueOf(T.primary)
  const bg = valueOf(T.background)
  const ratio = isHex(text) && isHex(bg) ? contrast(text, bg) : null
  const lowContrast = ratio !== null && ratio < 4.5

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <button type="button" className="rounded-full border border-line bg-white px-3 py-1 text-xs hover:bg-gold-100"
          onClick={() => set(Object.fromEntries(fields.map((f) => [f.key, defaults[f.key]])))}>
          Template default
        </button>
        {PRESETS[template].map((p) => (
          <button key={p.name} type="button" className="flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs hover:bg-gold-100" onClick={() => set(p.tokens)}>
            <span className="flex" aria-hidden>
              {Object.values(p.tokens).map((c, i) => <span key={i} className="-ml-1 size-3.5 rounded-full border border-white first:ml-0" style={{ background: c }} />)}
            </span>
            {p.name}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {fields.map((f) => <ColourRow key={f.key} label={f.label} hint={f.hint} value={valueOf(f.key)} onChange={(v) => set({ [f.key]: v })} />)}
      </div>

      {lowContrast && (
        <p role="status" className="rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-sm text-amber-900">
          ⚠ Text may be hard to read on this background (contrast {ratio.toFixed(1)}:1; aim for 4.5:1 or more).
        </p>
      )}
    </div>
  )
}
