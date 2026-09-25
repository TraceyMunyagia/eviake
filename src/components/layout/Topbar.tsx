import { useEffect, useRef, useState } from 'react'
import { LogOut, Search } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { BusinessSwitcher } from '@/components/layout/BusinessSwitcher'
import { GlobalSearch } from '@/components/layout/GlobalSearch'
import { NotificationsBell } from '@/components/layout/NotificationsBell'
import { MobileNav } from '@/components/layout/MobileNav'
import { Modal } from '@/components/ui/Modal'

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const { user, signOut } = useAuth()
  const [menu, setMenu] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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
      <MobileNav onOpen={onMenu} />
      <span className="font-display text-xl tracking-wide text-gold-400">Evia</span>
      <BusinessSwitcher />

      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <div className="hidden sm:block"><GlobalSearch /></div>
        <button
          type="button"
          aria-label="Search"
          className="rounded-lg p-2 text-white sm:hidden"
          onClick={() => setSearchOpen(true)}
        >
          <Search className="size-5" />
        </button>
        <NotificationsBell />

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
      <Modal open={searchOpen} onClose={() => setSearchOpen(false)} title="Search">
        <GlobalSearch inModal onNavigate={() => setSearchOpen(false)} />
      </Modal>
    </header>
  )
}
