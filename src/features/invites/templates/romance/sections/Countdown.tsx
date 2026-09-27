import { useEffect, useState } from 'react'
import { romanceType } from '@/features/invites/templates/romance/type'
import { Divider } from '@/features/invites/templates/romance/components/Divider'
import { SectionLabel } from '@/features/invites/templates/romance/components/SectionLabel'
import { Reveal } from '@/features/invites/templates/romance/components/Reveal'

function timeParts(target: Date) {
  const diff = Math.max(target.getTime() - Date.now(), 0)
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff / 3_600_000) % 24),
    minutes: Math.floor((diff / 60_000) % 60),
    seconds: Math.floor((diff / 1_000) % 60),
  }
}

export function Countdown({ eventDate, eventTime, mode }: { eventDate?: string; eventTime?: string; mode?: 'preview' | 'public' }) {
  const target = eventDate ? new Date(`${eventDate}T${eventTime || '00:00'}:00`) : null
  const [parts, setParts] = useState(target ? timeParts(target) : null)

  useEffect(() => {
    if (!target) return
    const id = setInterval(() => setParts(timeParts(target)), 1000)
    return () => clearInterval(id)
  }, [eventDate, eventTime])

  return (
    <Reveal mode={mode}>
      <section className="px-6 py-16 text-center sm:py-24" style={{ color: 'var(--invite-primary)' }}>
        <SectionLabel>Counting down to forever</SectionLabel>
        <Divider className="my-6" />
        {!target || !parts ? (
          <p className={romanceType.body} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>
            Our countdown begins once a date is set.
          </p>
        ) : (
          <div className="mx-auto flex max-w-sm flex-wrap justify-center gap-4 sm:gap-6">
            {([['Days', parts.days], ['Hours', parts.hours], ['Min', parts.minutes], ['Sec', parts.seconds]] as [string, number][]).map(([label, value]) => (
              <div key={label} className="flex size-20 flex-col items-center justify-center rounded-full border sm:size-24" style={{ borderColor: 'var(--invite-hairline)', backgroundColor: 'var(--invite-surface)' }}>
                <p className="text-xl sm:text-2xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>{String(value).padStart(2, '0')}</p>
                <p className={`${romanceType.caption} uppercase tracking-widest`} style={{ color: 'var(--invite-muted)', fontFamily: 'var(--invite-body-font)' }}>{label}</p>
              </div>
            ))}
          </div>
        )}
      </section>
    </Reveal>
  )
}