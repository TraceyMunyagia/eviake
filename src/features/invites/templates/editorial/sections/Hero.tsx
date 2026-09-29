import { ChevronDown } from 'lucide-react'
import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import type { InviteContent } from '@/types/database'

export function Hero({ content }: { content: InviteContent }) {
  const hasImage = Boolean(content.hero_image_url)

  return (
    <section className="relative flex min-h-[90vh] items-end sm:items-center" style={{ backgroundColor: 'var(--invite-background)' }}>
      {hasImage && (
        <div className="absolute inset-0">
          <img src={content.hero_image_url} alt="" role="presentation" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent sm:bg-gradient-to-r sm:from-black/50 sm:via-black/10 sm:to-transparent" />
        </div>
      )}

      {/* Asymmetric placement — content sits left-weighted on desktop rather
          than dead-centered, per the spec's asymmetrical-layout direction. */}
      <div className="relative z-10 w-full px-6 pb-14 pt-24 sm:w-3/5 sm:px-16 sm:py-24">
        {content.logo_url && <img src={content.logo_url} alt="" className="mb-6 h-10 w-auto sm:h-14" />}
        <p
          className={editorialType.kicker}
          style={{ color: hasImage ? '#fff' : 'var(--invite-accent)', fontFamily: 'var(--invite-body-font)' }}
        >
          You're invited
        </p>
        <h1
          className={`mt-4 ${editorialType.h1}`}
          style={{ color: hasImage ? '#fff' : 'var(--invite-primary)', fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}
        >
          {content.couple_names || content.event_name || 'Our celebration'}
        </h1>
        {(content.event_date || content.venue) && (
          <>
            <Divider className={`mt-6 sm:mx-0 ${hasImage ? 'opacity-90' : ''}`} />
            <p
              className={`mt-6 ${editorialType.body}`}
              style={{ color: hasImage ? 'rgba(255,255,255,.9)' : 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}
            >
              {content.event_date}
              {content.event_date && content.venue ? ' · ' : ''}
              {content.venue}
            </p>
          </>
        )}
      </div>

      <div className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-1 sm:flex" style={{ color: hasImage ? '#fff' : 'var(--invite-muted)' }}>
        <span className="text-[10px] uppercase tracking-[0.3em]" style={{ fontFamily: 'var(--invite-body-font)' }}>Scroll</span>
        <ChevronDown className="size-4 animate-bounce" />
      </div>
    </section>
  )
}