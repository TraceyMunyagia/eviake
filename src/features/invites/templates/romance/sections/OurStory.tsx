import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import type { InviteContent } from '@/types/database'

export function OurStory({ items, mode }: { items?: InviteContent['story_items']; mode?: 'preview' | 'public' }) {
  if (!items || items.length === 0) return null // no story yet — omit rather than show an empty timeline shell

  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-2xl px-6 py-16 sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <div className="mb-10 text-center">
          <SectionLabel>Our story</SectionLabel>
          <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>How we got here</h2>
          <Divider className="mt-6" />
        </div>

        <div className="space-y-12">
          {items.map((item, i) => (
            <div key={i} className={`flex flex-col items-center gap-6 sm:flex-row ${i % 2 === 1 ? 'sm:flex-row-reverse' : ''}`}>
              {item.image_url ? (
                <img src={item.image_url} alt="" className="h-48 w-full rounded-3xl object-cover sm:w-64" />
              ) : (
                <div className="flex h-48 w-full items-center justify-center rounded-3xl sm:w-64" style={{ backgroundColor: 'var(--invite-surface)' }} />
              )}
              <div className="text-center sm:text-left">
                {item.date && (
                  <p className={`${romanceType.caption} uppercase tracking-widest`} style={{ color: 'var(--invite-accent)', fontFamily: 'var(--invite-body-font)' }}>{item.date}</p>
                )}
                {item.title && (
                  <p className={`mt-1 ${romanceType.h3}`} style={{ fontFamily: 'var(--invite-accent-font)' }}>{item.title}</p>
                )}
                {item.text && (
                  <p className={`mt-2 ${romanceType.body}`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>{item.text}</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>
    </Reveal>
  )
}