import type { CSSProperties, ReactNode } from 'react'
import { useParallax } from '@/hooks/useParallax'

export function ParallaxLayer({ speed = 0.1, rotate = 0, className = '', style, children }: {
  speed?: number
  rotate?: number
  className?: string
  style?: CSSProperties
  children: ReactNode
}) {
  const ref = useParallax<HTMLDivElement>(speed)
  return (
    <div
      ref={ref}
      className={className}
      style={{ ...style, transform: `translate3d(0, var(--cel-py, 0px), 0) rotate(${rotate}deg)` }}
    >
      {children}
    </div>
  )
}