import { STAT_CARDS } from '@/config/nav'
import { useBusiness } from '@/context/BusinessContext'

export function Dashboard() {
  const { active } = useBusiness()
  if (!active) return null

  return (
    <div>
      <h1 className="font-display text-3xl text-plum-900">{active.name}</h1>
      <p className="mt-1 text-sm text-muted">Live numbers arrive as each module is built.</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {STAT_CARDS[active.slug].map((label) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-2 font-display text-3xl text-plum-900">–</p>
          </div>
        ))}
      </div>
    </div>
  )
}