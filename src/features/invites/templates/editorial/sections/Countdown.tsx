import { useEffect, useState } from 'react'

function timeParts(target: Date) {
  const diff = Math.max(target.getTime() - Date.now(), 0)
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  }
}

export function Countdown({ eventDate, eventTime }: { eventDate?: string; eventTime?: string }) {
  const target = eventDate ? new Date(`${eventDate}T${eventTime || '00:00'}:00`) : null
  const [parts, setParts] = useState(target ? timeParts(target) : null)

  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setParts(timeParts(target)), 1000)
    return () => clearInterval(id)
  }, [eventDate, eventTime])

  if (!target || !parts) {
    return (
      <section className="px-6 py-12 text-center" style={{ color: 'var(--invite-primary)' }}>
        <p className="text-sm opacity-70" style={{ fontFamily: 'var(--invite-body-font)' }}>
          Countdown starts once a date is set.
        </p>
      </section>
    )
  }

  return (
    <section className="px-6 py-12 text-center" style={{ color: 'var(--invite-primary)' }}>
      <div className="mx-auto grid max-w-xs grid-cols-4 gap-2 sm:max-w-sm sm:gap-3">
        {([['Days', parts.days], ['Hrs', parts.hours], ['Min', parts.minutes], ['Sec', parts.seconds]] as [string, number][]).map(([label, value]) => (
          <div key={label}>
            <p className="text-xl font-medium sm:text-2xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>
              {String(value).padStart(2, '0')}
            </p>
            <p className="text-xs uppercase tracking-wide opacity-70" style={{ fontFamily: 'var(--invite-body-font)' }}>{label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
