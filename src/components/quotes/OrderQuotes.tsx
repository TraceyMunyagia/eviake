import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatKES } from '@/lib/format'
import { QUOTE_LABEL, QUOTE_TONE, formatQuoteNo } from '@/lib/quote'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Order, Quote } from '@/types/database'

export function OrderQuotes({ order }: { order: Order }) {
  const { active } = useBusiness()
  const [rows, setRows] = useState<Quote[]>([])

  useEffect(() => {
    supabase
      .from('quotes')
      .select('id, quote_no, status, total_kes, monthly_kes, created_at')
      .eq('order_id', order.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => setRows((data ?? []) as Quote[]))
  }, [order.id, order.status])

  if (active?.slug !== 'evia_web') return null

  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-plum-900">Quotes</h2>
        <Link to={`/quotations/new?order=${order.id}`}>
          <Button variant="secondary"><Plus className="size-4" /> New quote</Button>
        </Link>
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No quotes for this order yet.</p>
      ) : (
        <ul className="divide-y divide-line text-sm">
          {rows.map((q) => (
            <li key={q.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <Link to={`/quotations/${q.id}`} className="font-medium text-plum-900 hover:underline">
                {formatQuoteNo(q.quote_no)}
              </Link>
              <span className="text-muted">{formatDate(q.created_at)}</span>
              <span>
                {formatKES(q.total_kes)}
                {q.monthly_kes > 0 && <span className="text-muted"> + {formatKES(q.monthly_kes)}/mo</span>}
              </span>
              <StatusBadge tone={QUOTE_TONE[q.status]}>{QUOTE_LABEL[q.status]}</StatusBadge>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}