import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
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
import { PackageSearch } from 'lucide-react'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { DataCard } from '@/components/ui/DataCard'
import { TableSkeleton } from '@/components/ui/Skeleton.'

export function OrdersPage() {
  const { active } = useBusiness()
  const navigate = useNavigate()
  const statuses = useOrderStatuses()
  const [rows, setRows] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
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
    const { data, error } = await q
    if (error) {
      setLoadError(error.message)
      setLoading(false)
      return
    }
    setLoadError(null)
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

      {loadError ? (
        <ErrorState message={`Could not load orders: ${loadError}`} onRetry={load} />
      ) : loading ? (
        <TableSkeleton />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white shadow-sm">
          <EmptyState
            icon={PackageSearch}
            title={rows.length === 0 ? 'No orders yet' : 'No orders match your filters'}
            body={rows.length === 0 ? 'New orders will show up here as soon as they come in.' : 'Try clearing a filter or your search.'}
            actionLabel={rows.length === 0 ? 'New order' : undefined}
            onAction={rows.length === 0 ? () => setCreating(true) : undefined}
          />
        </div>
      ) : (
        <>
        <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-sm sm:block">
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
        </div>
        <div className="space-y-3 sm:hidden">
          {visible.map((o) => (
            <DataCard
              key={o.id}
              onClick={() => navigate(`/orders/${o.id}`)}
              title={formatOrderNo(o.order_no)}
              subtitle={o.clients?.name}
              rows={[
                { label: 'Stage', value: <OrderStatusBadge status={o.status} statuses={statuses} /> },
                { label: 'Payment', value: <PaymentBadge value={o.payment_status} /> },
                { label: 'Total', value: formatKES(o.total_kes) },
                { label: 'Deadline', value: formatDate(o.deadline) },
              ]}
            />
          ))}
        </div>
        </>
      )}

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
    </div>
  )
}
