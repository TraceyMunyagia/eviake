import { useEffect, useState } from 'react'
import { getTemplateComponent } from '@/features/invites/templates/registry'
import { useInviteFonts } from '@/features/invites/design/useInviteFonts'
import type { GuestbookMessage, InviteContent, InviteSections, InviteTemplateKey, InviteTokens } from '@/types/database'




type Payload = {
  template: InviteTemplateKey
  content: InviteContent
  tokens: InviteTokens
  sections: InviteSections
  guestbookMessages?: GuestbookMessage[]
}

// Rendered inside the builder's <iframe>. Because the iframe has its own
// viewport, the template's sm:/lg: breakpoints respond to the frame width,
// which is what a real phone does. Only same-origin messages are accepted.
export function PreviewFramePage() {
  const [payload, setPayload] = useState<Payload | null>(null)
  useInviteFonts(payload?.tokens)

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== window.location.origin) return
      if (e.data?.type !== 'evia-preview') return
      setPayload(e.data.payload as Payload)
    }
    window.addEventListener('message', onMessage)
    // Tell the dashboard we're listening, so it (re)sends the current invite.
    window.parent.postMessage({ type: 'evia-preview-ready' }, window.location.origin)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  // The builder asks to show the section being edited; flash it so it's easy to spot
  useEffect(() => {
    function onScrollTo(e: MessageEvent) {
      if (e.origin !== window.location.origin || e.data?.type !== 'evia:scroll-to') return
      const el = document.querySelector<HTMLElement>(`[data-section="${CSS.escape(String(e.data.section))}"]`)
      if (!el) return
      const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start' })
      el.classList.remove('evia-section-flash')
      void el.offsetWidth // restart the animation
      el.classList.add('evia-section-flash')
      window.setTimeout(() => el.classList.remove('evia-section-flash'), 1400)
    }
    window.addEventListener('message', onScrollTo)
    return () => window.removeEventListener('message', onScrollTo)
  }, [])

  if (!payload) return <p className="p-10 text-center text-sm text-muted">Loading preview…</p>

  const Template = getTemplateComponent(payload.template)
  if (!Template) return <p className="p-10 text-center text-sm text-muted">This template isn't available to preview yet.</p>

  return <Template content={payload.content} tokens={payload.tokens} sections={payload.sections} mode="preview" guestbookMessages={payload.guestbookMessages} />
}
