import { useId } from 'react'
import { Sparkles } from 'lucide-react'

// A slowly rotating circular badge with looping text.
export function Sticker({ label }: { label: string }) {
  const id = useId().replace(/:/g, '')
  const unit = `${label.slice(0, 22).toUpperCase()} • `
  const text = unit.repeat(Math.max(1, Math.round(38 / unit.length)))

  return (
    <div aria-hidden className="relative size-28 sm:size-36">
      <svg viewBox="0 0 200 200" className="cel-spin absolute inset-0 size-full">
        <defs>
          <path id={id} d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0" />
        </defs>
        <circle cx="100" cy="100" r="98" style={{ fill: 'var(--invite-accent)' }} />
        <text fontSize="15" fontWeight="700" letterSpacing="2" style={{ fill: 'var(--invite-primary)', fontFamily: 'var(--invite-body-font)' }}>
          <textPath href={`#${id}`}>{text}</textPath>
        </text>
      </svg>
      <div
        className="absolute inset-[26%] flex items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--invite-secondary)', color: 'var(--invite-primary)' }}
      >
        <Sparkles className="size-6 sm:size-8" />
      </div>
    </div>
  )
}