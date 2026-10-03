import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, QrCode } from 'lucide-react'
import { useEventStats } from '@/hooks/useEventsStats'
import { ErrorState } from '@/components/ui/ErrorState'

export function EventStatsPage() {
  const { id: eventId } = useParams()
  const { stats, loading, error, reload } = useEventStats(eventId)

  return (
    <div className="mx-auto max-w-2xl">
      <Link to={`/events/${eventId}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Event
      </Link>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="font-display text-2xl text-plum-900">Live stats</h1>
        <Link to={`/events/${eventId}/check-in`} className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm hover:bg-gold-100">
          <QrCode className="size-4" /> Open check-in
        </Link>
      </div>

      {error ? (
        <ErrorState message={error} onRetry={reload} />
      ) : loading || !stats ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {([
            ['Expected', stats.expected],
            ['Checked in', stats.checkedIn],
            ['Attending', stats.attending],
            ['Pending', stats.pending],
            ['Declined', stats.declined],
          ] as [string, number][]).map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-line bg-white p-5 text-center shadow-sm">
              <p className="font-display text-3xl text-plum-900">{value}</p>
              <p className="mt-1 text-sm text-muted">{label}</p>
            </div>
          ))}
        </div>
      )}
      <p className="mt-6 text-xs text-muted">Updates live as guests check in.</p>
    </div>
  )
}