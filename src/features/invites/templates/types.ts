import type { InviteContent, InviteSections, InviteTokens } from '@/types/database'

export type RsvpPayload = {
  name: string
  attending: boolean
  party_size: number
  answers: Record<string, string>
}

export type TemplateProps = {
  content: InviteContent
  tokens: InviteTokens
  sections: InviteSections
  mode?: 'preview' | 'public'
  // Supplied by the public page once RSVP submission exists. When it's
  // absent, a template must never pretend to record a response.
  onRsvp?: (payload: RsvpPayload) => Promise<void>
}