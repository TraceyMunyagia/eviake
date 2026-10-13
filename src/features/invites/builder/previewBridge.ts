const EVENT = 'evia:preview-scroll'

/** Ask the builder preview to scroll to a section (catalog key, e.g. 'location'). */
export function previewScrollTo(section: string) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: { section } }))
}

export function onPreviewScroll(handler: (section: string) => void) {
  const h = (e: Event) => handler((e as CustomEvent<{ section: string }>).detail.section)
  window.addEventListener(EVENT, h)
  return () => window.removeEventListener(EVENT, h)
}
