import { useLocation } from 'react-router-dom'
import { NAV } from '@/config/nav'
import { useBusiness } from '@/context/BusinessContext'

export function Placeholder() {
  const { pathname } = useLocation()
  const { active } = useBusiness()
  const item = active ? NAV[active.slug].flatMap((g) => g.items).find((i) => i.path === pathname) : undefined

  return (
    <div>
      <h1 className="font-display text-3xl text-plum-900">{item?.label ?? 'Not available'}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        {item
          ? 'This section is not built yet. It will appear here in a later week of the plan.'
          : `This page isn't part of ${active?.name ?? 'this business'}. Use the sidebar to pick a section.`}
      </p>
    </div>
  )
}