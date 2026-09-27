import { useState } from 'react'
import { getTemplateComponent } from '@/features/invites/templates/registry'
import { EDITORIAL_SAMPLE_CONTENT, EDITORIAL_SAMPLE_SECTIONS } from '@/features/invites/templates/editorial/sampleContent'
import type { Invite } from '@/types/database'

export function InviteLivePreview({ invite }: { invite: Invite }) {
  const Template = getTemplateComponent(invite.template)
  const [showSample, setShowSample] = useState(false)

  const content = showSample && invite.template === 'editorial' ? EDITORIAL_SAMPLE_CONTENT : invite.content
  const sections = showSample && invite.template === 'editorial' ? EDITORIAL_SAMPLE_SECTIONS : invite.sections

  return (
    <div className="sticky top-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-line bg-plum-950 px-4 py-2 text-xs text-cream/80">
        <span>Live preview</span>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSample((v) => !v)} className="underline">
            {showSample ? 'Show real content' : 'Preview with sample content'}
          </button>
          <span className="capitalize">{invite.template} · {invite.package}</span>
        </div>
      </div>
      <div className="h-[70vh] overflow-y-auto">
        {Template ? (
          <Template content={content} tokens={invite.tokens} sections={sections} mode="preview" />
        ) : (
          <p className="p-10 text-center text-sm text-muted">This template isn't available to preview yet.</p>
        )}
      </div>
    </div>
  )
}