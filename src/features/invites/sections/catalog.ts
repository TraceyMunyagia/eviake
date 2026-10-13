export type TemplateKey = 'editorial' | 'romance' | 'celebration'
export type PackageKey = 'essential' | 'signature' | 'experience'
export type SectionKey =
  | 'hero' | 'message' | 'details' | 'countdown' | 'story' | 'schedule'
  | 'gallery' | 'dress_code' | 'location' | 'rsvp' | 'gift' | 'guestbook' | 'closing'

export const PACKAGE_RANK: Record<PackageKey, number> = { essential: 0, signature: 1, experience: 2 }
export const PACKAGE_LABEL: Record<PackageKey, string> = {
  essential: 'Essential', signature: 'Signature', experience: 'Experience',
}

export interface SectionDef {
  key: SectionKey
  label: string
  hint: string
  required?: boolean            // always on, cannot be unticked
  minPackage: PackageKey        // lowest package that unlocks it
  defaultOn?: boolean           // default for NEW invites (true if omitted)
  legacyAlwaysOn?: boolean      // old invites without this flag showed it, so read missing as on
}

const d = (
  key: SectionKey, label: string, hint: string,
  minPackage: PackageKey = 'essential', extra: Partial<SectionDef> = {},
): SectionDef => ({ key, label, hint, minPackage, ...extra })

// The order below is the render order of each template (fixed). ⚠ check it against the components.
export const CATALOG: Record<TemplateKey, SectionDef[]> = {
  editorial: [
    d('hero', 'Hero', 'Full-screen opening with title, hosts and date.', 'essential', { required: true }),
    d('message', 'Invitation message', 'Short personal invitation with an optional pull quote.', 'essential', { legacyAlwaysOn: true }),
    d('details', 'Event details', 'Date, time, venue and calendar button.', 'essential', { required: true }),
    d('countdown', 'Countdown', 'Days, hours, minutes and seconds to the event.', 'signature'),
    d('story', 'About / Story', 'Split-screen story with one or two photos.', 'signature'),
    d('schedule', 'Programme', 'Timeline of the day.', 'signature'),
    d('gallery', 'Gallery', 'Masonry photo gallery with full-screen viewer.', 'signature'),
    d('dress_code', 'Dress code', 'Guidance and colour chips.', 'signature'),
    d('location', 'Location', 'Venue, map and directions.', 'essential', { legacyAlwaysOn: true }),
    d('rsvp', 'RSVP', 'Guests confirm attendance.'),
    d('closing', 'Closing', 'Thank-you message and sign-off.', 'essential', { legacyAlwaysOn: true }),
  ],
  romance: [
    d('hero', 'Cover & hero', 'Tap-to-open cover, names and date.', 'essential', { required: true }),
    d('message', 'Welcome message', 'Personal message with an optional quote.', 'essential', { legacyAlwaysOn: true }),
    d('story', 'Our story', 'Photo timeline of the couple or event story.', 'signature'),
    d('countdown', 'Countdown', 'Soft countdown circles.', 'signature'),
    d('details', 'Event details', 'Date, time, venue and calendar button.', 'essential', { required: true }),
    d('gallery', 'Gallery', 'Polaroid-style gallery with lightbox.', 'signature'),
    d('schedule', 'Programme', 'Ceremony and reception timeline.', 'signature'),
    d('dress_code', 'Dress code', 'Dress code with colour swatches.', 'signature'),
    d('location', 'Venue & location', 'Venue photo, map and directions.', 'essential', { legacyAlwaysOn: true }),
    d('rsvp', 'RSVP', 'Guests confirm attendance.'),
    d('gift', 'Gift / Registry', 'Gift message and registry links.', 'signature', { defaultOn: false, legacyAlwaysOn: true }),
    d('guestbook', 'Guestbook', 'Guests leave messages (you approve them).', 'signature'),
    d('closing', 'Closing', 'Thank-you and closing photo.', 'essential', { legacyAlwaysOn: true }),
  ],
  celebration: [
    d('hero', 'Animated hero', 'Bold title, shapes and optional video.', 'essential', { required: true }),
    d('message', 'Event introduction', 'Short description or host message.', 'essential', { legacyAlwaysOn: true }),
    d('details', 'Event details', 'Date, time and venue tiles.', 'essential', { required: true }),
    d('countdown', 'Countdown', 'Large animated numbers.', 'signature'),
    d('gallery', 'Gallery', 'Horizontal snap-scrolling gallery.', 'signature'),
    d('schedule', 'Programme', 'Tap-to-highlight timeline.', 'signature'),
    d('dress_code', 'Dress code', 'Colour swatches with hex codes.', 'signature'),
    d('location', 'Location', 'Venue card, map and directions.', 'essential', { legacyAlwaysOn: true }),
    d('rsvp', 'RSVP', 'Interactive RSVP.'),
    d('closing', 'Closing', 'Marquee, confetti and sign-off.', 'essential', { legacyAlwaysOn: true }),
  ],
}