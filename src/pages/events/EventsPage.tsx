import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CalendarDays, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/format'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EventForm } from '@/pages/events/EventForm'
import type { EventRecord } from '@/types/database'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { DataCard } from '@/components/ui/DataCard'
import { TableSkeleton } from '@/components/ui/Skeleton.'

type Row = EventRecord & { clients: { name: string } | null; guest_count: number; attending_count: number }

function daysUntil(date: string | null) {
  if (!date) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86_400_000)
}

export function EventsPage() {
  const { active } = useBusiness()
  const navigate = useNavigate()
  const [rows, setRows] = useState<Row[]>([])
  const [search, setSearch] = useState('')
  const [creating, setCreating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    const [e, g] = await Promise.all([
      supabase.from('events').select('*, clients(name)').eq('business_id', active.id).order('event_date', { ascending: true, nullsFirst: false }),
      supabase.from('guests').select('event_id, rsvps(status)').eq('business_id', active.id),
    ])
    if (e.error || g.error) {
      setLoadError(e.error?.message ?? g.error?.message ?? 'Could not load events.')
      setLoading(false)
      return
    }
    setLoadError(null)
    const counts: Record<string, { total: number; attending: number }> = {}
    ;(g.data ?? []).forEach((row: any) => {
      const c = counts[row.event_id] ?? (counts[row.event_id] = { total: 0, attending: 0 })
      c.total += 1
      if (row.rsvps?.status === 'attending') c.attending += 1
    })
    setRows(((e.data ?? []) as any[]).map((r) => ({
      ...r,
      guest_count: counts[r.id]?.total ?? 0,
      attending_count: counts[r.id]?.attending ?? 0,
    })) as Row[])
    setLoading(false)
  }, [active])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return q ? rows.filter((r) => [r.name, r.clients?.name, r.venue].some((v) => v?.toLowerCase().includes(q))) : rows
  }, [rows, search])

  if (!active) return null

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-plum-900">Events</h1>
          <p className="mt-1 text-sm text-muted">Every event, its guest list and RSVP progress.</p>
        </div>
        <Button onClick={() => setCreating(true)}><Plus className="size-4" /> New event</Button>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search events, clients or venues"
        aria-label="Search events"
        className="mb-4 w-full max-w-sm rounded-lg border border-line px-3 py-2 text-sm"
      />

      {loadError ? (
        <ErrorState message={loadError} onRetry={load} />
      ) : loading ? (
        <TableSkeleton />
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white shadow-sm">
          <EmptyState
            icon={CalendarDays}
            title={search ? 'No events match your search' : 'No events yet'}
            body={search ? 'Try a different search.' : 'Create your first event to start tracking guests and RSVPs.'}
            actionLabel={!search ? 'New event' : undefined}
            onAction={!search ? () => setCreating(true) : undefined}
          />
        </div>
      ) : (
      <>
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>{['Event', 'Client', 'Date', 'Venue', 'Guests', 'RSVPs'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const d = daysUntil(r.event_date)
              return (
                <tr key={r.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link to={`/events/${r.id}`} className="font-medium text-plum-900 hover:underline">{r.name}</Link>
                    {r.event_type && <span className="ml-2 text-xs text-muted">{r.event_type}</span>}
                  </td>
                  <td className="px-4 py-3">{r.clients?.name}</td>
                  <td className="px-4 py-3">
                    {formatDate(r.event_date)}
                    {d !== null && d >= 0 && <span className="ml-2 text-xs text-muted">in {d}d</span>}
                  </td>
                  <td className="px-4 py-3">{r.venue || '–'}</td>
                  <td className="px-4 py-3">{r.guest_count}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={r.attending_count === r.guest_count && r.guest_count > 0 ? 'live' : 'pending'}>
                      {r.attending_count} / {r.guest_count}
                    </StatusBadge>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <div className="space-y-3 sm:hidden">
        {filtered.map((r) => (
          <DataCard
            key={r.id}
            onClick={() => navigate(`/events/${r.id}`)}
            title={r.name}
            subtitle={r.clients?.name}
            rows={[
              { label: 'Date', value: formatDate(r.event_date) },
              { label: 'Venue', value: r.venue || '–' },
              { label: 'Guests', value: r.guest_count },
              { label: 'RSVPs', value: <StatusBadge tone={r.attending_count === r.guest_count && r.guest_count > 0 ? 'live' : 'pending'}>{r.attending_count} / {r.guest_count}</StatusBadge> },
            ]}
          />
        ))}
      </div>
      </>
      )}

      <Modal open={creating} onClose={() => setCreating(false)} title="New event">
        {creating && <EventForm business={active} event={null} onClose={() => setCreating(false)} onSaved={() => { setCreating(false); load() }} />}
      </Modal>
    </div>
  )
}
