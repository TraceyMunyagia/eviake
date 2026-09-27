import { useState } from 'react'
import { X } from 'lucide-react'
import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import { SectionLabel } from '@/features/invites/templates/editorial/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'

export function Gallery({ urls, mode }: { urls?: string[]; mode?: 'preview' | 'public' }) {
  const [open, setOpen] = useState<string | null>(null)

  return (
    <Reveal mode={mode}>
      <section className="px-6 py-16 sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <div className="mb-8 text-center">
          <SectionLabel>Moments</SectionLabel>
          <h2 className={`mt-3 ${editorialType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}>Gallery</h2>
          <Divider className="mt-6" />
        </div>

        {!urls || urls.length === 0 ? (
          <p className={`text-center ${editorialType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            Photos will appear here closer to the day.
          </p>
        ) : (
          <div className="mx-auto max-w-3xl columns-2 gap-2 sm:columns-3 sm:gap-3 [&>*]:mb-2 sm:[&>*]:mb-3">
            {urls.map((u, i) => (
              <button key={i} onClick={() => setOpen(u)} className="block w-full overflow-hidden rounded-sm">
                <img src={u} alt="" className="w-full object-cover" />
              </button>
            ))}
          </div>
        )}

        {open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setOpen(null)}>
            <button aria-label="Close" className="absolute right-4 top-4 text-white"><X className="size-6" /></button>
            <img src={open} alt="" className="max-h-full max-w-full object-contain" />
          </div>
        )}
      </section>
    </Reveal>
  )
}