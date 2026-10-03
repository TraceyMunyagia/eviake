import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle2, Clock, QrCode, XCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

type Question = { id: string; label: string }
type Guest = { name: string; phone: string | null; plus_ones: number; status: 'pending' | 'attending' | 'declined'; responded_at: string | null; checked_in_at: string | null; answers: Record<string, string> }
type Summary = { counts: { attending: number; declined: number; pending: number; heads_attending: number; checked_in: number }; questions: Question[]; guests: Guest[] }

export function RsvpTrackPage() {
  const { token } = useParams()
  const [data, setData] = useState<Summary | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [showCheckedIn, setShowCheckedIn] = useState(false)

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

  const counts = data.counts ?? { attending: 0, declined: 0, pending: 0, heads_attending: 0, checked_in: 0 }
  const questions = Array.isArray(data.questions) ? data.questions : []
  const guests = Array.isArray(data.guests) ? data.guests : []
  const visibleGuests = showCheckedIn ? guests.filter((guest) => Boolean(guest.checked_in_at)) : guests

  return (
    <div className="mx-auto max-w-lg p-6 sm:p-10">
      <h1 className="font-display text-2xl text-plum-900">RSVP tracking</h1>
      <p className="mt-1 text-sm text-muted">A live view of who's responded to your invitation.</p>

     <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-5">
  {([
    ['Attending', counts.attending],
    ['Declined', counts.declined],
    ['Pending', counts.pending],
    ['Total heads', counts.heads_attending],
    ['Checked in', counts.checked_in],
  ] as [string, number][]).map(([label, value]) => (
    <button
      key={label}
      type="button"
      onClick={label === 'Checked in' ? () => setShowCheckedIn((current) => !current) : undefined}
      disabled={label !== 'Checked in'}
      className={`rounded-2xl border border-line bg-white p-4 text-center shadow-sm ${label === 'Checked in' ? 'cursor-pointer transition hover:border-plum-900 hover:shadow-md' : ''} ${label === 'Checked in' && showCheckedIn ? 'border-plum-900 ring-2 ring-plum-200' : ''}`}
      aria-pressed={label === 'Checked in' ? showCheckedIn : undefined}
    >
      <p className="font-display text-2xl text-plum-900">{value}</p>
      <p className="text-xs text-muted">{label}</p>
      {label === 'Checked in' && <span className="mt-1 block text-[10px] text-plum-900">{showCheckedIn ? 'Show all' : 'View guests'}</span>}
    </button>
  ))}
</div>
      <div className="mt-8">
        {visibleGuests.length === 0 ? (
          <p className="text-sm text-muted">{showCheckedIn ? 'No guests have checked in yet.' : 'No responses yet — check back once your guests start replying.'}</p>
        ) : (
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white shadow-sm">
            {visibleGuests.map((g, i) => (
              <li key={i} className="flex items-start justify-between gap-3 px-4 py-3 text-sm">
               <div className="flex min-w-0 items-start gap-2">
  {g.status === 'attending' && <CheckCircle2 className="size-4 text-green-700" />}
  {g.status === 'declined' && <XCircle className="size-4 text-red-700" />}
  {g.status === 'pending' && <Clock className="size-4 text-muted" />}
  {g.checked_in_at && <QrCode className="size-4 text-plum-900" aria-label="Checked in" />}
                 <div className="min-w-0">
                   <p className="font-medium text-plum-900">{g.name}</p>
                   {g.phone && <p className="text-xs text-muted">{g.phone}</p>}
                   {g.plus_ones > 0 && <p className="text-xs text-muted">Party of {g.plus_ones + 1}</p>}
                   {questions.length > 0 && Object.keys(g.answers ?? {}).length > 0 && (
                     <dl className="mt-2 space-y-1 text-xs text-muted">
                       {questions.map((question) => g.answers?.[question.id] ? (
                         <div key={question.id}><dt className="inline font-medium">{question.label}: </dt><dd className="inline">{g.answers[question.id]}</dd></div>
                       ) : null)}
                     </dl>
                   )}
                 </div>
               </div>
               <div className="shrink-0">
                 {g.status === 'attending' && <CheckCircle2 className="size-4 text-green-700" />}
                 {g.status === 'declined' && <XCircle className="size-4 text-red-700" />}
                 {g.status === 'pending' && <Clock className="size-4 text-muted" />}
               </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
