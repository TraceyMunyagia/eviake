import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { getTemplateComponent } from '@/features/invites/templates/registry'
import type { RsvpPayload, RsvpResult } from '@/features/invites/templates/types'
import type { GuestbookMessage, Invite } from '@/types/database'

type PublicInviteData = Pick<Invite, 'template' | 'package' | 'content' | 'tokens' | 'sections' | 'status'>
export function PublicInvitePage() {
  const { slug } = useParams()
  const [data, setData] = useState<PublicInviteData | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')
  const [guestbookMessages, setGuestbookMessages] = useState<GuestbookMessage[]>([])
  const [checkInToken, setCheckInToken] = useState<string | null>(null)

  function isEventDay(eventDate?: string) {
    if (!eventDate) return false
    const nairobiDate = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Africa/Nairobi',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
    return eventDate.slice(0, 10) === nairobiDate
  }

  useEffect(() => {
    if (!slug) return
    supabase.rpc('get_public_invite', { p_slug: slug }).then(({ data, error }) => {
      if (error || !data) return setState('missing')
      setData(data as PublicInviteData)
      setState('ready')
    })
    setCheckInToken(window.localStorage.getItem(`evia-check-in:${slug}`))
  }, [slug])

  useEffect(() => {
    if (!slug || state !== 'ready') return
    supabase.rpc('get_approved_guestbook_messages', { p_slug: slug }).then(({ data }) => {
      if (data) setGuestbookMessages(data as GuestbookMessage[])
    })
  }, [slug, state])

  useEffect(() => {
    if (data) {
      document.title = (data.content.couple_names || data.content.event_name || 'Invitation') as string
    }
  }, [data])

  async function onRsvp(payload: RsvpPayload): Promise<RsvpResult | void> {
    if (!slug) throw new Error('Missing invite link.')
    const { data, error } = await supabase.rpc('submit_public_rsvp', {
      p_slug: slug,
      p_name: payload.name,
      p_phone: payload.phone,
      p_attending: payload.attending,
      p_party_size: payload.party_size,
      p_answers: payload.answers,
    })
    if (error) throw new Error(error.message)
    const token = data?.check_in_token ?? null
    if (token && slug) {
      window.localStorage.setItem(`evia-check-in:${slug}`, token)
      setCheckInToken(token)
    }
    return { guestId: data?.guest_id ?? '', checkInToken: token }
  }

  async function onGuestbookSubmit(payload: { name: string; message: string }) {
    if (!slug) throw new Error('Missing invite link.')
    const { error } = await supabase.rpc('submit_guestbook_message', {
      p_slug: slug,
      p_name: payload.name,
      p_message: payload.message,
    })
    if (error) throw new Error(error.message)
    setGuestbookMessages((current) => [
      { guest_name: payload.name, message: payload.message, created_at: new Date().toISOString() },
      ...current,
    ])
  }

  if (state === 'loading') return <p className="p-10 text-center text-sm text-muted">Loading…</p>
  if (state === 'missing' || !data) return <p className="p-10 text-center text-sm text-muted">This invitation could not be found.</p>

  const Template = getTemplateComponent(data.template)
  if (!Template) return <p className="p-10 text-center text-sm text-muted">This invitation's design isn't available yet.</p>

  return (
    <Template
      content={data.content}
      tokens={data.tokens}
      sections={data.sections}
      mode="public"
      onRsvp={onRsvp}
      guestbookMessages={guestbookMessages}
      onGuestbookSubmit={onGuestbookSubmit}
      guestbookAvailable={isEventDay(data.content.event_date)}
      checkInToken={checkInToken}
      checkInAvailable={isEventDay(data.content.event_date)}
    />
  )
}
