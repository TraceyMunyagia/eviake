import { useCallback, useEffect, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatKES, formatOrderNo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/context/BusinessContext'
import { useOrderStatuses } from '@/hooks/useOrderStatuses'
import { PaymentBadge } from '@/pages/orders/Badges'
import { OrderQuotes } from '@/components/quotes/OrderQuotes'
import { ProjectStepper } from '@/components/workspace/ProjectStepper'
import { WebsiteTab } from '@/components/workspace/WebsiteTab'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { OrderForm } from '@/pages/orders/OrderForm'
import { PaymentsSection } from '@/pages/orders/PaymentSection'
import type { Order } from '@/types/database'
import { RequirementsTab } from '@/components/workspace/RequirementsTab'
import { RevisionsTab } from '@/components/workspace/RevisionsTab'
import { HostingTab } from '@/components/workspace/HostingTab'

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'quote', label: 'Quote', webOnly: true },
  { key: 'website', label: 'Website', webOnly: true },
  { key: 'payments', label: 'Payments' },
  { key: 'requirements', label: 'Requirements', webOnly: true },
  { key: 'revisions', label: 'Revisions', webOnly: true },
  { key: 'hosting', label: 'Hosting', webOnly: true },
]

export function OrderDetailPage() {
  const { id } = useParams()
  const [params, setParams] = useSearchParams()
  const { active } = useBusiness()
  const statuses = useOrderStatuses()
  const [order, setOrder] = useState<Order | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
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
    setSaving(true)
    setError(null)
    const { error: err } = await supabase.from('orders').update({ status }).eq('id', order.id)
    setSaving(false)
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

  const isWeb = active.slug === 'evia_web'
  const tabs = TABS.filter((t) => isWeb || !t.webOnly)
  const requested = params.get('tab') ?? 'overview'
  const tab = tabs.some((t) => t.key === requested) ? requested : 'overview'

  return (
    <div>
      <Link to="/orders" className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Orders
      </Link>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-display text-3xl text-plum-900">Order {formatOrderNo(order.order_no)}</h1>
            <PaymentBadge value={order.payment_status} />
          </div>
          <p className="mt-1 text-sm text-muted">
            <Link to={`/clients/${order.client_id}`} className="underline">{order.clients?.name}</Link>
            {order.clients?.business_name ? ` · ${order.clients.business_name}` : ''}
          </p>
        </div>
        <Button variant="secondary" onClick={() => setEditing(true)}>
          <Pencil className="size-4" /> Edit order
        </Button>
      </div>

      <ProjectStepper statuses={statuses} current={order.status} onChange={changeStatus} disabled={saving} />
      {error && <p role="alert" className="-mt-3 mb-4 text-sm text-red-700">{error}</p>}

      <div role="tablist" className="flex gap-1 overflow-x-auto border-b border-line">
        {tabs.map((t) => (
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
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm lg:col-span-2">
            <h2 className="mb-4 font-display text-lg text-plum-900">Details</h2>
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-muted">Package</dt><dd className="mt-1">{order.package ?? '–'}</dd></div>
              <div><dt className="text-muted">Total</dt><dd className="mt-1">{formatKES(order.total_kes)}</dd></div>
              <div><dt className="text-muted">Deadline</dt><dd className="mt-1">{formatDate(order.deadline)}</dd></div>
              <div><dt className="text-muted">Created</dt><dd className="mt-1">{formatDate(order.created_at)}</dd></div>
              <div className="sm:col-span-2">
                <dt className="text-muted">Notes</dt>
                <dd className="mt-1 whitespace-pre-wrap">{order.notes ?? '–'}</dd>
              </div>
            </dl>
          </section>
          <section className="rounded-2xl border border-line bg-white p-5 shadow-sm">
            <h2 className="mb-4 font-display text-lg text-plum-900">Client</h2>
            <p className="font-medium">{order.clients?.name}</p>
            <p className="text-sm text-muted">{order.clients?.business_name}</p>
            <p className="mt-3 text-sm">{order.clients?.email}</p>
            <p className="text-sm">{order.clients?.phone}</p>
          </section>
        </div>
      )}
      {tab === 'requirements' && <RequirementsTab order={order} />}
      {tab === 'quote' && <OrderQuotes order={order} />}
      {tab === 'website' && <WebsiteTab order={order} />}
      {tab === 'revisions' && <RevisionsTab order={order} />}
      {tab === 'hosting' && <HostingTab order={order} />}
      {tab === 'payments' && <PaymentsSection order={order} onChanged={load} />}

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
