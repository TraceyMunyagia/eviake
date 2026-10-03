import { useCallback, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { ErrorState } from '@/components/ui/ErrorState'
import type { Invite } from '@/types/database'

type Row = { id: string; guest_name: string; message: string; created_at: string }

export function GuestbookPanel({ invite }: { invite: Invite }) {
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!invite.event_id) { setLoading(false); return }
    setLoading(true)
    const { data, error: err } = await supabase
      .from('guestbook_messages')
      .select('id, guest_name, message, created_at')
      .eq('event_id', invite.event_id)
      .order('created_at', { ascending: false })
    if (err) { setError(err.message); setLoading(false); return }
    setError(null)
    setRows((data ?? []) as Row[])
    setLoading(false)
  }, [invite.event_id])

  useEffect(() => { load() }, [load])

  async function remove(row: Row) {
    setRows((prev) => prev.filter((r) => r.id !== row.id))
    const { error: err } = await supabase.from('guestbook_messages').delete().eq('id', row.id)
    if (err) { setError(err.message); load() }
  }

  if (!invite.event_id) {
    return <p className="rounded-2xl border border-line bg-white p-5 text-sm text-muted shadow-sm">The guestbook opens once this invite is published.</p>
  }
  if (error) return <ErrorState message={error} onRetry={load} />
  if (loading) return <p className="text-sm text-muted">Loading…</p>

  return (
    <div>
      <section>
        <h3 className="mb-2 text-sm font-medium text-plum-900">Guest messages ({rows.length})</h3>
        {rows.length === 0 ? (
          <p className="text-sm text-muted">No messages yet.</p>
        ) : (
          <ul className="space-y-2">
            {rows.map((r) => (
              <li key={r.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <p className="text-sm font-medium">{r.guest_name} <span className="font-normal text-muted">· {formatDateTime(r.created_at)}</span></p>
                <p className="mt-1 whitespace-pre-wrap text-sm">{r.message}</p>
                <div className="mt-3 flex gap-2">
                  <Button variant="secondary" onClick={() => remove(r)}><Trash2 className="size-4" /> Delete</Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

    </div>
  )
}
