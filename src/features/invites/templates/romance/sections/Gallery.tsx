import { useState } from 'react'
import { X } from 'lucide-react'
import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'

const ROTATIONS = ['-rotate-2', 'rotate-1', '-rotate-1', 'rotate-2', 'rotate-0', '-rotate-3']

export function Gallery({ urls, captions, mode }: { urls?: string[]; captions?: string[]; mode?: 'preview' | 'public' }) {
  const [open, setOpen] = useState<number | null>(null)

  return (
    <Reveal mode={mode}>
      <section className="px-6 py-16 sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <div className="mb-10 text-center">
          <SectionLabel>Our favourite moments</SectionLabel>
          <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>Gallery</h2>
          <Divider className="mt-6" />
        </div>

        {!urls || urls.length === 0 ? (
          <p className={`text-center ${romanceType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            Photos will appear here closer to the day.
          </p>
        ) : (
          <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-6">
            {urls.map((u, i) => (
              <button
                key={i}
                onClick={() => setOpen(i)}
                className={`w-40 rounded-sm border-8 border-white bg-white p-1 shadow-md transition-transform hover:scale-105 sm:w-52 ${ROTATIONS[i % ROTATIONS.length]}`}
              >
                <img src={u} alt="" className="aspect-square w-full object-cover" />
                {captions?.[i] && <p className="mt-1 truncate text-center text-xs" style={{ fontFamily: 'var(--invite-accent-font)', color: 'var(--invite-primary)' }}>{captions[i]}</p>}
              </button>
            ))}
          </div>
        )}

        {open !== null && urls && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 bg-black/90 p-4" onClick={() => setOpen(null)}>
            <button aria-label="Close" className="absolute right-4 top-4 text-white"><X className="size-6" /></button>
            <img src={urls[open]} alt="" className="max-h-[80vh] max-w-full object-contain" />
            {captions?.[open] && <p className="text-white" style={{ fontFamily: 'var(--invite-accent-font)' }}>{captions[open]}</p>}
          </div>
        )}
      </section>
    </Reveal>
  )
}