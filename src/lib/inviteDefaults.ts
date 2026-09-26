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
  editorial:   { primary: '#2B1530', accent: '#C7A046', background: '#FBF7F0', heading_font: 'Cormorant Garamond', body_font: 'Inter' },
  romance:     { primary: '#7A4356', accent: '#E8B4BC', background: '#FFF7F5', heading_font: 'Playfair Display', body_font: 'Lora' },
  celebration: { primary: '#1F3A5F', accent: '#F2994A', background: '#FFFDF7', heading_font: 'Poppins', body_font: 'Inter' },
}

export function buildInviteDefaults(template: InviteTemplateKey, pkg: InvitePackage) {
  return {
    tokens: TEMPLATE_DEFAULT_TOKENS[template],
    sections: PACKAGE_SECTIONS[pkg],
  }
}