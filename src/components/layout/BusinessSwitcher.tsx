import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { useBusiness } from '@/context/BusinessContext'
import { cn } from '@/lib/utils'

export function BusinessSwitcher() {
  const { businesses, active, setActive } = useBusiness()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

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

  if (!active) return null

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/10"
      >
        {active.name}
        <ChevronDown className={cn('size-4 text-gold-400 transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full z-30 mt-2 w-56 rounded-xl border border-line bg-white p-1.5 shadow-lg"
        >
          <p className="px-2.5 pb-1 pt-1.5 text-xs text-muted">Switch business</p>
          {businesses.map((b) => (
            <button
              key={b.id}
              role="option"
              aria-selected={b.id === active.id}
              onClick={() => {
                setActive(b.slug)
                setOpen(false)
              }}
              className={cn(
                'flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-sm text-ink hover:bg-gold-100',
                b.id === active.id && 'bg-gold-100 font-medium',
              )}
            >
              {b.name}
              {b.id === active.id && <Check className="size-4 text-gold-500" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}