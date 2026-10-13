import { useEffect } from 'react'
import { fontsUrl } from './fontRegistry'
import type { Tokens } from './tokenKeys'

/** Keeps a single <link> pointing at this invite's fonts. Used by the public page, the preview frame, the guest pass and the builder. */
export function useInviteFonts(tokens: Tokens | null | undefined) {
  const url = fontsUrl(tokens)
  useEffect(() => {
    if (!url) return
    let link = document.getElementById('evia-invite-fonts') as HTMLLinkElement | null
    if (!link) {
      link = document.createElement('link')
      link.id = 'evia-invite-fonts'
      link.rel = 'stylesheet'
      document.head.appendChild(link)
    }
    if (link.href !== url) link.href = url
  }, [url])
}
