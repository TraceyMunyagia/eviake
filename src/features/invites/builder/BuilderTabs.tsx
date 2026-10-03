const BASE_TABS = [
  { key: 'details', label: 'Details' },
  { key: 'design', label: 'Design' },
  { key: 'sections', label: 'Sections' },
  { key: 'media', label: 'Media' },
  { key: 'rsvp', label: 'RSVP' },
]

export function BuilderTabs({ active, onChange, extra = [] }: {
  active: string
  onChange: (key: string) => void
  extra?: { key: string; label: string }[]
}) {
  const tabs = [...BASE_TABS, ...extra]
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {tabs.map((t) => (
        <button
          key={t.key}
          role="tab"
          aria-selected={active === t.key}
          onClick={() => onChange(t.key)}
          className={`-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm ${
            active === t.key ? 'border-gold-500 font-medium text-plum-900' : 'border-transparent text-muted hover:text-ink'
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}