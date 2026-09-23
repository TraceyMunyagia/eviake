import { NavLink } from 'react-router-dom'
import { X } from 'lucide-react'
import { NAV } from '@/config/nav'
import { useBusiness } from '@/context/BusinessContext'
import { cn } from '@/lib/utils'

export function Sidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { active } = useBusiness()
  const groups = active ? NAV[active.slug] : []

  return (
    <>
      {open && <div className="fixed inset-0 z-30 bg-plum-950/50 lg:hidden" onClick={onClose} />}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 overflow-y-auto border-r border-line bg-white px-3 py-4 transition-transform',
          'lg:static lg:z-auto lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <button
          type="button"
          aria-label="Close navigation"
          onClick={onClose}
          className="mb-2 ml-auto block rounded-lg p-2 hover:bg-gold-100 lg:hidden"
        >
          <X className="size-5" />
        </button>

        <nav className="space-y-5">
          {groups.map((group, i) => (
            <div key={i}>
              {group.title && <p className="px-3 pb-1.5 text-xs font-medium text-muted">{group.title}</p>}
              <ul className="space-y-0.5">
                {group.items.map(({ label, path, icon: Icon }) => (
                  <li key={path}>
                    <NavLink
                      to={path}
                      end={path === '/'}
                      onClick={onClose}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-ink hover:bg-gold-100',
                          isActive && 'bg-gold-200 font-medium text-plum-900',
                        )
                      }
                    >
                      <Icon className="size-4 shrink-0" />
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  )
}