import type { InvitePackage, InviteSections, InviteTemplateKey, InviteTokens } from '@/types/database'

// Package controls which sections are available at all — not which template.
// All 3 templates support the full feature set; this is the single gating table.
export const PACKAGE_SECTIONS: Record<InvitePackage, InviteSections> = {
  essential: {
    countdown: false, schedule: false, gallery: false, video: false,
    rsvp: true, guestbook: false, guest_management: false,
  },
  signature: {
    countdown: true, schedule: true, gallery: true, video: false,
    rsvp: true, guestbook: false, guest_management: false,
  },
  experience: {
    countdown: true, schedule: true, gallery: true, video: true,
    rsvp: true, guestbook: true, guest_management: true,
  },
}

// Placeholder palettes until the Figma templates land, so a freshly created
// invite looks intentional rather than blank. Swap these once real tokens exist.
export const TEMPLATE_DEFAULT_TOKENS: Record<InviteTemplateKey, InviteTokens> = {
  editorial: {
    primary: '#231F1D',        // near-black charcoal ink, not pure black — softer on ivory
    accent: '#B99457',         // muted champagne gold, used sparingly per spec
    background: '#F7F3EC',     // ivory
    heading_font: 'Cormorant Garamond',
    body_font: 'Inter',
  },
  romance: {
    primary: '#6B3F45',        // dusty rose ink — soft but still readable
    accent: '#E8B4BC',         // blush pink
    background: '#FFF6F3',     // soft ivory-blush
    heading_font: 'Playfair Display',
    body_font: 'Lora',
    accent_font: 'Parisienne',
  },
    celebration: {
    primary: '#1A1033',    // deep indigo — used as a full colour block, not just text
    accent: '#FF4D6D',     // hot coral
    secondary: '#FFD23F',  // sunny yellow
    background: '#FFF8EC', // warm cream
    heading_font: 'Bricolage Grotesque',
    body_font: 'DM Sans',
    accent_font: 'Caveat',
  },
}

export function buildInviteDefaults(template: InviteTemplateKey, pkg: InvitePackage) {
  return {
    tokens: TEMPLATE_DEFAULT_TOKENS[template],
    sections: PACKAGE_SECTIONS[pkg],
  }
}