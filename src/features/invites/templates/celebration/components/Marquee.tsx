import type { CSSProperties } from 'react'

export function Marquee({ items, className = '', style }: { items: string[]; className?: string; style?: CSSProperties }) {
  const clean = items.filter(Boolean)
  const list = clean.length ? clean : ["You're invited"]
  const row = Array.from({ length: 6 }).flatMap(() => list)

  // Two identical halves; the track slides -50%, so the loop is seamless.
  const half = (
    <div className="flex shrink-0 items-center">
      {row.map((text, i) => (
        <span key={i} className="flex items-center whitespace-nowrap">
          <span className="px-5">{text}</span>
          <span className="size-2.5 rotate-45" style={{ backgroundColor: 'currentColor' }} />
        </span>
      ))}
    </div>
  )

  return (
    <div aria-hidden className={`overflow-hidden ${className}`} style={style}>
      <div className="cel-marquee-track">{half}{half}</div>
    </div>
  )
}