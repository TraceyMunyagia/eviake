import type { InviteContent } from '@/types/database'

export function Hero({ content }: { content: InviteContent }) {
  const heroImageUrl = typeof content.hero_image_url === 'string' ? content.hero_image_url : undefined
  const logoUrl = typeof content.logo_url === 'string' ? content.logo_url : undefined
  const title = typeof content.couple_names === 'string'
    ? content.couple_names
    : typeof content.event_name === 'string'
      ? content.event_name
      : 'Our celebration'
  const eventDate = typeof content.event_date === 'string' ? content.event_date : undefined
  const venue = typeof content.venue === 'string' ? content.venue : undefined

  return (
    <section
      className="flex min-h-[70vh] flex-col items-center justify-center px-4 py-12 text-center sm:px-6 sm:py-16"
      style={{
        backgroundImage: heroImageUrl
          ? `linear-gradient(rgba(0,0,0,.35), rgba(0,0,0,.35)), url(${heroImageUrl})`
          : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: heroImageUrl ? '#fff' : 'var(--invite-primary)',
      }}
    >
      {logoUrl && <img src={logoUrl} alt="" className="mb-6 h-14 w-auto" />}
      <p className="text-xs uppercase tracking-[0.3em] opacity-80" style={{ fontFamily: 'var(--invite-body-font)' }}>
        You're invited
      </p>
      <h1 className="mt-4 text-3xl leading-tight sm:text-5xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>
        {title}
      </h1>
      {(eventDate || venue) && (
        <p className="mt-4 text-sm sm:text-base" style={{ fontFamily: 'var(--invite-body-font)' }}>
          {eventDate}{eventDate && venue ? ' · ' : ''}{venue}
        </p>
      )}
    </section>
  )
}
