import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { EventForm } from '@/pages/events/EventForm'
import type { EventRecord } from '@/types/database'
import { GuestsTab } from '@/components/workspace/GuestsTab'
import { RsvpsTab } from '@/components/workspace/RsvpsTab'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'guests', label: 'Guests' },
  { key: 'rsvps', label: 'RSVPs' },
]

type EventWithClient = EventRecord & { clients: { name: string; phone: string | null; email: string | null } | null }

export function EventDetailPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { active } = useBusiness()
  const [event, setEvent] = useState<EventWithClient | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [editing, setEditing] = useState(false)

  const load = useCallback(async () => {
    if (!active || !id) return
    const { data } = await supabase
      .from('events')
      .select('*, clients(name, phone, email)')
      .eq('id', id)
      .eq('business_id', active.id)
      .maybeSingle()
    setEvent((data as EventWithClient | null) ?? null)
    setState(data ? 'ready' : 'missing')
  }, [active, id])

  useEffect(() => {
    load()
  }, [load])

  if (!active) return null
  if (state === 'loading') return <p className="text-sm text-muted">Loading…</p>
  if (state === 'missing' || !event) {
    return (
      <div>
        <p className="text-sm">This event was not found in {active.name}.</p>
        <Link to="/events" className="mt-2 inline-block text-sm text-plum-900 underline">Back to events</Link>
      </div>
    )
  }

  const tab = TABS.some((t) => t.key === params.get('tab')) ? (params.get('tab') as string) : 'overview'

  return (
    <div>
      <Link to="/events" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Events
      </Link>

      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-plum-900">{event.name}</h1>
          <p className="mt-1 text-sm text-muted">
            <Link to={`/clients/${event.client_id}`} className="underline">{event.clients?.name}</Link>
            {event.event_date && ` · ${formatDate(event.event_date)}`}
            {event.venue && ` · ${event.venue}`}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}><Pencil className="size-4" /> Edit event</Button>
      </div>

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

      {tab === 'overview' && (
        <section className="mt-6 max-w-2xl rounded-2xl border border-line bg-white p-5 shadow-sm">
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div><dt className="text-muted">Type</dt><dd className="mt-1">{event.event_type ?? '–'}</dd></div>
            <div><dt className="text-muted">Date</dt><dd className="mt-1">{formatDate(event.event_date)}</dd></div>
            <div><dt className="text-muted">Venue</dt><dd className="mt-1">{event.venue ?? '–'}</dd></div>
            <div><dt className="text-muted">Client contact</dt><dd className="mt-1">{event.clients?.phone ?? event.clients?.email ?? '–'}</dd></div>
            <div className="sm:col-span-2"><dt className="text-muted">Notes</dt><dd className="mt-1 whitespace-pre-wrap">{event.notes ?? '–'}</dd></div>
          </dl>
        </section>
      )}
      {tab === 'guests' && <GuestsTab event={event} />}
{tab === 'rsvps' && <RsvpsTab event={event} />}
      <Modal open={editing} onClose={() => setEditing(false)} title="Edit event">
        {editing && (
          <EventForm business={active} event={event} onClose={() => setEditing(false)} onSaved={() => { setEditing(false); load() }} />
        )}
      </Modal>
    </div>
  )
}