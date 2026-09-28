import { ParallaxLayer } from './ParallaxLayer'

const fill = (v: string) => ({ fill: `var(${v})` })

// Code-drawn placeholders. Swap for illustrated assets from Canva or an AI
// generator later without touching the Hero.
export function FloatingShapes() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <ParallaxLayer speed={0.09} className="absolute -right-10 top-8 sm:right-10 sm:top-12">
        <div className="cel-float" style={{ animationDuration: '8s' }}>
          <svg viewBox="0 0 100 100" className="size-28 sm:size-44">
            <circle cx="50" cy="50" r="50" style={fill('--invite-secondary')} />
          </svg>
        </div>
      </ParallaxLayer>

      <ParallaxLayer speed={-0.07} className="absolute bottom-40 left-3 sm:bottom-32 sm:left-10">
        <div className="cel-float" style={{ animationDuration: '6s', animationDelay: '-2s' }}>
          <svg viewBox="0 0 100 100" className="size-12 sm:size-16">
            <path d="M50 0 C55 35 65 45 100 50 C65 55 55 65 50 100 C45 65 35 55 0 50 C35 45 45 35 50 0Z" style={fill('--invite-accent')} />
          </svg>
        </div>
      </ParallaxLayer>

      <ParallaxLayer speed={0.05} className="absolute left-4 top-6 sm:left-1/3 sm:top-10">
        <div className="cel-float" style={{ animationDuration: '9s', animationDelay: '-4s' }}>
          <svg viewBox="0 0 120 40" className="w-20 sm:w-28">
            <path d="M6 20 Q21 0 36 20 T66 20 T96 20" fill="none" strokeWidth="7" strokeLinecap="round" style={{ stroke: 'var(--invite-accent)' }} />
          </svg>
        </div>
      </ParallaxLayer>
    </div>
  )
}