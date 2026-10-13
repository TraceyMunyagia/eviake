import type { TemplateKey } from '../sections/catalog'

const TEMPLATES: { key: TemplateKey; label: string; tagline: string; best: string }[] = [
  { key: 'editorial', label: 'Editorial', tagline: 'Luxury publication', best: 'Weddings, graduations, corporate events' },
  { key: 'romance', label: 'Romance', tagline: 'Wedding stationery brought to life', best: 'Weddings, engagements, showers' },
  { key: 'celebration', label: 'Celebration', tagline: 'Interactive digital party', best: 'Birthdays, parties, launches' },
]

export function StepTemplate({ template, locked, busy, onSelect }: {
  template: TemplateKey
  locked: boolean
  busy: boolean
  onSelect: (t: TemplateKey) => void
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="font-display text-lg text-plum-900">Choose a template</h2>
        <p className="text-sm text-muted">
          {locked
            ? 'This invite is published, so its template is locked to avoid changing the look of something already shared.'
            : "Switching keeps everything you've typed and resets the colours and fonts to the new template's defaults. Sections that don't exist in the new template are kept aside and come back if you switch back."}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        {TEMPLATES.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => onSelect(t.key)}
            disabled={locked || busy}
            aria-pressed={template === t.key}
            className={`rounded-xl border p-4 text-left transition disabled:cursor-not-allowed ${
              template === t.key ? 'border-gold-500 bg-gold-100 shadow-sm' : 'border-line bg-white hover:border-gold-500 disabled:opacity-60 disabled:hover:border-line'
            }`}
          >
            <div className="font-medium text-plum-900">{t.label}</div>
            <div className="text-sm">{t.tagline}</div>
            <div className="mt-2 text-xs text-muted">{t.best}</div>
          </button>
        ))}
      </div>
    </div>
  )
}
