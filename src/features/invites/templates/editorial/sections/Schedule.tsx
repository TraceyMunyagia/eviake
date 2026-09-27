import type { InviteContent } from '@/types/database'

export function Schedule({ items }: { items?: InviteContent['schedule'] }) {
  if (!items || items.length === 0) {
    return (
      <section className="px-6 py-12 text-center" style={{ color: 'var(--invite-primary)' }}>
        <p className="text-sm opacity-70" style={{ fontFamily: 'var(--invite-body-font)' }}>Schedule to be announced.</p>
      </section>
    )
  }
  return (
    <section className="mx-auto max-w-md px-6 py-12" style={{ color: 'var(--invite-primary)' }}>
      <h2 className="mb-6 text-center text-2xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>Schedule</h2>
      <ul className="space-y-4" style={{ fontFamily: 'var(--invite-body-font)' }}>
        {items.map((item, i) => (
          <li key={i} className="flex items-baseline gap-4 border-b pb-3" style={{ borderColor: 'var(--invite-accent)' }}>
            <span className="w-20 shrink-0 text-sm font-medium">{item.time}</span>
            <span className="text-sm">{item.label}</span>
          </li>
        ))}
      </ul>
    </section>
  )
}