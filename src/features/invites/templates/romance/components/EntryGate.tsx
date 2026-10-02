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
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden transition-all duration-700 ease-in"
      style={{
        backgroundColor: 'var(--invite-background)',
        opacity: closing ? 0 : 1,
        transform: closing ? 'scale(1.03)' : 'scale(1)',
        pointerEvents: closing ? 'none' : 'auto',
      }}
    >
      {/* The two ribbon lines crossing toward the centre, echoing the photo's tied-ribbon look */}
      <svg aria-hidden className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
        <line x1="0%" y1="0%" x2="50%" y2="48%" stroke="var(--invite-accent)" strokeWidth="1.5" />
        <line x1="100%" y1="0%" x2="50%" y2="48%" stroke="var(--invite-accent)" strokeWidth="1.5" />
        <line x1="0%" y1="100%" x2="50%" y2="52%" stroke="var(--invite-accent)" strokeWidth="1.5" />
        <line x1="100%" y1="100%" x2="50%" y2="52%" stroke="var(--invite-accent)" strokeWidth="1.5" />
      </svg>

      <div className="relative z-10 flex flex-col items-center">
        <p
          className="text-5xl tracking-[0.15em] sm:text-6xl"
          style={{ fontFamily: 'var(--invite-heading-font)', color: 'var(--invite-primary)' }}
        >
          {initials}
        </p>

        {/* Floral seal — swap the fallback SVG for a real illustrated asset
            (floral_accent_url) once you have one from Canva/AI generation. */}
        <div className="mt-10 flex h-16 w-16 items-center justify-center">
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
    </button>
  )
}