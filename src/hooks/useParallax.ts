import { useEffect, useRef } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

// Writes a CSS variable (--cel-py) instead of React state, so scrolling never
// triggers a re-render. Negative speeds drift the opposite way.
export function useParallax<T extends HTMLElement>(speed = 0.1) {
  const ref = useRef<T>(null)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el || reduced) return
    let frame = 0

    function update() {
      frame = 0
      const rect = el!.getBoundingClientRect()
      const offset = rect.top + rect.height / 2 - window.innerHeight / 2
      el!.style.setProperty('--cel-py', `${(-offset * speed).toFixed(1)}px`)
    }
    function onScroll() {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [speed, reduced])

  return ref
}