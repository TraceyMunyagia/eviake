import { getTemplateComponent } from '@/features/invites/templates/registry'
import type { Invite } from '@/types/database'

export function InviteLivePreview({ invite }: { invite: Invite }) {
  const Template = getTemplateComponent(invite.template)

  return (
    <div className="sticky top-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-line bg-plum-950 px-4 py-2 text-xs text-cream/80">
        <span>Live preview</span>
        <span className="capitalize">{invite.template} · {invite.package}</span>
      </div>
      <div className="h-[70vh] overflow-y-auto">
        {Template ? (
          <Template content={invite.content} tokens={invite.tokens} sections={invite.sections} mode="preview" />
        ) : (
          <p className="p-10 text-center text-sm text-muted">This template isn't available to preview yet.</p>
        )}
      </div>
    </div>
  )
}