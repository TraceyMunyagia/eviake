// Links are built on the public app URL so copies made from localhost still point at the live site
function base() {
  const url = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) || window.location.origin
  return url.replace(/\/$/, '')
}

export function publicInviteUrl(slug: string) {
  return `${base()}/invite/${slug}`
}

export function rsvpTrackUrl(token: string) {
  return `${base()}/rsvp-track/${token}`
}
