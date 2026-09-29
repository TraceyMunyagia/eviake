import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'
import type { InviteContent } from '@/types/database'

export function DressCode({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  if (!content.dress_code && !content.dress_code_note && (!content.dress_code_palette || content.dress_code_palette.length === 0) && (!content.dress_code_image_urls || content.dress_code_image_urls.length === 0)) {
    return null
  }

  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-md px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)', borderTop: '1px solid var(--invite-hairline)' }}>
        <SectionLabel>What to wear</SectionLabel>
        <h2 className={`mt-3 ${romanceType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>
          {content.dress_code || 'Dress code'}
        </h2>
        <Divider className="my-6" />

        {content.dress_code_note && (
          <p className={romanceType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>{content.dress_code_note}</p>
        )}

        {content.dress_code_palette && content.dress_code_palette.length > 0 && (
          <div className="mt-6 flex justify-center gap-3">
            {content.dress_code_palette.map((hex, i) => (
              <span key={i} className="size-10 rounded-full border-2" style={{ backgroundColor: hex, borderColor: 'var(--invite-background)', boxShadow: '0 0 0 1px var(--invite-hairline)' }} />
            ))}
          </div>
        )}

        {content.dress_code_image_urls && content.dress_code_image_urls.length > 0 && (
          <div className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-6">
            {content.dress_code_image_urls.map((u, i) => (
              <img key={i} src={u} alt="" className="aspect-square w-40 rounded-sm border-8 border-white bg-white p-1 object-cover shadow-md sm:w-52" />
            ))}
          </div>
        )}
      </section>
    </Reveal>
  )
}
