import { Sparkles } from 'lucide-react'
import { celebrationType } from '@/features/invites/templates/celebration/type'
import { AnimatedWords } from '@/features/invites/templates/celebration/components/AnimatedWords'
import { Marquee } from '@/features/invites/templates/celebration/components/Marquee'
import { ParallaxLayer } from '@/features/invites/templates/celebration/components/ParallaxLayer'
import { formatEventDate, formatEventTime } from '@/lib/eventFormat'
import type { InviteContent } from '@/types/database'
import { HeroVideo } from '../HeroVideo'

// showVideo: hero video is an Experience feature (sections.video); otherwise the photo shows
export function Hero({ content, showVideo = false }: { content: InviteContent; showVideo?: boolean }) {
  const title = content.couple_names || content.event_name || 'The party'
  const date = formatEventDate(content.event_date)
  const time = formatEventTime(content.event_time)
  const chips = [date, time, content.venue].filter(Boolean) as string[]

  return (
    <section className="invite-hero-section relative overflow-hidden" style={{ backgroundColor: 'var(--invite-primary)', color: 'var(--invite-background)' }}>
      <div className="relative z-10 mx-auto grid max-w-6xl gap-12 px-5 pb-16 pt-16 sm:px-10 sm:pt-24 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div>
          {content.logo_url && <img src={content.logo_url} alt="" className="mb-6 h-10 w-auto object-contain sm:h-12" />}
          <h1 aria-label={title} className={celebrationType.display} style={{ fontFamily: 'var(--invite-heading-font)' }}>
            <AnimatedWords text={title} baseDelay={150} />
          </h1>

          {chips.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-2">
              {chips.map((chip, i) => (
                <span
                  key={i}
                  className="rounded-full border-2 px-4 py-1.5 text-sm font-bold"
                  style={{ borderColor: 'var(--invite-accent)', fontFamily: 'var(--invite-body-font)' }}
                >
                  {chip}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
          <ParallaxLayer speed={0.05} rotate={2}>
            <div
              className="aspect-[4/5] overflow-hidden rounded-[2rem] border-4"
              style={{
                borderColor: 'var(--invite-background)',
                boxShadow: '10px 10px 0 var(--invite-accent)',
                background: 'linear-gradient(135deg, var(--invite-accent), var(--invite-secondary))',
              }}
            >
              {content.hero_video_url && showVideo ? (
                <HeroVideo src={content.hero_video_url} poster={content.hero_image_url} className="h-full w-full" />
              ) : content.hero_image_url ? (
                <img src={content.hero_image_url} alt={content.hero_image_alt ?? ''} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Sparkles className="size-20" style={{ color: 'var(--invite-background)' }} />
                </div>
              )}
            </div>
          </ParallaxLayer>
        </div>
      </div>

      <Marquee
        items={[title, date, content.venue ?? '']}
        className="py-3 text-lg font-extrabold uppercase tracking-tight sm:text-2xl"
        style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)', fontFamily: 'var(--invite-heading-font)' }}
      />
    </section>
  )
}
