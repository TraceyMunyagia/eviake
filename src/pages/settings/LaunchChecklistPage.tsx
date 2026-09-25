import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

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

const STORAGE_KEY = 'evia-launch-checklist'

export function LaunchChecklistPage() {
  const [done, setDone] = useState<Record<string, boolean>>({})

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) setDone(JSON.parse(raw))
    } catch { /* ignore */ }
  }, [])

  function toggle(key: string) {
    setDone((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)) } catch { /* ignore */ }
      return next
    })
  }

  const completed = ITEMS.filter((i) => done[i.key]).length

  return (
    <div>
      <h1 className="font-display text-3xl text-plum-900">Launch checklist</h1>
      <p className="mt-1 text-sm text-muted">{completed} / {ITEMS.length} done. This list only lives in this browser.</p>

      <ul className="mt-6 space-y-2">
        {ITEMS.map((item) => (
          <li key={item.key} className="flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-sm">
            <button
              aria-label={done[item.key] ? `Mark ${item.label} as not done` : `Mark ${item.label} as done`}
              onClick={() => toggle(item.key)}
              className={cn(
                'flex size-6 shrink-0 items-center justify-center rounded-full border',
                done[item.key] ? 'border-gold-500 bg-gold-500 text-plum-950' : 'border-line',
              )}
            >
              {done[item.key] && <Check className="size-4" />}
            </button>
            <span className={cn('flex-1 text-sm', done[item.key] && 'text-muted line-through')}>{item.label}</span>
            <Link to={item.to} className="text-sm text-plum-900 underline">Go</Link>
          </li>
        ))}
      </ul>
    </div>
  )
}