const TABS = [
  { key: 'details', label: 'Details' },
  { key: 'design', label: 'Design' },
  { key: 'sections', label: 'Sections' },
  { key: 'media', label: 'Media' },
  { key: 'rsvp', label: 'RSVP' },
]

export function BuilderTabs({ active, onChange }: { active: string; onChange: (key: string) => void }) {
  return (
    <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
      {TABS.map((t) => (
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