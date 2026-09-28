import { useEffect, useState } from 'react'
import { Sparkles } from 'lucide-react'
import { celebrationType } from '@/features/invites/templates/celebration/type'
import { ActionButton } from '@/features/invites/templates/celebration/components/ActionButton'
import { Confetti } from '@/features/invites/templates/celebration/components/Confetti'
import { Marquee } from '@/features/invites/templates/celebration/components/Marquee'
import { Reveal } from '@/features/invites/templates/celebration/components/Reveal'
import { useScrollReveal } from '@/hooks/useScrollReveal'
import { formatEventDate } from '@/lib/eventFormat'
import type { InviteContent } from '@/types/database'

export function Closing({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  const { ref, visible } = useScrollReveal<HTMLElement>()
  const [burst, setBurst] = useState(0)

  // One burst the first time the closing scrolls into view; the button fires more.
  useEffect(() => {
    if (visible) setBurst((b) => b + 1)
  }, [visible])

  const name = content.couple_names || content.event_name
  const tag = content.hashtag?.replace(/^#+/, '').trim()
  const date = formatEventDate(content.event_date)
  const links = (content.social_links ?? []).filter((l) => l.url)

  return (
    <section ref={ref} className="relative overflow-hidden" style={{ backgroundColor: 'var(--invite-primary)', color: 'var(--invite-background)' }}>
      <Confetti burst={burst} />

      <div className="relative z-10 mx-auto max-w-4xl px-5 py-20 text-center sm:px-10 sm:py-28">
        {content.closing_image_url && (
          <img
            src={content.closing_image_url}
            alt=""
            className="mx-auto mb-8 h-40 w-32 rotate-3 rounded-2xl border-4 object-cover sm:h-52 sm:w-40"
            style={{ borderColor: 'var(--invite-background)', boxShadow: '6px 6px 0 var(--invite-accent)' }}
          />
        )}

        <Reveal mode={mode}>
          <h2 className={celebrationType.display} style={{ fontFamily: 'var(--invite-heading-font)' }}>Thank you!</h2>
          <p className={`mx-auto mt-6 max-w-xl ${celebrationType.statement}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>
            {content.closing_message || "We can't wait to celebrate with you."}
          </p>
          {name && <p className="mt-6 text-4xl sm:text-5xl" style={{ fontFamily: 'var(--invite-accent-font)' }}>{name}</p>}
          {date && <p className={`mt-2 opacity-80 ${celebrationType.caption}`} style={{ fontFamily: 'var(--invite-body-font)' }}>{date}</p>}

          {tag && (
            <span
              className="mt-6 inline-block -rotate-2 rounded-full px-5 py-2 text-lg font-extrabold"
              style={{ backgroundColor: 'var(--invite-secondary)', color: 'var(--invite-primary)', fontFamily: 'var(--invite-heading-font)' }}
            >
              #{tag}
            </span>
          )}

          {links.length > 0 && (
            <div className="mt-6 flex flex-wrap justify-center gap-4">
              {links.map((l, i) => (
                <ActionButton key={i} onDark tone="light" href={l.url}>{l.name}</ActionButton>
              ))}
            </div>
          )}

          <div className="mt-8">
            <ActionButton onDark tone="accent" icon={<Sparkles className="size-4" />} onClick={() => setBurst((b) => b + 1)}>
              Throw more confetti
            </ActionButton>
          </div>
        </Reveal>
      </div>

      <Marquee
        items={[tag ? `#${tag}` : '', name ?? '', date]}
        className="py-3 text-lg font-extrabold uppercase tracking-tight sm:text-2xl"
        style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)', fontFamily: 'var(--invite-heading-font)' }}
      />
    </section>
  )
}