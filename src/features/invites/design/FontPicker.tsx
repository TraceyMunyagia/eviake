import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronDown } from 'lucide-react'
import type { TemplateKey } from '../sections/catalog'
import { fontStack, getFont, TEMPLATE_FONT_OPTIONS, type FontRole } from './fontRegistry'

const SPECIMEN = 'Tania & Surie'

/** Loads only the specimen's glyphs for each option, so opening the list stays cheap. */
function useSpecimens(families: string[], enabled: boolean) {
  const key = families.join('|')
  useEffect(() => {
    if (!enabled || !key) return
    const q = key.split('|').map((f) => `family=${f.replace(/ /g, '+')}`).join('&')
    const link = document.createElement('link')
    link.rel = 'stylesheet'
    link.href = `https://fonts.googleapis.com/css2?${q}&text=${encodeURIComponent(SPECIMEN)}&display=swap`
    document.head.appendChild(link)
    return () => link.remove()
  }, [key, enabled])
}

export function FontPicker({ label, role, template, value, onChange }: {
  label: string
  role: FontRole
  template: TemplateKey
  value: string | undefined
  onChange: (family: string) => void
}) {
  const allowed = TEMPLATE_FONT_OPTIONS[template][role] ?? []
  // A font the template no longer offers (e.g. a legacy one) stays visible as the current choice
  const options = value && !allowed.includes(value) && getFont(value) ? [value, ...allowed] : allowed
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState(0)
  const root = useRef<HTMLDivElement>(null)
  const listId = useId()
  useSpecimens(options, open)

  useEffect(() => {
    if (open) setActive(Math.max(0, options.indexOf(value ?? '')))
  }, [open])

  const current = getFont(value)
  const pick = (f: string) => { onChange(f); setOpen(false) }

  function onKey(e: KeyboardEvent) {
    if (!open && (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setOpen(true); return }
    if (!open) return
    if (e.key === 'Escape') setOpen(false)
    else if (e.key === 'ArrowDown') { e.preventDefault(); setActive((i) => Math.min(i + 1, options.length - 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)) }
    else if (e.key === 'Enter') { e.preventDefault(); pick(options[active]) }
  }

  return (
    <div ref={root} className="relative" onKeyDown={onKey} onBlur={(e) => { if (!root.current?.contains(e.relatedTarget as Node)) setOpen(false) }}>
      <span className="block text-sm font-medium">{label}</span>
      <button
        type="button" aria-haspopup="listbox" aria-expanded={open} aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${active}` : undefined}
        className="mt-1 flex h-11 w-full items-center justify-between rounded-lg border border-line bg-white px-3 text-left"
        onClick={() => setOpen((v) => !v)}
      >
        <span style={current ? { fontFamily: fontStack(current) } : undefined} className="text-lg">{current?.family ?? value ?? 'Choose a font'}</span>
        <ChevronDown className="size-4 text-muted" aria-hidden />
      </button>

      {open && (
        <ul id={listId} role="listbox" aria-label={label} className="absolute z-20 mt-1 max-h-72 w-full overflow-auto rounded-lg border border-line bg-white shadow-lg">
          {options.map((f, i) => {
            const def = getFont(f)
            if (!def) return null
            const selected = f === value
            return (
              <li
                key={f} id={`${listId}-${i}`} role="option" aria-selected={selected}
                className={`cursor-pointer px-3 py-2 ${i === active ? 'bg-gold-100' : ''}`}
                onMouseEnter={() => setActive(i)} onMouseDown={(e) => e.preventDefault()} onClick={() => pick(f)}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <span style={{ fontFamily: fontStack(def) }} className="text-xl">{SPECIMEN}</span>
                  <span className="shrink-0 text-xs text-muted">{f}{def.legacy ? ' (current)' : ''}{selected ? ' ✓' : ''}</span>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
