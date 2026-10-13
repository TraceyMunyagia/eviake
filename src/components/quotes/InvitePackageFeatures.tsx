import { PACKAGE_SECTIONS } from '@/lib/inviteDefaults'
import type { InvitePackage, InviteSections } from '@/types/database'

const LABELS: Record<keyof InviteSections, string> = {
  countdown: 'Countdown',
  schedule: 'Schedule',
  gallery: 'Gallery',
  video: 'Video',
  rsvp: 'RSVP',
  guestbook: 'Guestbook',
  guest_management: 'Guest pass & check-in',
  story: 'Story',
  dress_code: 'Dress code',
  rsvp_advanced: 'Advanced RSVP',
}

// The package decides which invite sections are switched on; the price is typed on the quote.
export function InvitePackageFeatures({ pkg }: { pkg: string }) {
  const sections = PACKAGE_SECTIONS[pkg.toLowerCase() as InvitePackage]
  if (!sections) return null
  const included = (Object.keys(LABELS) as (keyof InviteSections)[]).filter((k) => sections[k])

  return (
    <div className="mt-3 rounded-lg border border-line p-3 text-sm">
      <p className="mb-2 text-muted">{pkg} includes</p>
      <div className="flex flex-wrap gap-1.5">
        {included.map((k) => (
          <span key={k} className="rounded-full border border-line px-2.5 py-0.5 text-xs">{LABELS[k]}</span>
        ))}
      </div>
    </div>
  )
}
