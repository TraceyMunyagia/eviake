import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import { Modal } from '@/components/ui/Modal'

type Result = { id: string; label: string; sub: string; to: string }

export function CommandPalette() {
  const { active } = useBusiness()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<Result[]>([])
  const [index, setIndex] = useState(0)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setOpen((v) => !v)
      }
      if (e.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    if (!open) { setQuery(''); setResults([]); setIndex(0) }
  }, [open])

  useEffect(() => {
    if (!active || query.trim().length < 2) return setResults([])
    const q = query.trim()
    const timer = setTimeout(async () => {
      const [clients, orders] = await Promise.all([
        supabase.from('clients').select('id, name').eq('business_id', active.id).ilike('name', `%${q}%`).limit(5),
        supabase.from('orders').select('id, order_no, clients(name)').eq('business_id', active.id).limit(5),
      ])
      const rows: Result[] = [
        ...(clients.data ?? []).map((c) => ({ id: `c-${c.id}`, label: c.name, sub: 'Client', to: `/clients/${c.id}` })),
        ...(orders.data ?? [])
          .filter((o: any) => o.clients?.name?.toLowerCase().includes(q.toLowerCase()) || String(o.order_no).includes(q))
          .map((o: any) => ({ id: `o-${o.id}`, label: `Order #${String(o.order_no).padStart(4, '0')}`, sub: o.clients?.name ?? '', to: `/orders/${o.id}` })),
      ]
      setResults(rows)
      setIndex(0)
    }, 200)
    return () => clearTimeout(timer)
  }, [query, active])

  function go(to: string) {
    setOpen(false)
    navigate(to)
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIndex((i) => Math.min(i + 1, results.length - 1)) }
    if (e.key === 'ArrowUp') { e.preventDefault(); setIndex((i) => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && results[index]) go(results[index].to)
  }

  return (
    <Modal open={open} onClose={() => setOpen(false)} title="Search">
      <input
        autoFocus
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={onKeyDown}
        placeholder="Search clients or orders…"
        aria-label="Command search"
        className="w-full rounded-lg border border-line px-3 py-2 text-sm"
      />
      {results.length > 0 && (
        <ul className="mt-3 max-h-72 overflow-y-auto">
          {results.map((r, i) => (
            <li key={r.id}>
              <button
                onClick={() => go(r.to)}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm ${i === index ? 'bg-gold-100' : 'hover:bg-gold-100'}`}
              >
                <span className="font-medium">{r.label}</span>
                <span className="text-muted">{r.sub}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="mt-3 text-xs text-muted">↑↓ to move · Enter to open · Esc to close · ⌘K to reopen</p>
    </Modal>
  )
}