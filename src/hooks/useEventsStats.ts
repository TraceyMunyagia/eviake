import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

type Stats = { expected: number; attending: number; declined: number; pending: number; checkedIn: number }
type Row = { plus_ones: number; checked_in_at: string | null; rsvps: { status: string } | null }

export function useEventStats(eventId: string | undefined) {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!eventId) return
    const { data, error: err } = await supabase
      .from('guests')
      .select('plus_ones, checked_in_at, rsvps(status)')
      .eq('event_id', eventId)
    if (err) { setError(err.message); setLoading(false); return }
    setError(null)
    const rows = (data ?? []) as unknown as Row[]
    setStats({
      expected: rows.filter((r) => r.rsvps?.status === 'attending').reduce((s, r) => s + 1 + r.plus_ones, 0),
      attending: rows.filter((r) => r.rsvps?.status === 'attending').length,
      declined: rows.filter((r) => r.rsvps?.status === 'declined').length,
      pending: rows.filter((r) => !r.rsvps || r.rsvps.status === 'pending').length,
      checkedIn: rows.filter((r) => r.checked_in_at).length,
    })
    setLoading(false)
  }, [eventId])

  useEffect(() => { load() }, [load])

  // Live updates: re-fetch whenever a guest row for this event changes —
  // specifically, whenever a check-in happens at the door.
  useEffect(() => {
    if (!eventId) return
    const channel = supabase
      .channel(`guests-${eventId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'guests', filter: `event_id=eq.${eventId}` }, load)
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [eventId, load])

  return { stats, loading, error, reload: load }
}