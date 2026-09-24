import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { formatDate, formatOrderNo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { useBusiness } from '@/context/BusinessContext'
import { StatusBadge, type Tone } from '@/components/ui/StatusBadge'
import type { DomainsHosting } from '@/types/database'

type Row = DomainsHosting & { orders: { order_no: number; clients: { name: string } | null } | null }

function daysUntil(date: string | null) {
  if (!date) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86_400_000)
}

function soonest(row: Row) {
  const d = [row.domain_expiry, row.hosting_renewal].filter(Boolean) as string[]
  if (d.length === 0) return null
  return d.map((x) => daysUntil(x)).sort((a, b) => (a ?? 9999) - (b ?? 9999))[0]
}

function urgencyTone(days: number | null): Tone {
  if (days === null) return 'neutral'
  if (days < 0) return 'overdue'
  if (days <= 30) return 'pending'
  return 'live'
}

export function HostingPage() {
  const { active } = useBusiness()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    const { data } = await supabase
      .from('domains_hosting')
      .select('*, orders(order_no, clients(name))')
      .eq('business_id', active.id)
    setRows((data ?? []) as unknown as Row[])
    setLoading(false)
  }, [active])

  useEffect(() => {
    load()
  }, [load])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    const list = q
      ? rows.filter((r) => [r.domain, r.orders?.clients?.name, r.hosting_provider].some((v) => v?.toLowerCase().includes(q)))
      : rows
    return [...list].sort((a, b) => (soonest(a) ?? 9999) - (soonest(b) ?? 9999))
  }, [rows, search])

  if (!active) return null

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-3xl text-plum-900">Domains & hosting</h1>
        <p className="mt-1 text-sm text-muted">Every client's domain, host and renewal date in one place.</p>
      </div>

      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search domain, client or host"
        aria-label="Search domains and hosting"
        className="mb-4 w-full max-w-sm rounded-lg border border-line px-3 py-2 text-sm"
      />

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>{['Domain', 'Client', 'Domain expiry', 'Host', 'Renewal', 'SSL'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
          </thead>
          <tbody>
            {filtered.map((r) => {
              const days = soonest(r)
              return (
                <tr key={r.order_id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <Link to={`/orders/${r.order_id}?tab=hosting`} className="font-medium text-plum-900 hover:underline">{r.domain || '–'}</Link>
                  </td>
                  <td className="px-4 py-3">
                    {r.orders?.clients?.name} <span className="text-muted">· {r.orders && formatOrderNo(r.orders.order_no)}</span>
                  </td>
                  <td className="px-4 py-3">{formatDate(r.domain_expiry)}</td>
                  <td className="px-4 py-3">{r.hosting_provider || '–'}</td>
                  <td className="px-4 py-3">
                    <span className={cn(days !== null && days < 0 && 'font-medium text-red-700')}>{formatDate(r.hosting_renewal)}</span>
                  </td>
                  <td className="px-4 py-3"><StatusBadge tone={urgencyTone(days)}>{r.ssl_status}</StatusBadge></td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {!loading && filtered.length === 0 && <p className="p-6 text-center text-sm text-muted">No hosting records yet. Add one from an order's Hosting tab.</p>}
      </div>
    </div>
  )
}