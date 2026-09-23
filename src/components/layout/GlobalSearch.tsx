import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatOrderNo } from '@/lib/format'
import { useBusiness } from '@/context/BusinessContext'

type ClientHit = { id: string; name: string; business_name: string | null }
type OrderHit = { id: string; order_no: number; package: string | null; clients: { name: string } | null }

export function GlobalSearch() {
  const { active } = useBusiness()
  const navigate = useNavigate()
  const [term, setTerm] = useState('')
  const [open, setOpen] = useState(false)
  const [clients, setClients] = useState<ClientHit[]>([])
  const [orders, setOrders] = useState<OrderHit[]>([])
  const [searched, setSearched] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const clean = term.trim().replace(/[%,()]/g, '')
    if (!active || clean.length < 2) {
      setClients([])
      setOrders([])
      setSearched(false)
      return
    }
    const timer = setTimeout(async () => {
      const orderNo = Number(clean.replace('#', ''))
      const [c, o] = await Promise.all([
        supabase
          .from('clients')
          .select('id, name, business_name')
          .eq('business_id', active.id)
          .or(`name.ilike.%${clean}%,business_name.ilike.%${clean}%,email.ilike.%${clean}%,phone.ilike.%${clean}%`)
          .limit(5),
        Number.isInteger(orderNo) && orderNo > 0
          ? supabase
              .from('orders')
              .select('id, order_no, package, clients(name)')
              .eq('business_id', active.id)
              .eq('order_no', orderNo)
              .limit(5)
          : Promise.resolve({ data: [] }),
      ])
      setClients((c.data ?? []) as ClientHit[])
      setOrders((o.data ?? []) as unknown as OrderHit[])
      setSearched(true)
      setOpen(true)
    }, 250)
    return () => clearTimeout(timer)
  }, [term, active])

  useEffect(() => {
    if (!open) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  function go(path: string) {
    setOpen(false)
    setTerm('')
    navigate(path)
  }

  return (
    <div ref={ref} className="relative hidden md:block">
      <label className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-plum-200">
        <Search className="size-4" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          onFocus={() => searched && setOpen(true)}
          placeholder="Search clients and orders"
          aria-label="Search clients and orders"
          className="w-56 bg-transparent text-white placeholder:text-plum-200/70 focus:outline-none"
        />
      </label>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-line bg-white p-1.5 text-ink shadow-lg">
          {clients.length === 0 && orders.length === 0 && (
            <p className="p-4 text-center text-sm text-muted">No matches in {active?.name}.</p>
          )}
          {clients.length > 0 && <p className="px-2.5 pb-1 pt-1.5 text-xs text-muted">Clients</p>}
          {clients.map((c) => (
            <button
              key={c.id}
              onClick={() => go(`/clients?q=${encodeURIComponent(c.name)}`)}
              className="block w-full rounded-lg px-2.5 py-2 text-left text-sm hover:bg-gold-100"
            >
              {c.name}
              {c.business_name && <span className="text-muted"> · {c.business_name}</span>}
            </button>
          ))}
          {orders.length > 0 && <p className="px-2.5 pb-1 pt-1.5 text-xs text-muted">Orders</p>}
          {orders.map((o) => (
            <button
              key={o.id}
              onClick={() => go(`/orders/${o.id}`)}
              className="block w-full rounded-lg px-2.5 py-2 text-left text-sm hover:bg-gold-100"
            >
              {formatOrderNo(o.order_no)}
              <span className="text-muted"> · {o.clients?.name ?? 'Client'}{o.package ? ` · ${o.package}` : ''}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}