import { useState } from 'react'
import { Smartphone, Monitor } from 'lucide-react'
import { getTemplateComponent } from '@/features/invites/templates/registry'
import { EDITORIAL_SAMPLE_CONTENT, EDITORIAL_SAMPLE_SECTIONS, EDITORIAL_STRESS_CONTENT, EDITORIAL_STRESS_SECTIONS } from '@/features/invites/templates/editorial/sampleContent'
import type { Invite } from '@/types/database'

const WIDTHS = { mobile: 390, desktop: 1280 } as const

export function InviteLivePreview({ invite }: { invite: Invite }) {
  const Template = getTemplateComponent(invite.template)
  const [previewMode, setPreviewMode] = useState<'real' | 'sample' | 'stress'>('real')
  const [device, setDevice] = useState<keyof typeof WIDTHS>('desktop')

  const content =
    invite.template !== 'editorial' ? invite.content
    : previewMode === 'sample' ? EDITORIAL_SAMPLE_CONTENT
    : previewMode === 'stress' ? EDITORIAL_STRESS_CONTENT
    : invite.content

  const sections =
    invite.template !== 'editorial' ? invite.sections
    : previewMode === 'sample' ? EDITORIAL_SAMPLE_SECTIONS
    : previewMode === 'stress' ? EDITORIAL_STRESS_SECTIONS
    : invite.sections

  return (
    <div className="sticky top-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-plum-950 px-4 py-2 text-xs text-cream/80">
        <span>Live preview</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5">
            <button
              aria-label="Preview at mobile width"
              onClick={() => setDevice('mobile')}
              className={`rounded-full p-1 ${device === 'mobile' ? 'bg-gold-500 text-plum-950' : ''}`}
            >
              <Smartphone className="size-3.5" />
            </button>
            <button
              aria-label="Preview at desktop width"
              onClick={() => setDevice('desktop')}
              className={`rounded-full p-1 ${device === 'desktop' ? 'bg-gold-500 text-plum-950' : ''}`}
            >
              <Monitor className="size-3.5" />
            </button>
          </div>
          <select
            value={previewMode}
            onChange={(e) => setPreviewMode(e.target.value as typeof previewMode)}
            className="rounded bg-white/10 px-2 py-1 text-xs"
            aria-label="Preview content"
          >
            <option value="real">Real content</option>
            <option value="sample">Sample content</option>
            <option value="stress">Stress test</option>
          </select>
          <span className="capitalize">{invite.template} · {invite.package}</span>
        </div>
      </div>
      <div className="flex justify-center overflow-x-auto bg-plum-950/5 py-4">
        <div style={{ width: WIDTHS[device], maxWidth: '100%' }} className="h-[70vh] overflow-y-auto bg-white shadow-md">
          {Template ? (
            <Template content={content} tokens={invite.tokens} sections={sections} mode="preview" />
          ) : (
            <p className="p-10 text-center text-sm text-muted">This template isn't available to preview yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
