import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Topbar } from '@/components/layout/Topbar'
import { Sidebar } from '@/components/layout/Sidebar'

export function AppShell() {
  const [navOpen, setNavOpen] = useState(false)
  return (
    <div className="flex min-h-screen flex-col">
      <Topbar onMenu={() => setNavOpen(true)} />
      <div className="flex flex-1">
        <Sidebar open={navOpen} onClose={() => setNavOpen(false)} />
        <main className="min-w-0 flex-1 p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}