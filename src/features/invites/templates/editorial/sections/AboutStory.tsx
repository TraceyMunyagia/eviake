import { editorialType } from '@/features/invites/templates/editorial/type'
import { SectionLabel } from '@/features/invites/templates/editorial/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'
import type { InviteContent } from '@/types/database'

export function AboutStory({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const hasImages = Boolean(content.about_image_url)
  const hasText = Boolean(content.about_text)

  if (!hasImages && !hasText) {
    return (
      <Reveal mode={mode}>
        <section className="px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
          <SectionLabel>Our Story</SectionLabel>
          <p className={`mt-4 ${editorialType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            Their story will be shared here soon.
          </p>
        </section>
      </Reveal>
    )
  }

  return (
    <Reveal mode={mode}>
      <section className="grid sm:min-h-[70vh] sm:grid-cols-2">
        {/* Image side — full-bleed, stacks above the text on mobile */}
        <div className="relative order-1 h-[45vh] sm:order-none sm:h-auto">
          {content.about_image_url ? (
            <img src={content.about_image_url} alt="" className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full" style={{ backgroundColor: 'var(--invite-surface)' }} />
          )}
          {content.about_image_url_2 && (
            <img
              src={content.about_image_url_2}
              alt=""
              className="absolute -bottom-8 right-6 hidden h-40 w-32 rounded-sm border-4 object-cover shadow-lg sm:block"
              style={{ borderColor: 'var(--invite-background)' }}
            />
          )}
        </div>

        {/* Text side */}
        <div
          className="order-2 flex flex-col justify-center px-6 py-16 sm:order-none sm:px-16 sm:py-0"
          style={{ backgroundColor: 'var(--invite-background)', color: 'var(--invite-primary)' }}
        >
          <SectionLabel>Our Story</SectionLabel>
          <h2 className={`mt-3 ${editorialType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}>
            {content.about_title || 'How it began'}
          </h2>
          {content.about_text && (
            <p className={`mt-5 ${editorialType.body} whitespace-pre-wrap`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
              {content.about_text}
            </p>
          )}
        </div>
      </section>
    </Reveal>
  )
}