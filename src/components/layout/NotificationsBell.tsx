import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDateTime } from '@/lib/format'
import { useBusiness } from '@/context/BusinessContext'
import { cn } from '@/lib/utils'
import type { AppNotification } from '@/types/database'

export function NotificationsBell() {
  const { active } = useBusiness()
  const navigate = useNavigate()
  const [items, setItems] = useState<AppNotification[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const load = useCallback(async () => {
    if (!active) return
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('business_id', active.id)
      .order('created_at', { ascending: false })
      .limit(15)
    setItems((data ?? []) as AppNotification[])
  }, [active])

  useEffect(() => {
    load()
    const timer = setInterval(load, 60_000)
    return () => clearInterval(timer)
  }, [load])

  useEffect(() => {
    if (!open) return
    load()
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
  }, [open, load])

  const unread = items.filter((i) => !i.read_at).length

  async function openItem(n: AppNotification) {
    setOpen(false)
    if (!n.read_at) {
      await supabase.from('notifications').update({ read_at: new Date().toISOString() }).eq('id', n.id)
      load()
    }
    if (n.link) navigate(n.link)
  }

  async function markAllRead() {
    if (!active) return
    await supabase
      .from('notifications')
      .update({ read_at: new Date().toISOString() })
      .eq('business_id', active.id)
      .is('read_at', null)
    load()
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label={unread ? `Notifications, ${unread} unread` : 'Notifications'}
        onClick={() => setOpen((o) => !o)}
        className="relative rounded-lg p-2 hover:bg-white/10"
      >
        <Bell className="size-5" />
        {unread > 0 && (
          <span className="absolute right-1 top-1 flex size-4 items-center justify-center rounded-full bg-gold-500 text-[10px] font-semibold text-plum-950">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-30 mt-2 w-80 rounded-xl border border-line bg-white text-ink shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-4 py-2.5">
            <p className="text-sm font-medium">Notifications</p>
            {unread > 0 && (
              <button onClick={markAllRead} className="text-xs text-plum-800 underline">Mark all read</button>
            )}
          </div>
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted">Nothing yet. New orders and payments show up here.</p>
          ) : (
            <ul className="max-h-96 overflow-y-auto">
              {items.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => openItem(n)}
                    className={cn('w-full border-b border-line px-4 py-3 text-left last:border-0 hover:bg-gold-100', !n.read_at && 'bg-gold-100/60')}
                  >
                    <p className={cn('text-sm', !n.read_at && 'font-medium')}>{n.title}</p>
                    {n.body && <p className="text-sm text-muted">{n.body}</p>}
                    <p className="mt-0.5 text-xs text-muted">{formatDateTime(n.created_at)}</p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}