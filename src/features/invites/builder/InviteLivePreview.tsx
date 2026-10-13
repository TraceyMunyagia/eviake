import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Smartphone, Monitor } from 'lucide-react'
import { SAMPLE_CONTENT, STRESS_CONTENT } from '@/features/invites/templates/sampleRegistry'
import { ROMANCE_SAMPLE_GUESTBOOK } from '@/features/invites/templates/romance/sampleContent'
import type { Invite, InviteSections } from '@/types/database'
import { onPreviewScroll } from './previewBridge'

const WIDTHS = { mobile: 390, desktop: 1280 } as const

// sections: the resolved flags from the builder, so legacy invites preview with the newer keys filled in
export function InviteLivePreview({ invite, sections }: { invite: Invite; sections: InviteSections }) {
  const frameRef = useRef<HTMLIFrameElement>(null)
  const [previewMode, setPreviewMode] = useState<'real' | 'sample' | 'stress'>('real')
  const [device, setDevice] = useState<keyof typeof WIDTHS>('desktop')

  const sample = SAMPLE_CONTENT[invite.template]
  const stress = STRESS_CONTENT[invite.template]
  const active = previewMode === 'sample' && sample ? sample : previewMode === 'stress' && stress ? stress : null
  const guestbookMessages = previewMode === 'sample' && invite.template === 'romance' ? ROMANCE_SAMPLE_GUESTBOOK : []


  const payload = useMemo(
  () => ({
    template: invite.template,
    content: active?.content ?? invite.content,
    tokens: invite.tokens,
    sections: active?.sections ?? sections,
    guestbookMessages,
  }),
  [invite.template, invite.content, invite.tokens, sections, active, guestbookMessages],
)

  const send = useCallback(() => {
    frameRef.current?.contentWindow?.postMessage({ type: 'evia-preview', payload }, window.location.origin)
  }, [payload])

  // Re-send whenever the invite, sample mode or template changes.
  useEffect(() => { send() }, [send])

  // Opening a section in the builder scrolls the frame to it
  useEffect(
    () =>
      onPreviewScroll((section) => {
        frameRef.current?.contentWindow?.postMessage({ type: 'evia:scroll-to', section }, window.location.origin)
      }),
    [],
  )

  // The frame announces when it's ready to receive (covers first load and reloads).
  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin === window.location.origin && e.data?.type === 'evia-preview-ready') send()
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [send])

  return (
    <div className="sticky top-6 overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line bg-plum-950 px-4 py-2 text-xs text-cream/80">
        <span>Live preview</span>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-full bg-white/10 p-0.5">
            <button aria-label="Preview at mobile width" onClick={() => setDevice('mobile')} className={`rounded-full p-1 ${device === 'mobile' ? 'bg-gold-500 text-plum-950' : ''}`}>
              <Smartphone className="size-3.5" />
            </button>
            <button aria-label="Preview at desktop width" onClick={() => setDevice('desktop')} className={`rounded-full p-1 ${device === 'desktop' ? 'bg-gold-500 text-plum-950' : ''}`}>
              <Monitor className="size-3.5" />
            </button>
          </div>
          <select
            value={active ? previewMode : 'real'}
            onChange={(e) => setPreviewMode(e.target.value as typeof previewMode)}
            className="rounded bg-white/10 px-2 py-1 text-xs"
            aria-label="Preview content"
          >
            <option value="real">Real content</option>
            {sample && <option value="sample">Sample content</option>}
            {stress && <option value="stress">Stress test</option>}
          </select>
          <span className="capitalize">{invite.template} · {invite.package}</span>
        </div>
      </div>
      <div className="flex justify-center overflow-x-auto bg-plum-950/5 py-4">
        <iframe
          ref={frameRef}
          src="/preview-frame"
          title="Invite preview"
          onLoad={send}
          className="block h-[70vh] border-0 bg-white shadow-md"
          style={{ width: WIDTHS[device], maxWidth: '100%' }}
        />
      </div>
    </div>
  )
}