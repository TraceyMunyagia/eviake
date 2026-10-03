import type { GuestbookMessage, InviteContent, InviteSections, InviteTokens } from '@/types/database'

export type RsvpPayload = {
  name: string
  phone: string
  attending: boolean
  party_size: number
  answers: Record<string, string>
}
export type GuestbookPayload = { name: string; message: string }
export type RsvpResult = { guestId: string; checkInToken: string | null }

export type TemplateProps = {
  content: InviteContent
  tokens: InviteTokens
  sections: InviteSections
  mode?: 'preview' | 'public'
  onRsvp?: (payload: RsvpPayload) => Promise<RsvpResult | void>
  guestbookMessages?: GuestbookMessage[]
  onGuestbookSubmit?: (payload: GuestbookPayload) => Promise<void>
  guestbookAvailable?: boolean
  checkInToken?: string | null
  checkInAvailable?: boolean
}
