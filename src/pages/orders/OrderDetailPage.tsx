import { useCallback, useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatKES, formatOrderNo } from '@/lib/format'
import { useBusiness } from '@/context/BusinessContext'
import { useOrderStatuses } from '@/hooks/useOrderStatuses'
import { PaymentBadge } from '@/pages/orders/Badges'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { inputClass } from '@/components/ui/Field'
import { OrderForm } from '@/pages/orders/OrderForm'
import type { Order } from '@/types/database'
import { PaymentsSection } from '@/pages/orders/PaymentSection'
import { OrderQuotes } from '@/components/quotes/OrderQuotes'

export function OrderDetailPage() {
  const { id } = useParams()
  const { active } = useBusiness()
  const statuses = useOrderStatuses()
  const [order, setOrder] = useState<Order | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!active || !id) return
    const { data } = await supabase
      .from('orders')
      .select('*, clients(name, business_name, email, phone)')
      .eq('id', id)
      .eq('business_id', active.id)
      .maybeSingle()
    setOrder((data as Order | null) ?? null)
    setState(data ? 'ready' : 'missing')
  }, [active, id])

  useEffect(() => {
    load()
  }, [load])

  async function changeStatus(status: string) {
    if (!order) return
    setError(null)
    const { error: err } = await supabase.from('orders').update({ status }).eq('id', order.id)
    if (err) return setError(err.message)
    load()
  }

  if (!active) return null
  if (state === 'loading') return <p className="text-sm text-muted">Loading…</p>
  if (state === 'missing' || !order) {
    return (
      <div>
        <p className="text-sm">This order was not found in {active.name}.</p>
        <Link to="/orders" className="mt-2 inline-block text-sm text-plum-900 underline">Back to orders</Link>
      </div>
    )
  }

  return (
    <div>
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-3xl text-plum-900">Order {formatOrderNo(order.order_no)}</h1>
          <PaymentBadge value={order.payment_status} />
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          <Pencil className="size-4" /> Edit order
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 font-display text-lg text-plum-900">Details</h2>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Status</dt>
              <dd>
                <select
                  aria-label="Order status"
                  value={order.status}
                  onChange={(e) => changeStatus(e.target.value)}
                  className={inputClass}
                >
                  {statuses.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
                </select>
              </dd>
            </div>
            <div><dt className="text-muted">Package</dt><dd className="mt-1">{order.package ?? '–'}</dd></div>
            <div><dt className="text-muted">Total</dt><dd className="mt-1">{formatKES(order.total_kes)}</dd></div>
            <div><dt className="text-muted">Deadline</dt><dd className="mt-1">{formatDate(order.deadline)}</dd></div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Notes</dt>
              <dd className="mt-1 whitespace-pre-wrap">{order.notes ?? '–'}</dd>
            </div>
          </dl>
          {order.invitation_details && (
            <div className="mt-6 border-t border-line pt-5">
              <h3 className="mb-3 font-display text-lg text-plum-900">Invitation brief</h3>
              <dl className="grid gap-3 text-sm sm:grid-cols-2">
                <div><dt className="text-muted">Event</dt><dd className="mt-1">{order.invitation_details.eventName}</dd></div>
                <div><dt className="text-muted">Template</dt><dd className="mt-1">{order.invitation_details.template}</dd></div>
                <div><dt className="text-muted">Host / celebrant</dt><dd className="mt-1">{order.invitation_details.hostName}</dd></div>
                <div><dt className="text-muted">Event type</dt><dd className="mt-1">{order.invitation_details.eventType}</dd></div>
                <div><dt className="text-muted">Event date</dt><dd className="mt-1">{order.invitation_details.eventDate} {order.invitation_details.eventTime}</dd></div>
                <div><dt className="text-muted">Venue</dt><dd className="mt-1">{order.invitation_details.venue}{order.invitation_details.address ? `, ${order.invitation_details.address}` : ''}</dd></div>
                <div className="sm:col-span-2"><dt className="text-muted">RSVP</dt><dd className="mt-1">{order.invitation_details.rsvp?.enabled ? `Enabled${order.invitation_details.rsvp.deadline ? ` · deadline ${order.invitation_details.rsvp.deadline}` : ''}` : 'Disabled'}</dd></div>
              </dl>
            </div>
          )}
          {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}
        </section>

        <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-display text-lg text-plum-900">Client</h2>
          <p className="font-medium">{order.clients?.name}</p>
          <p className="text-sm text-muted">{order.clients?.business_name}</p>
          <p className="mt-3 text-sm">{order.clients?.email}</p>
          <p className="text-sm">{order.clients?.phone}</p>
        </section>
      </div>

<OrderQuotes order={order} />
<PaymentsSection order={order} onChanged={load} />

      <Modal open={editing} onClose={() => setEditing(false)} title="Edit order">
        {editing && (
          <OrderForm
            business={active}
            order={order}
            statuses={statuses}
            onClose={() => setEditing(false)}
            onSaved={() => {
              setEditing(false)
              load()
            }}
          />
        )}
      </Modal>
    </div>
  )
}
