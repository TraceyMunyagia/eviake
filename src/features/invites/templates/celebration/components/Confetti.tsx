import { useMemo, type CSSProperties } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

const COLORS = ['var(--invite-accent)', 'var(--invite-secondary)', 'var(--invite-primary)']

// Pure CSS confetti, with no canvas and no library. Bump `burst` to fire a
// new burst. It renders nothing at all under prefers-reduced-motion.
export function Confetti({ burst }: { burst: number }) {
  const reduced = usePrefersReducedMotion()

  const pieces = useMemo(() => {
    if (burst === 0) return []
    return Array.from({ length: 56 }, (_, i) => {
      const angle = ((Math.random() * 140 - 70) * Math.PI) / 180 // fans upward
      const power = 140 + Math.random() * 260
      return {
        id: i,
        color: COLORS[i % COLORS.length],
        cx: Math.sin(angle) * power,
        up: -Math.cos(angle) * power,
        down: 220 + Math.random() * 260,
        cr: (Math.random() - 0.5) * 900,
        round: i % 3 === 0,
        delay: Math.random() * 120,
      }
    })
  }, [burst])

  if (reduced || pieces.length === 0) return null

  return (
    <div key={burst} aria-hidden className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="cel-confetti-piece"
          style={
            {
              backgroundColor: p.color,
              borderRadius: p.round ? '9999px' : '2px',
              animationDelay: `${p.delay}ms`,
              '--cx': `${p.cx}px`,
              '--up': `${p.up}px`,
              '--down': `${p.down}px`,
              '--cr': `${p.cr}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}