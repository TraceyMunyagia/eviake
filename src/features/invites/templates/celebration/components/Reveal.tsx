import type { ReactNode } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export function Reveal({ children, mode, delay = 0, className = '' }: {
  children: ReactNode
  mode?: 'preview' | 'public'
  delay?: number
  className?: string
}) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()
  const show = mode === 'preview' || visible
  return (
    <div
      ref={ref}
      className={`cel-reveal ${show ? 'is-visible' : ''} ${className}`}
      style={{ transitionDelay: show ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  )
}