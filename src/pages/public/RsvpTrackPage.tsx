import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Guest = { name: string; phone: string | null; plus_ones: number; status: 'pending' | 'attending' | 'declined'; responded_at: string | null }
type Summary = { counts: { attending: number; declined: number; pending: number; heads_attending: number }; guests: Guest[] }

export function RsvpTrackPage() {
  const { token } = useParams()
  const [data, setData] = useState<Summary | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    if (!token) return
    supabase.rpc('get_rsvp_summary_by_token', { p_token: token }).then(({ data, error }) => {
      if (error || !data) return setState('missing')
      setData(data as Summary)
      setState('ready')
    })
  }, [token])

  if (state === 'loading') return <p className="p-10 text-center text-sm text-muted">Loading…</p>
  if (state === 'missing' || !data) return <p className="p-10 text-center text-sm text-muted">This tracking link could not be found.</p>

  const { counts, guests } = data

  return (
    <div className="mx-auto max-w-lg p-6 sm:p-10">
      <h1 className="font-display text-2xl text-plum-900">RSVP tracking</h1>
      <p className="mt-1 text-sm text-muted">A live view of who's responded to your invitation.</p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {([
          ['Attending', counts.attending],
          ['Declined', counts.declined],
          ['Pending', counts.pending],
          ['Total heads', counts.heads_attending],
        ] as [string, number][]).map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4 text-center shadow-sm">
            <p className="font-display text-2xl text-plum-900">{value}</p>
            <p className="text-xs text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8">
        {guests.length === 0 ? (
          <p className="text-sm text-muted">No responses yet — check back once your guests start replying.</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white shadow-sm">
            {guests.map((g, i) => (
              <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>
                  {g.name}
                  {g.phone && <span className="block text-xs text-muted">{g.phone}</span>}
                  {g.plus_ones > 0 && <span className="text-muted"> +{g.plus_ones}</span>}
                </span>
                {g.status === 'attending' && <CheckCircle2 className="size-4 text-green-700" />}
                {g.status === 'declined' && <XCircle className="size-4 text-red-700" />}
                {g.status === 'pending' && <Clock className="size-4 text-muted" />}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
