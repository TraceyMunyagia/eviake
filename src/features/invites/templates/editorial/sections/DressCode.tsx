import { editorialType } from '@/features/invites/templates/editorial/type'
import { Divider } from '@/features/invites/templates/editorial/components/Divider'
import { SectionLabel } from '@/features/invites/templates/editorial/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/editorial/components/Reveal'
import type { InviteContent } from '@/types/database'

export function DressCode({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  if (!content.dress_code && !content.dress_code_note && (!content.dress_code_palette || content.dress_code_palette.length === 0)) {
    return null // no dress code set at all — omit the section rather than show an empty shell
  }

  return (
    <Reveal mode={mode}>
      <section className="mx-auto max-w-md px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <SectionLabel>What to Wear</SectionLabel>
        <h2 className={`mt-3 ${editorialType.h2}`} style={{ fontFamily: 'var(--invite-heading-font)', fontWeight: 500 }}>
          {content.dress_code || 'Dress code'}
        </h2>
        <Divider className="my-6" />

        {content.dress_code_note && (
          <p className={editorialType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            {content.dress_code_note}
          </p>
        )}

        {content.dress_code_palette && content.dress_code_palette.length > 0 && (
          <div className="mt-6 flex justify-center gap-3">
            {content.dress_code_palette.map((hex, i) => (
              <span key={i} className="size-10 rounded-full border" style={{ backgroundColor: hex, borderColor: 'var(--invite-hairline)' }} />
            ))}
          </div>
        )}

        {content.dress_code_image_urls && content.dress_code_image_urls.length > 0 && (
          <div className="mt-8 flex justify-center gap-2">
            {content.dress_code_image_urls.map((u, i) => (
              <img key={i} src={u} alt="" className="h-28 w-20 rounded-sm object-cover" />
            ))}
          </div>
        )}
      </section>
    </Reveal>
  )
}