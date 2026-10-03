import { useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'
import type { InviteContent } from '@/types/database'

export function EntryGate({ content, onOpen }: { content: InviteContent; onOpen: () => void }) {
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

  // Initials from the couple's names — "Maria & Sam" -> "M & S".
  // Falls back to the first letter of the event name if no couple names exist.
  const initials = (() => {
    if (content.couple_names) {
      const parts = content.couple_names.split(/&| and /i).map((p) => p.trim()[0]).filter(Boolean)
      if (parts.length >= 2) return `${parts[0]} ${parts[1]}`
    }
    return content.event_name?.[0] ?? ''
  })()

  return (
    <button
      type="button"
      onClick={handleTap}
      aria-label="Tap to open your invitation"
      className="relative flex min-h-screen w-full touch-manipulation items-center justify-center overflow-hidden transition-all duration-700 ease-in"
      style={{
        backgroundColor: 'var(--invite-background)',
        backgroundImage: [
          'radial-gradient(circle at 50% 45%, color-mix(in srgb, var(--invite-accent) 12%, transparent), transparent 48%)',
          content.hero_image_url
            ? `linear-gradient(color-mix(in srgb, var(--invite-background) 24%, transparent), color-mix(in srgb, var(--invite-background) 24%, transparent)), url(${content.hero_image_url})`
            : '',
        ].filter(Boolean).join(', '),
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        opacity: closing ? 0 : 1,
        transform: closing ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: closing ? 'none' : 'auto',
      }}
    >
      {/* Envelope flap seams converge behind the seal, echoing the reference stationery. */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 35 L50 58 L100 35" fill="none" stroke="var(--invite-accent)" strokeWidth="0.42" vectorEffect="non-scaling-stroke" />
        <path d="M0 39 L50 62 L100 39" fill="none" stroke="var(--invite-accent)" strokeWidth="0.42" vectorEffect="non-scaling-stroke" opacity="0.72" />
      </svg>

      <div className="absolute left-1/2 top-[60%] z-10 -translate-x-1/2 -translate-y-1/2">
        <div className={`tap-seal ${closing ? 'tap-seal--opening' : ''}`} aria-hidden>
          <div
            className="tap-seal__inner"
            style={{ backgroundColor: 'var(--invite-accent)', borderColor: 'var(--invite-accent)', color: 'var(--invite-primary)' }}
          >
            <span style={{ fontFamily: 'var(--invite-heading-font)', fontStyle: 'italic' }}>{initials.trim().split(/\s+/).join(' | ')}</span>
          </div>
        </div>
      </div>
    </button>
  )
}
