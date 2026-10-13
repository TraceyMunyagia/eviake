import { Field, TextArea, TextInput } from '@/components/ui/Field'
import { usePanel } from '../content/PanelContext'

interface Base { path: string; label: string; hint?: string; placeholder?: string }

const fieldId = (path: string) => `f-${path.replace(/\W/g, '-')}`

function Hint({ text }: { text?: string }) {
  return text ? <p className="mt-1 text-xs text-muted">{text}</p> : null
}

export function TextField({ path, label, hint, placeholder, type = 'text' }: Base & { type?: 'text' | 'url' }) {
  const { get, setPath } = usePanel()
  return (
    <div>
      <TextInput id={fieldId(path)} type={type} label={label} value={get(path) ?? ''} placeholder={placeholder} onChange={(e) => setPath(path, e.target.value)} />
      <Hint text={hint} />
    </div>
  )
}

export function TextAreaField({ path, label, hint, placeholder, rows = 4 }: Base & { rows?: number }) {
  const { get, setPath } = usePanel()
  return (
    <div>
      <TextArea id={fieldId(path)} rows={rows} label={label} value={get(path) ?? ''} placeholder={placeholder} onChange={(e) => setPath(path, e.target.value)} />
      <Hint text={hint} />
    </div>
  )
}

export function DateField({ path, label, hint }: Omit<Base, 'placeholder'>) {
  const { get, setPath } = usePanel()
  return (
    <div>
      <TextInput id={fieldId(path)} type="date" label={label} value={get(path) ?? ''} onChange={(e) => setPath(path, e.target.value)} />
      <Hint text={hint} />
    </div>
  )
}

export function TimeField({ path, label, hint }: Omit<Base, 'placeholder'>) {
  const { get, setPath } = usePanel()
  return (
    <div>
      <TextInput id={fieldId(path)} type="time" label={label} value={get(path) ?? ''} onChange={(e) => setPath(path, e.target.value)} />
      <Hint text={hint} />
    </div>
  )
}

/** defaultOn: what the template does when the value was never set. */
export function SwitchField({ path, label, hint, defaultOn = true }: Omit<Base, 'placeholder'> & { defaultOn?: boolean }) {
  const { get, setPath } = usePanel()
  const v = get(path)
  const checked = typeof v === 'boolean' ? v : defaultOn
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" className="mt-1 size-4 accent-plum-800" checked={checked} onChange={(e) => setPath(path, e.target.checked)} />
      <span>
        <span className="text-sm font-medium">{label}</span>
        {hint && <span className="block text-xs text-muted">{hint}</span>}
      </span>
    </label>
  )
}

/** List of hex colours (dress-code chips). */
export function ColourListField({ path, label, hint }: Omit<Base, 'placeholder'>) {
  const { get, setPath } = usePanel()
  const value = get(path)
  const list: string[] = Array.isArray(value) ? value : []
  return (
    <Field label={label} htmlFor={fieldId(path)}>
      <div id={fieldId(path)} className="mt-1 flex flex-wrap items-center gap-2">
        {list.map((c, i) => (
          <span key={i} className="flex items-center gap-1 rounded-full border border-line bg-white px-1.5 py-1">
            <input
              type="color" aria-label={`Colour ${i + 1}`} value={c}
              className="size-6 cursor-pointer rounded border-0 bg-transparent p-0"
              onChange={(e) => setPath(path, list.map((x, j) => (j === i ? e.target.value : x)))}
            />
            <code className="text-xs">{c}</code>
            <button type="button" aria-label={`Remove colour ${c}`} className="px-1 text-muted hover:text-ink" onClick={() => setPath(path, list.filter((_, j) => j !== i))}>×</button>
          </span>
        ))}
        {list.length < 8 && (
          <button type="button" className="rounded-full border border-dashed border-line px-3 py-1 text-xs hover:bg-gold-100" onClick={() => setPath(path, [...list, '#c9a96e'])}>
            + Add colour
          </button>
        )}
      </div>
      <Hint text={hint} />
    </Field>
  )
}
