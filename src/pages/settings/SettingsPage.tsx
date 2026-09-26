import { useSearchParams } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { OrgProfilePanel } from '@/components/settings/OrgProfilePanel'
import { TeamPanel } from '@/components/settings/TeamPanel'

const TABS = [
  { key: 'organization', label: 'Organization' },
  { key: 'team', label: 'Team' },
]

export function SettingsPage() {
  const [params, setParams] = useSearchParams()
  const tab = TABS.some((t) => t.key === params.get('tab')) ? (params.get('tab') as string) : 'organization'

  return (
    <div>
      <h1 className="mb-6 font-display text-3xl text-plum-900">Settings</h1>

      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
        {TABS.map((t) => (
          <button
            key={t.key}
            role="tab"
            aria-selected={tab === t.key}
            onClick={() => setParams({ tab: t.key }, { replace: true })}
            className={cn(
              '-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm',
              tab === t.key ? 'border-gold-500 font-medium text-plum-900' : 'border-transparent text-muted hover:text-ink',
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'organization' && <OrgProfilePanel />}
      {tab === 'team' && <TeamPanel />}
    </div>
  )
}