import { useCallback, useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { celebrationType } from '@/features/invites/templates/celebration/type'
import { Reveal } from '@/features/invites/templates/celebration/components/Reveal'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

// Static class strings so Tailwind can see them (dynamic names get purged).
const TILTS = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3', '-rotate-2', 'rotate-1']

export function Gallery({ urls, captions, mode }: { urls?: string[]; captions?: string[]; mode?: 'preview' | 'public' }) {
  const reduced = usePrefersReducedMotion()
  const stripRef = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState<number | null>(null)
  const count = urls?.length ?? 0

  const step = useCallback(
    (dir: 1 | -1) => setOpen((i) => (i === null || count === 0 ? i : (i + dir + count) % count)),
    [count],
  )

  useEffect(() => {
    if (open === null) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(null)
      if (e.key === 'ArrowRight') step(1)
      if (e.key === 'ArrowLeft') step(-1)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, step])

  function scrollStrip(dir: 1 | -1) {
    stripRef.current?.scrollBy({ left: dir * 320, behavior: reduced ? 'auto' : 'smooth' })
  }

  const arrowStyle = { borderColor: 'var(--invite-accent)', color: 'var(--invite-background)' }

  return (
    <section className="overflow-hidden py-16 sm:py-24" style={{ backgroundColor: 'var(--invite-primary)', color: 'var(--invite-background)' }}>
      <Reveal mode={mode}>
        <div className="mx-auto flex max-w-5xl items-end justify-between gap-4 px-5 sm:px-10">
          <h2 className={celebrationType.h2} style={{ fontFamily: 'var(--invite-heading-font)' }}>Snapshots</h2>
          {count > 1 && (
            <div className="hidden gap-2 sm:flex">
              <button aria-label="Scroll photos left" onClick={() => scrollStrip(-1)} className="cel-press rounded-full border-2 p-3" style={arrowStyle}><ChevronLeft className="size-5" /></button>
              <button aria-label="Scroll photos right" onClick={() => scrollStrip(1)} className="cel-press rounded-full border-2 p-3" style={arrowStyle}><ChevronRight className="size-5" /></button>
            </div>
          )}
        </div>

        {!urls || count === 0 ? (
          <p className={`mx-auto mt-6 max-w-5xl px-5 sm:px-10 ${celebrationType.body}`} style={{ opacity: 0.8, fontFamily: 'var(--invite-body-font)' }}>
            Photos land here closer to the party.
          </p>
        ) : (
          <div
            ref={stripRef}
            className="mt-10 flex snap-x snap-mandatory overflow-x-auto px-8 pb-10 pt-4 sm:px-16 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {urls.map((u, i) => (
              <button
                key={i}
                aria-label={`Open photo ${i + 1}`}
                onClick={() => setOpen(i)}
                className={`relative w-56 shrink-0 snap-center p-3 pb-4 transition-transform duration-200 hover:z-10 hover:rotate-0 hover:scale-105 sm:w-72 -ml-5 first:ml-0 ${TILTS[i % TILTS.length]}`}
                style={{ backgroundColor: 'var(--invite-background)', color: 'var(--invite-primary)', boxShadow: '6px 6px 0 var(--invite-accent)' }}
              >
                <img src={u} alt="" className="aspect-[4/5] w-full object-cover" />
                <p className="mt-2 min-h-9 truncate text-center text-2xl" style={{ fontFamily: 'var(--invite-accent-font)' }}>
                  {captions?.[i] ?? ''}
                </p>
              </button>
            ))}
          </div>
        )}
      </Reveal>

      {open !== null && urls && (
        <div role="dialog" aria-modal="true" aria-label="Photo viewer" className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
          <button aria-label="Close" className="absolute right-4 top-4 text-white"><X className="size-7" /></button>
          {count > 1 && (
            <>
              <button aria-label="Previous photo" onClick={(e) => { e.stopPropagation(); step(-1) }} className="absolute left-3 rounded-full bg-white/15 p-3 text-white"><ChevronLeft className="size-6" /></button>
              <button aria-label="Next photo" onClick={(e) => { e.stopPropagation(); step(1) }} className="absolute right-3 rounded-full bg-white/15 p-3 text-white"><ChevronRight className="size-6" /></button>
            </>
          )}
          <div className="flex max-h-full flex-col items-center gap-3" onClick={(e) => e.stopPropagation()}>
            <img src={urls[open]} alt="" className="max-h-[80vh] max-w-full object-contain" />
            {captions?.[open] && <p className="text-3xl text-white" style={{ fontFamily: 'var(--invite-accent-font)' }}>{captions[open]}</p>}
          </div>
        </div>
      )}
    </section>
  )
}