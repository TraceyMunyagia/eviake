import { useEffect, useRef, useState } from 'react'
import { Bell, LogOut, Menu, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { BusinessSwitcher } from '@/components/layout/BusinessSwitcher'
import { GlobalSearch } from '@/components/layout/GlobalSearch'
import { NotificationsBell } from '@/components/layout/NotificationsBell'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, signOut } = useAuth()
  const [menu, setMenu] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const initial = (user?.email ?? '?').charAt(0).toUpperCase()

  useEffect(() => {
    if (!menu) return
    const onClick = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setMenu(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [menu])

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 bg-plum-900 px-4 text-white lg:px-6">
      <button
        type="button"
        aria-label="Open navigation"
        onClick={onMenu}
        className="rounded-lg p-2 hover:bg-white/10 lg:hidden"
      >
        <Menu className="size-5" />
      </button>

      <span className="font-display text-xl tracking-wide text-gold-400">Evia</span>
      <BusinessSwitcher />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
       <GlobalSearch />
       <NotificationsBell />

        <button type="button" aria-label="Notifications" className="rounded-lg p-2 hover:bg-white/10">
          <Bell className="size-5" />
        </button>

        <div ref={ref} className="relative">
          <button
            type="button"
            aria-label="Account menu"
            onClick={() => setMenu((m) => !m)}
            className="flex size-9 items-center justify-center rounded-full bg-gold-500 text-sm font-semibold text-plum-950"
          >
            {initial}
          </button>
          {menu && (
            <div className="absolute right-0 top-full mt-2 w-60 rounded-xl border border-line bg-white p-1.5 text-ink shadow-lg">
              <p className="truncate px-2.5 py-2 text-sm text-muted">{user?.email}</p>
              <button
                onClick={signOut}
                className="flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-sm hover:bg-gold-100"
              >
                <LogOut className="size-4" /> Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}