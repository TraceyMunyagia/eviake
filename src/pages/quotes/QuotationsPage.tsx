import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatKES } from '@/lib/format'
import { QUOTE_LABEL, QUOTE_TONE, formatQuoteNo } from '@/lib/quote'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Quote } from '@/types/database'

export function QuotationsPage() {
  const { active } = useBusiness()
  const [rows, setRows] = useState<Quote[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState('')
  const [text, setText] = useState('')

  useEffect(() => {
    if (!active || active.slug !== 'evia_web') return
    setLoading(true)
    supabase
      .from('quotes')
      .select('*, clients(name, business_name, email, phone), orders(order_no)')
      .eq('business_id', active.id)
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data, error: err }) => {
        setError(err ? err.message : null)
        setRows((data ?? []) as Quote[])
        setLoading(false)
      })
  }, [active])

  const visible = useMemo(() => {
    const term = text.trim().toLowerCase().replace(/^q-?/, '')
    return rows.filter((q) => {
      if (statusFilter && q.status !== statusFilter) return false
      if (!term) return true
      return [q.clients?.name, q.clients?.business_name, String(q.quote_no)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    })
  }, [rows, statusFilter, text])

  if (!active) return null
  if (active.slug !== 'evia_web') {
    return (
      <div>
        <PageHeader title="Quotations" />
        <p className="text-sm text-muted">Quotations are part of Evia Web. Switch business to use them.</p>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)

  return (
    <div>
      <PageHeader
        title="Quotations"
        subtitle="Build, send and track quotes for website orders."
        action={
          <Link to="/quotations/new">
            <Button><Plus className="size-4" /> New quote</Button>
          </Link>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex min-w-64 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm">
          <Search className="size-4 text-muted" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search client or quote number"
            aria-label="Search quotes"
            className="w-full bg-transparent focus:outline-none"
          />
        </label>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-line bg-white px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {Object.entries(QUOTE_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-red-700">Could not load quotes: {error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              {['Quote', 'Client', 'Order', 'Setup', 'Monthly', 'Status', 'Valid until'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((q) => {
              const expired = q.status === 'sent' && !!q.valid_until && q.valid_until < today
              return (
                <tr key={q.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link to={`/quotations/${q.id}`} className="font-medium text-plum-900 hover:underline">
                      {formatQuoteNo(q.quote_no)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{q.clients?.name ?? '–'}</div>
                    <div className="text-muted">{q.clients?.business_name ?? ''}</div>
                  </td>
                  <td className="px-4 py-3">{q.orders ? `#${String(q.orders.order_no).padStart(4, '0')}` : '–'}</td>
                  <td className="px-4 py-3">{formatKES(q.total_kes)}</td>
                  <td className="px-4 py-3">{q.monthly_kes > 0 ? `${formatKES(q.monthly_kes)}/mo` : '–'}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={QUOTE_TONE[q.status]}>{QUOTE_LABEL[q.status]}</StatusBadge>
                  </td>
                  <td className={expired ? 'px-4 py-3 font-medium text-red-700' : 'px-4 py-3'}>
                    {formatDate(q.valid_until)}{expired && ' (expired)'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && visible.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">
            {rows.length === 0 ? 'No quotes yet. Create one with New quote.' : 'No quotes match these filters.'}
          </p>
        )}
        {loading && visible.length === 0 && <p className="p-8 text-center text-sm text-muted">Loading…</p>}
      </div>
    </div>
  )
}