import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { formatEventDate, parseEventDate } from '@/lib/eventFormat'

/** RSVPs stay open through the whole deadline day, so the cut-off is midnight at the end of it. */
export function rsvpCutoff(deadline?: string): Date | null {
  const d = parseEventDate(deadline)
  return d ? new Date(d.getTime() + 86_400_000) : null
}

/** Live time left until the RSVP cut-off; ticks every second on the last day, otherwise every 30 seconds. */
export function useRsvpDeadline(deadline?: string) {
  const cutoff = rsvpCutoff(deadline)
  const target = cutoff?.getTime() ?? null
  const [now, setNow] = useState(() => Date.now())
  const left = target !== null ? Math.max(target - now, 0) : null
  const lastDay = left !== null && left < 86_400_000

  useEffect(() => {
    if (target === null || left === 0) return
    const id = window.setInterval(() => setNow(Date.now()), lastDay ? 1000 : 30_000)
    return () => window.clearInterval(id)
  }, [target, lastDay, left === 0])

  return { cutoff, closed: left === 0, left }
}

/**
 * "Reply by 14 Oct 2026" with a mini countdown. Styling comes from the template:
 * tileClass/tileStyle for each unit box, labelFont for the small text.
 */
export function RsvpCountdown({ deadline, className = '', tileClass = '', tileStyle, numberFont = 'var(--invite-heading-font)', labelFont = 'var(--invite-body-font)' }: {
  deadline?: string
  className?: string
  tileClass?: string
  tileStyle?: CSSProperties
  numberFont?: string
  labelFont?: string
}) {
  const { closed, left } = useRsvpDeadline(deadline)
  if (left === null || closed) return null

  const s = Math.floor(left / 1000)
  const days = Math.floor(s / 86_400)
  const units: [number, string][] = days > 0
    ? [[days, days === 1 ? 'day' : 'days'], [Math.floor(s / 3600) % 24, 'hrs'], [Math.floor(s / 60) % 60, 'min']]
    : [[Math.floor(s / 3600), 'hrs'], [Math.floor(s / 60) % 60, 'min'], [s % 60, 'sec']]

  return (
    <div className={className}>
      <p className="text-xs uppercase tracking-[0.2em]" style={{ fontFamily: labelFont, color: 'var(--invite-muted)' }}>
        Please reply by {formatEventDate(deadline)}
      </p>
      <div className="mt-3 flex justify-center gap-2" role="timer" aria-label={`${units.map(([n, l]) => `${n} ${l}`).join(', ')} left to reply`}>
        {units.map(([n, label]) => (
          <div key={label} className={`min-w-14 px-2 py-1.5 text-center ${tileClass}`} style={tileStyle} aria-hidden>
            <div className="text-xl leading-none" style={{ fontFamily: numberFont }}>{String(n).padStart(2, '0')}</div>
            <div className="mt-1 text-[10px] uppercase tracking-wider" style={{ fontFamily: labelFont, opacity: 0.75 }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Shown in place of the form once the deadline has passed. */
export function RsvpClosed({ className = '', style }: { className?: string; style?: CSSProperties }) {
  return (
    <div className={className} style={style}>
      <p className="text-lg" style={{ fontFamily: 'var(--invite-heading-font)' }}>RSVPs are closed.</p>
      <p className="mt-1 text-sm" style={{ fontFamily: 'var(--invite-body-font)', color: 'var(--invite-muted)' }}>Need to change your answer? Get in touch with the host.</p>
    </div>
  )
}
