import type { InvitePackage, InviteSections, InviteTemplateKey, InviteTokens } from '@/types/database'
import { TEMPLATE_FONT_DEFAULTS } from '@/features/invites/design/fontRegistry'

// Package controls which sections are available at all — not which template.
// Verified against the completed Editorial, Romance, and Celebration templates:
// Essential intentionally excludes gallery, schedule, video, and guestbook;
// those are enhancement sections rather than core identity sections.
// guest_management is Experience-only by design and currently has no template
// consumer; it is reserved for the future Guest Pass/Check-in flow
export const PACKAGE_SECTIONS: Record<InvitePackage, InviteSections> = {
  essential: {
    countdown: false, schedule: false, gallery: false, video: false,
    rsvp: true, guestbook: false, guest_management: false,
    story: false, dress_code: false, rsvp_advanced: false,
  },
  signature: {
    countdown: true, schedule: true, gallery: true, video: false,
    rsvp: true, guestbook: true, guest_management: false,
    story: true, dress_code: true, rsvp_advanced: true,
  },
  experience: {
    countdown: true, schedule: true, gallery: true, video: true,
    rsvp: true, guestbook: true, guest_management: true,
    story: true, dress_code: true, rsvp_advanced: true,
  },
}

// Starting palette and fonts for new invites. Existing invites keep their saved tokens.
export const TEMPLATE_DEFAULT_TOKENS: Record<InviteTemplateKey, InviteTokens> = {
  editorial: {
    primary: '#231F1D',        // near-black charcoal ink, not pure black — softer on ivory
    accent: '#B99457',         // muted champagne gold, used sparingly per spec
    background: '#F7F3EC',     // ivory
    ...TEMPLATE_FONT_DEFAULTS.editorial,
  },
  romance: {
    primary: '#6B3F45',        // dusty rose ink — soft but still readable
    accent: '#E8B4BC',         // blush pink
    background: '#FFF6F3',     // soft ivory-blush
    ...TEMPLATE_FONT_DEFAULTS.romance,
  },
    celebration: {
    primary: '#1A1033',    // deep indigo — used as a full colour block, not just text
    accent: '#FF4D6D',     // hot coral
    secondary: '#FFD23F',  // sunny yellow
    background: '#FFF8EC', // warm cream
    ...TEMPLATE_FONT_DEFAULTS.celebration,
  },
}

export function buildInviteDefaults(template: InviteTemplateKey, pkg: InvitePackage) {
  return {
    tokens: TEMPLATE_DEFAULT_TOKENS[template],
    sections: PACKAGE_SECTIONS[pkg],
  }
}
