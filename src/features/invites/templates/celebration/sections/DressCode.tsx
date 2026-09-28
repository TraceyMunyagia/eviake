import { celebrationType } from '@/features/invites/templates/celebration/type'
import { Reveal } from '@/features/invites/templates/celebration/components/Reveal'
import type { InviteContent } from '@/types/database'

const TILTS = ['-rotate-3', 'rotate-2', '-rotate-1', 'rotate-3']

export function DressCode({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const palette = content.dress_code_palette ?? []
  const images = content.dress_code_image_urls ?? []
  if (!content.dress_code && !content.dress_code_note && palette.length === 0 && images.length === 0) return null

  return (
    <section className="px-5 py-16 sm:px-10 sm:py-24" style={{ backgroundColor: 'var(--invite-secondary)', color: 'var(--invite-primary)' }}>
      <Reveal mode={mode} className="mx-auto max-w-4xl">
        <span
          className={`inline-block -rotate-2 rounded-full border-2 px-4 py-1.5 ${celebrationType.kicker}`}
          style={{ borderColor: 'var(--invite-primary)', backgroundColor: 'var(--invite-background)', fontFamily: 'var(--invite-body-font)' }}
        >
          What to wear
        </span>
        <h2 className={`mt-5 ${celebrationType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>
          {content.dress_code || 'Dress code'}
        </h2>
        {content.dress_code_note && (
          <p className={`mt-4 max-w-2xl ${celebrationType.body}`} style={{ fontFamily: 'var(--invite-body-font)' }}>{content.dress_code_note}</p>
        )}

        {palette.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-5">
            {palette.map((hex, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <span
                  className={`size-20 rounded-3xl border-4 sm:size-24 ${TILTS[i % TILTS.length]}`}
                  style={{ backgroundColor: hex, borderColor: 'var(--invite-primary)', boxShadow: '4px 4px 0 var(--invite-primary)' }}
                />
                <span className={celebrationType.caption} style={{ fontFamily: 'var(--invite-body-font)' }}>{hex}</span>
              </div>
            ))}
          </div>
        )}

        {images.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-4">
            {images.map((u, i) => (
              <img
                key={i}
                src={u}
                alt=""
                className={`h-44 w-32 rounded-2xl border-4 object-cover sm:h-56 sm:w-40 ${TILTS[(i + 1) % TILTS.length]}`}
                style={{ borderColor: 'var(--invite-primary)', boxShadow: '4px 4px 0 var(--invite-primary)' }}
              />
            ))}
          </div>
        )}
      </Reveal>
    </section>
  )
}