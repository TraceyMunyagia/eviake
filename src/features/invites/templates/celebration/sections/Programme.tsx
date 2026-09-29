import { useState } from 'react'
import { celebrationType } from '@/features/invites/templates/celebration/type'
import { Reveal } from '@/features/invites/templates/celebration/components/Reveal'
import type { InviteContent } from '@/types/database'

export function Programme({ items, mode }: { items?: InviteContent['schedule']; mode?: 'preview' | 'public' }) {
  // Tap an item to highlight it (tap again to clear). Useful when guests
  // want to flag "the bit I care about" on a busy timeline.
  const [active, setActive] = useState<number | null>(null)

  return (
    <section className="px-5 py-16 sm:px-10 sm:py-24" style={{ color: 'var(--invite-primary)' }}>
      <Reveal mode={mode} className="mx-auto max-w-3xl">
        <h2 className={celebrationType.h2} style={{ fontFamily: 'var(--invite-heading-font)' }}>The plan</h2>

        {!items || items.length === 0 ? (
          <p className={`mt-6 ${celebrationType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            The plan drops closer to the day.
          </p>
        ) : (
          <ol className="relative mt-10 space-y-5 pl-12">
            <span aria-hidden className="absolute bottom-3 left-[15px] top-3 w-1" style={{ backgroundColor: 'var(--invite-primary)' }} />
            {items.map((item, i) => {
              const on = active === i
              return (
                <li key={i}>
                  <Reveal mode={mode} delay={i * 70} className="relative">
                    <span
                      aria-hidden
                      className="absolute -left-12 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full border-4 text-xs font-extrabold"
                      style={{ backgroundColor: on ? 'var(--invite-accent)' : 'var(--invite-background)', borderColor: 'var(--invite-primary)' }}
                    >
                      {i + 1}
                    </span>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActive(on ? null : i)}
                      className="cel-press cel-input flex w-full flex-wrap items-center gap-x-5 gap-y-1 rounded-2xl border-4 px-5 py-4 text-left"
                      style={{
                        borderColor: 'var(--invite-primary)',
                        backgroundColor: on ? 'var(--invite-accent)' : 'var(--invite-surface)',
                        boxShadow: on ? '6px 6px 0 var(--invite-primary)' : '3px 3px 0 var(--invite-primary)',
                      }}
                    >
                      <span className="text-xl font-extrabold sm:text-2xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>{item.time}</span>
                      <span className="text-base font-semibold sm:text-lg" style={{ fontFamily: 'var(--invite-body-font)' }}>{item.label}</span>
                    </button>
                  </Reveal>
                </li>
              )
            })}
          </ol>
        )}
      </Reveal>
    </section>
  )
}