/** "Tania & Surie" -> "T|S". Falls back to the first letter. */
export function deriveInitials(names: string | undefined): string {
  if (!names) return ''
  const parts = names.split(/&|\band\b|\+/i).map((s) => s.trim()).filter(Boolean)
  return parts.slice(0, 2).map((p) => p[0]?.toUpperCase() ?? '').join('|')
}
