import type { ReactNode } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export function Reveal({ children, mode, delay = 0 }: { children: ReactNode; mode?: 'preview' | 'public'; delay?: number }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()
  const show = mode === 'preview' || visible
  return (
    <div
      ref={ref}
  data-invite-reveal
  className={`transition-all ease-out ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
  style={{ transitionDuration: '700ms', transitionDelay: show ? `${delay}ms` : '0ms' }}
>{children}</div>
  )
}
