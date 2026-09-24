import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatDate, formatDateTime, formatKES, formatOrderNo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/context/BusinessContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge, type Tone } from '@/components/ui/StatusBadge'
import type { AppNotification } from '@/types/database'

type Stage = { key: string; label: string; tone: string; count: number }
type Overview = { pipeline: Stage[]; pending_quotes: number; revenue_month: number; outstanding: number }
type Deadline = { id: string; order_no: number; status: string; deadline: string; clients: { name: string } | null }
type Card = { label: string; value: string; href?: string; note?: string }

const TONE_BORDER: Record<string, string> = {
  pending: 'border-t-yellow-400',
  progress: 'border-t-blue-400',
  review: 'border-t-purple-400',
  live: 'border-t-green-500',
  overdue: 'border-t-red-500',
  neutral: 'border-t-stone-300',
}

function daysUntil(date: string) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86_400_000)
}

function dueLabel(n: number) {
  if (n < 0) return `${-n} day${n === -1 ? '' : 's'} overdue`
  if (n === 0) return 'Due today'
  if (n === 1) return 'Tomorrow'
  return `In ${n} days`
}

async function loadOverviewFallback(businessId: string): Promise<Overview | null> {
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const [statuses, orders, quotes, payments] = await Promise.all([
    supabase.from('order_statuses').select('key, label, tone, sort_order').eq('business_id', businessId).order('sort_order'),
    supabase.from('orders').select('id, status, total_kes, payment_status').eq('business_id', businessId),
    supabase.from('quotes').select('id').eq('business_id', businessId).eq('status', 'sent'),
    supabase.from('payments').select('order_id, amount_kes, paid_at').eq('business_id', businessId),
  ])

  if (statuses.error || orders.error || quotes.error || payments.error) return null

  const orderRows = orders.data ?? []
  const paymentRows = payments.data ?? []
  const paidByOrder = paymentRows.reduce<Record<string, number>>((map, payment) => {
    map[payment.order_id] = (map[payment.order_id] ?? 0) + Number(payment.amount_kes)
    return map
  }, {})
  const pipeline = (statuses.data ?? []).map((status) => ({
    key: status.key,
    label: status.label,
    tone: status.tone,
    count: orderRows.filter((order) => order.status === status.key).length,
  }))

  return {
    pipeline,
    pending_quotes: quotes.data?.length ?? 0,
    revenue_month: paymentRows
      .filter((payment) => new Date(payment.paid_at).getTime() >= monthStart.getTime())
      .reduce((sum, payment) => sum + Number(payment.amount_kes), 0),
    outstanding: orderRows
      .filter((order) => order.payment_status !== 'paid')
      .reduce((sum, order) => sum + Math.max(Number(order.total_kes) - (paidByOrder[order.id] ?? 0), 0), 0),
  }
}

export function Dashboard() {
  const { active } = useBusiness()
  const [overview, setOverview] = useState<Overview | null>(null)
  const [inviteStats, setInviteStats] = useState<{ upcoming: number; rsvpsReceived: number } | null>(null)
  const [deadlines, setDeadlines] = useState<Deadline[]>([])
  const [activity, setActivity] = useState<AppNotification[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return
    let cancelled = false
    setOverview(null)
    setInviteStats(null)
    setDeadlines([])
    setActivity([])
    setError(null)

    ;(async () => {
      const { data, error: err } = await supabase.rpc('dashboard_overview', { p_business_id: active.id })
      if (cancelled) return
      const ov = (data as Overview | null) ?? (err ? await loadOverviewFallback(active.id) : null)
      if (!ov) return setError(err?.message ?? 'Could not load the dashboard.')
      setOverview(ov)

      if (active.slug === 'evia_invites') {
        const today = new Date().toISOString().slice(0, 10)
        const [ev, rs] = await Promise.all([
          supabase.from('events').select('id', { count: 'exact', head: true }).eq('business_id', active.id).gte('event_date', today),
          supabase.from('rsvps').select('guest_id', { count: 'exact', head: true }).eq('business_id', active.id).neq('status', 'pending'),
        ])
        if (!cancelled) setInviteStats({ upcoming: ev.count ?? 0, rsvpsReceived: rs.count ?? 0 })
      }

      const finalKey = ov.pipeline[ov.pipeline.length - 1]?.key ?? ''
      const [d, a] = await Promise.all([
        supabase
          .from('orders')
          .select('id, order_no, status, deadline, clients(name)')
          .eq('business_id', active.id)
          .not('deadline', 'is', null)
          .neq('status', finalKey)
          .order('deadline')
          .limit(6),
        supabase
          .from('notifications')
          .select('*')
          .eq('business_id', active.id)
          .order('created_at', { ascending: false })
          .limit(8),
      ])
      if (cancelled) return
      setDeadlines((d.data ?? []) as unknown as Deadline[])
      setActivity((a.data ?? []) as AppNotification[])
    })()

    return () => {
      cancelled = true
    }
  }, [active])

  if (!active) return null

  const count = (keys: string[]) =>
    overview ? overview.pipeline.filter((s) => keys.includes(s.key)).reduce((sum, s) => sum + s.count, 0) : null
  const show = (n: number | null) => (n === null ? '–' : String(n))
  const firstKey = overview?.pipeline[0]?.key

  const cards: Card[] =
    active.slug === 'evia_web'
      ? [
          { label: 'Active websites', value: show(count(['live'])), href: '/orders?status=live' },
          { label: 'New orders', value: show(count(['new'])), href: '/orders?status=new' },
          { label: 'Pending quotes', value: overview ? String(overview.pending_quotes) : '–', href: '/quotations' },
          { label: 'In development', value: show(count(['design', 'development', 'review', 'revisions', 'qa'])), href: '/orders' },
          { label: 'Monthly revenue', value: overview ? formatKES(overview.revenue_month) : '–', href: '/payments' },
          { label: 'Outstanding payments', value: overview ? formatKES(overview.outstanding) : '–', href: '/orders' },
        ]
      : [
          { label: 'Upcoming events', value: inviteStats ? String(inviteStats.upcoming) : '–', href: '/events' },
          { label: 'New orders', value: show(firstKey ? count([firstKey]) : null), href: firstKey ? `/orders?status=${firstKey}` : '/orders' },
          { label: 'Invitations published', value: show(count(['published', 'completed'])), href: '/orders' },
          { label: 'RSVPs received', value: inviteStats ? String(inviteStats.rsvpsReceived) : '–', href: '/events' },
          { label: 'Monthly revenue', value: overview ? formatKES(overview.revenue_month) : '–', href: '/payments' },
          { label: 'Outstanding payments', value: overview ? formatKES(overview.outstanding) : '–', href: '/orders' },
        ]

  const statusOf = (key: string) => overview?.pipeline.find((s) => s.key === key)

  return (
    <div>
      <PageHeader title={active.name} subtitle="What needs your attention today." />
      {error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((c) => {
          const body = (
            <>
              <p className="text-sm text-muted">{c.label}</p>
              <p className="mt-2 font-display text-3xl text-plum-900">{c.value}</p>
              {c.note && <p className="mt-1 text-xs text-muted">{c.note}</p>}
            </>
          )
          const cls = 'block rounded-2xl border border-line bg-white p-5 shadow-sm'
          return c.href ? (
            <Link key={c.label} to={c.href} className={cn(cls, 'hover:border-gold-500')}>{body}</Link>
          ) : (
            <div key={c.label} className={cls}>{body}</div>
          )
        })}
      </div>

      <section className="mt-10">
        <h2 className="mb-3 font-display text-xl text-plum-900">Project pipeline</h2>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
          {(overview?.pipeline ?? []).map((s, i) => (
            <Link
              key={s.key}
              to={`/orders?status=${s.key}`}
              className={cn('rounded-xl border border-t-4 border-line bg-white p-3 hover:bg-gold-100', TONE_BORDER[s.tone] ?? TONE_BORDER.neutral)}
            >
              <p className="font-display text-2xl text-plum-900">{s.count}</p>
              <p className="text-xs text-muted">{i + 1}. {s.label}</p>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="mb-3 font-display text-xl text-plum-900">Upcoming deadlines</h2>
          <div className="rounded-2xl border border-line bg-white shadow-sm">
            {deadlines.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted">No open orders have a deadline.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {deadlines.map((d) => {
                  const days = daysUntil(d.deadline)
                  const stage = statusOf(d.status)
                  return (
                    <li key={d.id}>
                      <Link to={`/orders/${d.id}`} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 hover:bg-gold-100">
                        <span>
                          <span className="font-medium">{d.clients?.name ?? 'Client'}</span>
                          <span className="text-muted"> · {formatOrderNo(d.order_no)}</span>
                        </span>
                        <span className="flex items-center gap-3">
                          {stage && <StatusBadge tone={(stage.tone as Tone) ?? 'neutral'}>{stage.label}</StatusBadge>}
                          <span className={cn('text-right', days < 0 ? 'font-medium text-red-700' : 'text-muted')}>
                            {formatDate(d.deadline)} · {dueLabel(days)}
                          </span>
                        </span>
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>

        <section>
          <h2 className="mb-3 font-display text-xl text-plum-900">Recent activity</h2>
          <div className="rounded-2xl border border-line bg-white shadow-sm">
            {activity.length === 0 ? (
              <p className="p-6 text-center text-sm text-muted">Orders, payments, quotes and revisions show up here.</p>
            ) : (
              <ul className="divide-y divide-line text-sm">
                {activity.map((n) => {
                  const inner = (
                    <>
                      <p className="font-medium">{n.title}</p>
                      {n.body && <p className="text-muted">{n.body}</p>}
                      <p className="mt-0.5 text-xs text-muted">{formatDateTime(n.created_at)}</p>
                    </>
                  )
                  return (
                    <li key={n.id}>
                      {n.link ? (
                        <Link to={n.link} className="block px-4 py-3 hover:bg-gold-100">{inner}</Link>
                      ) : (
                        <div className="px-4 py-3">{inner}</div>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
