import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plus, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatKES, formatOrderNo } from '@/lib/format'
import { useBusiness } from '@/context/BusinessContext'
import { useOrderStatuses } from '@/hooks/useOrderStatuses'
import { OrderStatusBadge, PaymentBadge } from '@/pages/orders/Badges'
import { PageHeader } from '@/components/ui/PageHeader'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import type { Order } from '@/types/database'
const selectClass = 'rounded-lg border border-line bg-white px-3 py-2 text-sm'
import { OrderForm } from '@/pages/orders/OrderForm'


export function OrdersPage() {
  const { active } = useBusiness()
  const statuses = useOrderStatuses()
  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [params] = useSearchParams()
  const [statusFilter, setStatusFilter] = useState(params.get('status') ?? '') 
  const [payFilter, setPayFilter] = useState('')
  const [text, setText] = useState('')
  const [creating, setCreating] = useState(false)

  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    let q = supabase
      .from('orders')
      .select('*, clients(name, business_name)')
      .eq('business_id', active.id)
      .order('created_at', { ascending: false })
      .limit(200)
    if (statusFilter) q = q.eq('status', statusFilter)
    if (payFilter) q = q.eq('payment_status', payFilter)
    const { data, error: err } = await q
    setError(err ? err.message : null)
    setRows((data ?? []) as Order[])
    setLoading(false)
  }, [active, statusFilter, payFilter])

  useEffect(() => {
    load()
  }, [load])

  const lastBusiness = useRef(active?.id)
useEffect(() => {
  if (lastBusiness.current === active?.id) return
  lastBusiness.current = active?.id
  setStatusFilter('')
  setPayFilter('')
}, [active])

  const visible = useMemo(() => {
    const term = text.trim().toLowerCase().replace('#', '')
    if (!term) return rows
    return rows.filter((o) =>
      [o.clients?.name, o.clients?.business_name, o.package, String(o.order_no)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term)),
    )
  }, [rows, text])

  const finalKey = statuses[statuses.length - 1]?.key
  const today = new Date().toISOString().slice(0, 10)

  if (!active) return null

  return (
    <div>
      <PageHeader title="Orders" subtitle={`Incoming and active orders in ${active.name}.`}
       action={
    <Button onClick={() => setCreating(true)}>
      <Plus className="size-4" /> New order
    </Button>
  } 
  />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <label className="flex min-w-64 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm">
          <Search className="size-4 text-muted" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search client, package or order number"
            aria-label="Search orders"
            className="w-full bg-transparent focus:outline-none"
          />
        </label>
        <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
          <option value="">All statuses</option>
          {statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
        <select aria-label="Filter by payment" value={payFilter} onChange={(e) => setPayFilter(e.target.value)} className={selectClass}>
          <option value="">All payments</option>
          <option value="unpaid">Unpaid</option>
          <option value="partial">Part paid</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-red-700">Could not load orders: {error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              {['Order', 'Client', 'Package', 'Status', 'Payment', 'Total', 'Deadline'].map((h) => (
                <th key={h} className="px-4 py-3 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {visible.map((o) => {
              const overdue = !!o.deadline && o.deadline < today && o.status !== finalKey
              return (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${o.id}`} className="font-medium text-plum-900 hover:underline">
                      {formatOrderNo(o.order_no)}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <div>{o.clients?.name ?? '–'}</div>
                    <div className="text-muted">{o.clients?.business_name ?? ''}</div>
                  </td>
                  <td className="px-4 py-3">{o.package ?? '–'}</td>
                  <td className="px-4 py-3"><OrderStatusBadge status={o.status} statuses={statuses} /></td>
                  <td className="px-4 py-3"><PaymentBadge value={o.payment_status} /></td>
                  <td className="px-4 py-3">{formatKES(o.total_kes)}</td>
                  <td className={overdue ? 'px-4 py-3 font-medium text-red-700' : 'px-4 py-3'}>
                    {formatDate(o.deadline)}{overdue && ' (overdue)'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
         
<Modal open={creating} onClose={() => setCreating(false)} title="New order">
  {creating && (
    <OrderForm
      business={active}
      order={null}
      statuses={statuses}
      onClose={() => setCreating(false)}
      onSaved={() => {
        setCreating(false)
        load()
      }}
    />
  )}
</Modal>
         
        {!loading && visible.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">
            {rows.length === 0 && !statusFilter && !payFilter
              ? 'No orders yet. Create the first one with New order.'
              : 'No orders match these filters.'}
          </p>
        )}
        {loading && visible.length === 0 && <p className="p-8 text-center text-sm text-muted">Loading…</p>}
      </div>
    </div>
  )
}