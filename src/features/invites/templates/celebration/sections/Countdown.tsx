import { useEffect, useState } from 'react'
import { celebrationType } from '@/features/invites/templates/celebration/type'
import { Reveal } from '@/features/invites/templates/celebration/components/Reveal'

function timeParts(target: Date) {
  const diff = target.getTime() - Date.now()
  const safe = Math.max(diff, 0)
  return {
    over: diff <= 0,
    days: Math.floor(safe / 86_400_000),
    hours: Math.floor((safe / 3_600_000) % 24),
    minutes: Math.floor((safe / 60_000) % 60),
    seconds: Math.floor((safe / 1_000) % 60),
  }
}

const TILES = [
  { bg: 'var(--invite-background)', fg: 'var(--invite-primary)', rot: -2 },
  { bg: 'var(--invite-secondary)', fg: 'var(--invite-primary)', rot: 1.5 },
  { bg: 'var(--invite-primary)', fg: 'var(--invite-background)', rot: -1 },
  { bg: 'var(--invite-background)', fg: 'var(--invite-primary)', rot: 2 },
]

export function Countdown({ eventDate, eventTime, mode }: { eventDate?: string; eventTime?: string; mode?: 'preview' | 'public' }) {
  const [parts, setParts] = useState<ReturnType<typeof timeParts> | null>(null)

  useEffect(() => {
    const target = eventDate ? new Date(`${eventDate}T${eventTime || '00:00'}:00`) : null
    if (!target || Number.isNaN(target.getTime())) {
      setParts(null)
      return
    }
    setParts(timeParts(target)) // show numbers immediately, not after the first tick
    const id = setInterval(() => setParts(timeParts(target)), 1000)
    return () => clearInterval(id)
  }, [eventDate, eventTime])

  const values = parts
    ? [['Days', parts.days], ['Hours', parts.hours], ['Mins', parts.minutes], ['Secs', parts.seconds]] as [string, number][]
    : []

  return (
    <section className="px-5 py-16 sm:px-10 sm:py-24" style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)' }}>
      <Reveal mode={mode} className="mx-auto max-w-5xl">
        <h2 className={celebrationType.h2} style={{ fontFamily: 'var(--invite-heading-font)' }}>The countdown is on</h2>

        {!parts ? (
          <p className={`mt-6 ${celebrationType.body}`} style={{ fontFamily: 'var(--invite-body-font)' }}>
            The countdown starts once a date is set.
          </p>
        ) : parts.over ? (
          <p className={`mt-8 ${celebrationType.statement}`} style={{ fontFamily: 'var(--invite-heading-font)' }}>
            It's celebration time!
          </p>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
            {values.map(([label, value], i) => (
              <div
                key={label}
                className="rounded-3xl border-4 px-4 py-6 text-center sm:py-8"
                style={{
                  backgroundColor: TILES[i].bg,
                  color: TILES[i].fg,
                  borderColor: 'var(--invite-primary)',
                  boxShadow: '6px 6px 0 var(--invite-primary)',
                  transform: `rotate(${TILES[i].rot}deg)`,
                }}
              >
                <p className={celebrationType.number} style={{ fontFamily: 'var(--invite-heading-font)' }}>
                  {/* Changing the key restarts the tick-in animation on every change. */}
                  <span key={value} className="cel-tick">{String(value).padStart(2, '0')}</span>
                </p>
                <p className={`mt-2 ${celebrationType.caption}`} style={{ fontFamily: 'var(--invite-body-font)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}
      </Reveal>
    </section>
  )
}