import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useLaunchChecklist } from '@/hooks/useLaunchChecklist'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatDateTime } from '@/lib/format'

type Item = { key: string; label: string; to: string }

const ITEMS: Item[] = [
  { key: 'pricing-web', label: 'Set real prices for Evia Web packages and add-ons', to: '/pricing' },
  { key: 'pricing-invites', label: 'Set real prices for Evia Invites packages (if any)', to: '/pricing' },
  { key: 'clients', label: 'Import or enter your current clients', to: '/clients' },
  { key: 'orders', label: 'Enter active projects as orders, with correct stages', to: '/orders' },
  { key: 'hosting', label: 'Fill in domain and hosting records for live sites', to: '/domains-hosting' },
  { key: 'events', label: 'Enter any upcoming Evia Invites events', to: '/events' },
  { key: 'team', label: 'Invite any teammates and confirm their access', to: '/settings' },
]

export function LaunchChecklistPage() {
  const { rows, loading, error, toggle, isDone, reload } = useLaunchChecklist()
  const completed = ITEMS.filter((i) => isDone(i.key)).length

  return (
    <div>
      <h1 className="font-display text-3xl text-plum-900">Launch checklist</h1>
      <p className="mt-1 text-sm text-muted">{completed} / {ITEMS.length} done, shared across your whole team.</p>

      {error ? (
        <div className="mt-6"><ErrorState message={error} onRetry={reload} /></div>
      ) : loading ? (
        <p className="mt-6 text-sm text-muted">Loading…</p>
      ) : (
        <ul className="mt-6 space-y-2">
          {ITEMS.map((item) => {
            const done = isDone(item.key)
            const row = rows.find((r) => r.item_key === item.key)
            return (
              <li key={item.key} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
                <button
                  aria-label={done ? `Mark ${item.label} as not done` : `Mark ${item.label} as done`}
                  onClick={() => toggle(item.key, done)}
                  className={cn(
                    'flex size-6 shrink-0 items-center justify-center rounded-full border',
                    done ? 'border-gold-500 bg-gold-500 text-plum-950' : 'border-line',
                  )}
                >
                  {done && <Check className="size-4" />}
                </button>
                <div className="flex-1">
                  <span className={cn('text-sm', done && 'text-muted line-through')}>{item.label}</span>
                  {done && row?.done_at && <p className="text-xs text-muted">Done {formatDateTime(row.done_at)}</p>}
                </div>
                <Link to={item.to} className="text-sm text-plum-900 underline">Go</Link>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}