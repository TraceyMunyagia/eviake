import type { InviteContent, InviteSections, InviteTokens } from '@/types/database'

// The single contract every template component implements. The builder's
// live preview and the public invite page both render templates through
// this exact prop shape — a template never reaches into anything else.
export type TemplateProps = {
  content: InviteContent
  tokens: InviteTokens
  sections: InviteSections
  mode?: 'preview' | 'public'
}