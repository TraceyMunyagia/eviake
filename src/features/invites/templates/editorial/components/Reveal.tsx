import type { ReactNode } from 'react'
import { useScrollReveal } from '@/hooks/useScrollReveal'

export function Reveal({ children, mode }: { children: ReactNode; mode?: 'preview' | 'public' }) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>()
  // In the builder's preview pane the section is often already in view when
  // it mounts, which would otherwise leave it permanently invisible — treat
  // preview mode as always-visible and reserve the real reveal for the
  // public page where a guest is actually scrolling.
  const show = mode === 'preview' || visible
  return (
    <div ref={ref} className={`transition-all duration-700 ease-out ${show ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}>
      {children}
    </div>
  )
}