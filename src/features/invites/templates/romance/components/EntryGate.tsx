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
          content.hero_image_url ? `linear-gradient(color-mix(in srgb, var(--invite-background) 24%, transparent), color-mix(in srgb, var(--invite-background) 24%, transparent)), url(${content.hero_image_url})` : '',
        ].filter(Boolean).join(', '),
        backgroundPosition: 'center',
        backgroundSize: 'cover',
        opacity: closing ? 0 : 1,
        transform: closing ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: closing ? 'none' : 'auto',
      }}
    >
      {/* Curved ribbons sweep in from both sides toward the floral seal, like the reference cover. */}
      <svg aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d="M0 35 C16 38 20 49 35 53 C42 55 47 54 50 50" fill="none" stroke="var(--invite-accent)" strokeWidth="0.42" vectorEffect="non-scaling-stroke" />
        <path d="M0 39 C16 42 22 52 36 56 C43 58 47 56 50 52" fill="none" stroke="var(--invite-accent)" strokeWidth="0.42" vectorEffect="non-scaling-stroke" opacity="0.72" />
        <path d="M100 35 C84 38 80 49 65 53 C58 55 53 54 50 50" fill="none" stroke="var(--invite-accent)" strokeWidth="0.42" vectorEffect="non-scaling-stroke" />
        <path d="M100 39 C84 42 78 52 64 56 C57 58 53 56 50 52" fill="none" stroke="var(--invite-accent)" strokeWidth="0.42" vectorEffect="non-scaling-stroke" opacity="0.72" />
      </svg>

      <div className="relative z-10 -translate-y-8 flex flex-col items-center">
        <p
          className="text-5xl tracking-[0.12em] sm:text-6xl"
          style={{ fontFamily: 'var(--invite-heading-font)', color: 'var(--invite-primary)' }}
        >
          {initials.split(' ').join(' | ')}
        </p>

        {/* The seal is the visual tap target. The expanding ring gives guests
            the same tactile cue as tapping the invitation in the reference. */}
        <div className="relative mt-14 flex h-28 w-28 items-center justify-center">
          <span aria-hidden className="absolute inset-0 animate-ping rounded-full border" style={{ borderColor: 'var(--invite-accent)', opacity: 0.35 }} />
          <span aria-hidden className="absolute inset-3 rounded-full border" style={{ borderColor: 'var(--invite-hairline)' }} />
          <div className="relative flex h-24 w-24 items-center justify-center">
            {content.floral_accent_url ? (
              <img src={content.floral_accent_url} alt="" className="h-full w-full object-contain" />
            ) : (
              <svg viewBox="0 0 64 64" className="h-full w-full" aria-hidden>
                <g fill="var(--invite-accent)">
                  <circle cx="32" cy="20" r="10" />
                  <circle cx="20" cy="34" r="10" />
                  <circle cx="44" cy="34" r="10" />
                  <circle cx="32" cy="46" r="8" />
                </g>
                <circle cx="32" cy="32" r="6" fill="var(--invite-primary)" />
              </svg>
            )}
          </div>
        </div>

        <span
          className="mt-7 text-[10px] uppercase tracking-[0.3em]"
          style={{ color: 'var(--invite-primary)', fontFamily: 'var(--invite-body-font)' }}
        >
          Tap to open
        </span>
      </div>
    </button>
  )
}
