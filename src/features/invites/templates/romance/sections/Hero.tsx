import { romanceType } from '@/features/invites/templates/romance/type'
import type { InviteContent } from '@/types/database'

export function Hero({ content }: { content: InviteContent }) {
  const hasImage = Boolean(content.hero_image_url)

  return (
    <section
      className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden px-6 py-20 text-center"
      style={{ backgroundColor: 'var(--invite-background)' }}
    >
      {hasImage && (
        <div className="absolute inset-0">
          <img src={content.hero_image_url} alt="" role="presentation" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/50" />
        </div>
      )}

      {/* Optional decorative floral overlay — renders nothing until you
          supply an illustrated asset via Canva/AI generation, per the plan. */}
      {content.floral_accent_url && (
        <img
          src={content.floral_accent_url}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -top-6 left-1/2 w-64 -translate-x-1/2 opacity-90 sm:w-80"
        />
      )}

      <div className="relative z-10">
        <p className={romanceType.kicker} style={{ color: hasImage ? '#fff' : 'var(--invite-accent)', fontFamily: 'var(--invite-body-font)' }}>
          Together with love
        </p>
        <h1
          className={`mt-4 ${romanceType.script}`}
          style={{ color: hasImage ? '#fff' : 'var(--invite-primary)', fontFamily: 'var(--invite-accent-font)' }}
        >
          {content.couple_names || content.event_name || 'Our celebration'}
        </h1>
        {(content.event_date || content.venue) && (
          <p className={`mt-5 ${romanceType.body}`} style={{ color: hasImage ? 'rgba(255,255,255,.9)' : 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            {content.event_date}
            {content.event_date && content.venue ? ' · ' : ''}
            {content.venue}
          </p>
        )}
      </div>
    </section>
  )
}