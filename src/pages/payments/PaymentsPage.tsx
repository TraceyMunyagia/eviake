import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { METHOD_LABELS, formatDate, formatKES, formatOrderNo } from '@/lib/format'
import { useBusiness } from '@/context/BusinessContext'
import { PageHeader } from '@/components/ui/PageHeader'
import type { Payment } from '@/types/database'

export function PaymentsPage() {
  const { active } = useBusiness()
  const [rows, setRows] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return
    setLoading(true)
    supabase
      .from('payments')
      .select('*, orders(id, order_no, clients(name))')
      .eq('business_id', active.id)
      .order('paid_at', { ascending: false })
      .limit(200)
      .then(({ data, error: err }) => {
        setError(err ? err.message : null)
        setRows((data ?? []) as Payment[])
        setLoading(false)
      })
  }, [active])

  if (!active) return null

  const now = new Date()
  const thisMonth = rows
    .filter((p) => {
      const d = new Date(p.paid_at)
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    })
    .reduce((sum, p) => sum + Number(p.amount_kes), 0)

  return (
    <div>
      <PageHeader title="Payments" subtitle={`Money received in ${active.name}. Record payments from each order.`} />

      <div className="mb-6 max-w-xs rounded-2xl border border-line bg-white p-5 shadow-sm">
        <p className="text-sm text-muted">Received this month</p>
        <p className="mt-2 font-display text-3xl text-plum-900">{formatKES(thisMonth)}</p>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-red-700">Could not load payments: {error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              {['Date', 'Client', 'Order', 'Method', 'Reference', 'Amount'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((p) => (
              <tr key={p.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{formatDate(p.paid_at)}</td>
                <td className="px-4 py-3">{p.orders?.clients?.name ?? '–'}</td>
                <td className="px-4 py-3">
                  {p.orders ? (
                    <Link to={`/orders/${p.orders.id}`} className="font-medium text-plum-900 hover:underline">
                      {formatOrderNo(p.orders.order_no)}
                    </Link>
                  ) : '–'}
                </td>
                <td className="px-4 py-3">{p.method ? METHOD_LABELS[p.method] : '–'}</td>
                <td className="px-4 py-3">{p.reference ?? '–'}</td>
                <td className="px-4 py-3">{formatKES(p.amount_kes)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!loading && rows.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">No payments yet. Open an order and choose Record payment.</p>
        )}
        {loading && rows.length === 0 && <p className="p-8 text-center text-sm text-muted">Loading…</p>}
      </div>
    </div>
  )
}