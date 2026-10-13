import { useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

// initials: "T|S"; line and hint are the cover text set in the builder
export function EntryGate({ initials, line, hint, onOpen }: { initials: string; line: string; hint: string; onOpen: () => void }) {
  const reduced = usePrefersReducedMotion()
  const [closing, setClosing] = useState(false)

  function handleTap() {
    if (closing) return
    if (reduced) {
      onOpen()
      return
    }
    setClosing(true)
    setTimeout(onOpen, 700) // matches the CSS transition duration below
  }

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label={`${line}. ${hint}`}
      className="relative flex min-h-screen w-full touch-manipulation items-center justify-center overflow-hidden transition-all duration-700 ease-in"
      style={{
        backgroundColor: 'var(--invite-background)',
        opacity: closing ? 0 : 1,
        transform: closing ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: closing ? 'none' : 'auto',
      }}
    >
      {/* Envelope flap seams converge behind the seal, echoing the reference stationery. */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 z-[1] h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 35 L50 58 L100 35" fill="none" stroke="var(--invite-accent)" strokeWidth="0.42" vectorEffect="non-scaling-stroke" />
        <path d="M0 39 L50 62 L100 39" fill="none" stroke="var(--invite-accent)" strokeWidth="0.42" vectorEffect="non-scaling-stroke" opacity="0.72" />
      </svg>

      <div className="absolute left-1/2 top-[60%] z-10 -translate-x-1/2 -translate-y-1/2">
        <div className={`tap-seal ${closing ? 'tap-seal--opening' : ''}`} aria-hidden>
          <div
            className="tap-seal__inner"
            style={{ backgroundColor: 'var(--invite-accent)', borderColor: 'var(--invite-accent)', color: 'var(--invite-primary)' }}
          >
            <span style={{ fontFamily: 'var(--invite-heading-font)', fontStyle: 'italic' }}>{initials.split('|').map((x) => x.trim()).filter(Boolean).join(' | ')}</span>
          </div>
        </div>
      </div>

      <div className="absolute inset-x-0 top-[22%] z-10 px-6 text-center" style={{ color: 'var(--invite-primary)' }}>
        <p className="text-3xl sm:text-4xl" style={{ fontFamily: 'var(--invite-accent-font)' }}>{line}</p>
      </div>
      <p className="absolute inset-x-0 bottom-[12%] z-10 text-center text-xs uppercase tracking-[0.3em]" style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
        {hint}
      </p>
    </button>
  )
}
