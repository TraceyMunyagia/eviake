import type { CSSProperties } from 'react'

/** Text typed in the builder: a blank line starts a new paragraph, a single Enter is a line break. */
export function Paragraphs({ text, className, style }: { text: string; className?: string; style?: CSSProperties }) {
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  return (
    <>
      {paragraphs.map((p, i) => (
        <p key={i} className={`whitespace-pre-line ${className ?? ''}`} style={style}>{p}</p>
      ))}
    </>
  )
}
