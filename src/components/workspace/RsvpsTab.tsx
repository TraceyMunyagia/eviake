import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/format'
import { cn } from '@/lib/utils'
import { StatusBadge, type Tone } from '@/components/ui/StatusBadge'
import type { EventRecord, Guest, RsvpStatus } from '@/types/database'
import { DataCard } from '@/components/ui/DataCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { ClipboardList } from 'lucide-react'

const RSVP_LABEL: Record<RsvpStatus, string> = { pending: 'Pending', attending: 'Attending', declined: 'Declined' }
const RSVP_TONE: Record<RsvpStatus, Tone> = { pending: 'pending', attending: 'live', declined: 'overdue' }

type Row = {
  guest_id: string
  business_id: string
  status: RsvpStatus
  responded_at: string | null
  guests: Pick<Guest, 'name' | 'group_name' | 'plus_ones'>
}

export function RsvpsTab({ event }: { event: EventRecord }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('rsvps')
      .select('*, guests!inner(name, group_name, plus_ones, event_id)')
      .eq('guests.event_id', event.id)
    setError(err ? err.message : null)
    setRows((data ?? []) as unknown as Row[])
    setLoading(false)
  }, [event.id])

  useEffect(() => {
    load()
  }, [load])

  async function setStatus(row: Row, status: RsvpStatus) {
    setRows((prev) => prev.map((r) => (r.guest_id === row.guest_id ? { ...r, status } : r)))
    const { error: err } = await supabase.from('rsvps').update({ status }).eq('guest_id', row.guest_id)
    if (err) {
      setError(err.message)
      load()
    }
  }

  const counts = rows.reduce(
    (acc, r) => {
      acc[r.status] += 1
      if (r.status === 'attending') acc.headsAttending += 1 + r.guests.plus_ones
      return acc
    },
    { pending: 0, attending: 0, declined: 0, headsAttending: 0 } as Record<RsvpStatus | 'headsAttending', number>,
  )

  return (
    <div className="mt-6 space-y-6">
      <section className="grid gap-4 sm:grid-cols-4">
        {([
          ['Attending', counts.attending],
          ['Declined', counts.declined],
          ['Pending', counts.pending],
          ['Heads attending', counts.headsAttending],
        ] as [string, number][]).map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
            <p className="text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-2xl text-plum-900">{value}</p>
          </div>
        ))}
      </section>

      {error ? (
        <ErrorState message={error} onRetry={load} />
      ) : !loading && rows.length === 0 ? (
        <EmptyState icon={ClipboardList} title="No RSVPs to track yet" body="Add guests on the Guests tab — every guest gets an RSVP row automatically." />
      ) : (
        <>
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>{['Guest', 'Group', 'Status', 'Responded'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.guest_id} className="border-b border-line last:border-0">
                <td className="px-4 py-3 font-medium">{r.guests.name}</td>
                <td className="px-4 py-3">{r.guests.group_name || '–'}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <StatusBadge tone={RSVP_TONE[r.status]}>{RSVP_LABEL[r.status]}</StatusBadge>
                    <select
                      aria-label={`RSVP status for ${r.guests.name}`}
                      value={r.status}
                      onChange={(e) => setStatus(r, e.target.value as RsvpStatus)}
                      className="rounded-lg border border-line bg-white px-2 py-1 text-sm"
                    >
                      {Object.entries(RSVP_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                    </select>
                  </div>
                </td>
                <td className={cn('px-4 py-3', !r.responded_at && 'text-muted')}>{r.responded_at ? formatDateTime(r.responded_at) : '–'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 sm:hidden">
        {rows.map((r) => (
          <DataCard
            key={r.guest_id}
            title={r.guests.name}
            subtitle={r.guests.group_name || undefined}
            rows={[
              {
                label: 'Status',
                value: (
                  <select
                    aria-label={`RSVP status for ${r.guests.name}`}
                    value={r.status}
                    onChange={(e) => setStatus(r, e.target.value as RsvpStatus)}
                    className="rounded-lg border border-line bg-white px-2 py-1 text-sm"
                  >
                    {Object.entries(RSVP_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                ),
              },
              { label: 'Responded', value: r.responded_at ? formatDateTime(r.responded_at) : '–' },
            ]}
          />
        ))}
      </div>
        </>
      )}
    </div>
  )
}
