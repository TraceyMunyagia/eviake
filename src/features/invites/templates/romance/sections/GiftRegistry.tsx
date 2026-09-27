import { Gift } from 'lucide-react'
import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import type { InviteContent } from '@/types/database'

export function GiftRegistry({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  if (!content.gift_message && (!content.registries || content.registries.length === 0)) return null

  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-md px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <SectionLabel>With gratitude</SectionLabel>
        <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>Gifts</h2>
        <Divider className="my-6" />

        {content.gift_message && (
          <p className={romanceType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>{content.gift_message}</p>
        )}

        {content.registries && content.registries.length > 0 && (
          <div className="mt-6 flex flex-col items-center gap-3">
            {content.registries.map((r, i) => (
              <a
                key={i}
                href={r.url || '#'}
                target={mode === 'public' && r.url ? '_blank' : undefined}
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full border px-5 py-2 text-sm"
                style={{ borderColor: 'var(--invite-hairline)', fontFamily: 'var(--invite-body-font)' }}
              >
                <Gift className="size-4" /> {r.name}
              </a>
            ))}
          </div>
        )}
      </section>
    </Reveal>
  )
}
