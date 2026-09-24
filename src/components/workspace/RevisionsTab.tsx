import { useCallback, useEffect, useState } from 'react'
import { Pencil, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge, type Tone } from '@/components/ui/StatusBadge'
import { REVISION_LABEL, RevisionForm } from '@/components/workspace/RevisionForm'
import type { Order, Revision, RevisionStatus } from '@/types/database'

const TONE: Record<RevisionStatus, Tone> = { requested: 'pending', in_progress: 'progress', done: 'live' }

export function RevisionsTab({ order }: { order: Order }) {
  const [rows, setRows] = useState<Revision[]>([])
  const [included, setIncluded] = useState<number | null>(null)
  const [editing, setEditing] = useState<Revision | 'new' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const [r, p] = await Promise.all([
      supabase.from('revisions').select('*').eq('order_id', order.id).order('request_no'),
      order.package
        ? supabase
            .from('price_items')
            .select('included_revisions')
            .eq('business_id', order.business_id)
            .eq('kind', 'package')
            .eq('name', order.package)
            .maybeSingle()
        : Promise.resolve({ data: null }),
    ])
    setError(r.error ? r.error.message : null)
    setRows((r.data ?? []) as Revision[])
    setIncluded((p.data as { included_revisions: number } | null)?.included_revisions ?? 0)
  }, [order.id, order.package, order.business_id])

  useEffect(() => {
    load()
  }, [load])

  async function setStatus(rev: Revision, status: RevisionStatus) {
    const { error: err } = await supabase.from('revisions').update({ status }).eq('id', rev.id)
    if (err) return setError(err.message)
    load()
  }

  const used = rows.length
  const limit = included ?? 0
  const over = Math.max(used - limit, 0)
  const pct = limit > 0 ? Math.min((used / limit) * 100, 100) : used > 0 ? 100 : 0

  return (
    <div className="mt-6 space-y-6">
      <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-lg text-plum-900">Revisions: {used} / {limit} used</h2>
            <p className="text-sm text-muted">
              {order.package ? `${limit} included with the ${order.package} package.` : 'No package on this order, so no revisions are included.'}
            </p>
          </div>
          <Button onClick={() => setEditing('new')}><Plus className="size-4" /> Log revision</Button>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-line" aria-hidden>
          <div className={cn('h-full rounded-full', over > 0 ? 'bg-red-600' : 'bg-gold-500')} style={{ width: `${pct}%` }} />
        </div>
        {over > 0 && (
          <p role="status" className="mt-3 text-sm text-red-700">
            {over} over the included limit. Extra revisions may be chargeable.
          </p>
        )}
      </section>

      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

      {rows.length === 0 ? (
        <p className="text-sm text-muted">No revisions logged yet. Log each request here so it does not get lost in WhatsApp.</p>
      ) : (
        <ul className="space-y-3">
          {rows.map((r) => (
            <li key={r.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-medium">
                    <span className="text-muted">R{r.request_no}</span> · {r.title}
                    {r.request_no > limit && <span className="ml-2 text-xs font-normal text-red-700">Extra</span>}
                  </p>
                  <p className="mt-0.5 text-sm text-muted">
                    Requested {formatDate(r.requested_on)}
                    {r.completed_on && ` · Completed ${formatDate(r.completed_on)}`}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge tone={TONE[r.status]}>{REVISION_LABEL[r.status]}</StatusBadge>
                  <select
                    aria-label={`Status of revision ${r.request_no}`}
                    value={r.status}
                    onChange={(e) => setStatus(r, e.target.value as RevisionStatus)}
                    className="rounded-lg border border-line bg-white px-2 py-1 text-sm"
                  >
                    {Object.entries(REVISION_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
                  </select>
                  <button aria-label={`Edit revision ${r.request_no}`} onClick={() => setEditing(r)} className="rounded-lg p-1.5 text-muted hover:bg-gold-100">
                    <Pencil className="size-4" />
                  </button>
                </div>
              </div>
              {r.description && <p className="mt-3 whitespace-pre-wrap text-sm">{r.description}</p>}
              {r.notes && <p className="mt-2 whitespace-pre-wrap text-sm text-muted">Notes: {r.notes}</p>}
            </li>
          ))}
        </ul>
      )}

      <Modal open={editing !== null} onClose={() => setEditing(null)} title={editing === 'new' ? 'Log revision' : 'Edit revision'}>
        {editing !== null && (
          <RevisionForm
            order={order}
            revision={editing === 'new' ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              load()
            }}
          />
        )}
      </Modal>
    </div>
  )
}