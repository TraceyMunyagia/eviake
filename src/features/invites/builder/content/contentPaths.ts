// Where each builder field lives in invites.content. Fix names HERE and nowhere else.
// Existing keys are the flat ones the templates already read; the last few are new in Week 23.
export const P = {
  title: 'event_name',
  names: 'couple_names',
  eventType: 'event_type',
  date: 'event_date',
  time: 'event_time',
  heroImage: 'hero_image_url',
  heroAlt: 'hero_image_alt',

  message: 'invitation_message',
  quote: 'welcome_quote',
  signoff: 'invitation_signature',

  countdownSeconds: 'countdown_show_seconds',
  countdownDone: 'countdown_finished_message',

  venueName: 'venue',
  venueAddress: 'address',
  mapUrl: 'maps_url',
  venueNotes: 'parking_info',
  venuePhoto: 'venue_image_url',

  dressTitle: 'dress_code',
  dressBody: 'dress_code_note',
  dressColours: 'dress_code_palette',
  dressImages: 'dress_code_image_urls',

  gallery: 'gallery_urls',
  galleryCaptions: 'gallery_captions', // index-aligned with gallery_urls
  galleryAlts: 'gallery_alts', // index-aligned with gallery_urls
  schedule: 'schedule',
  story: 'story_items', // Romance timeline
  aboutTitle: 'about_title', // Editorial About / Story
  aboutText: 'about_text',
  aboutImage: 'about_image_url',
  aboutImage2: 'about_image_url_2',
  registry: 'registries',
  giftMessage: 'gift_message',

  closingMessage: 'closing_message',
  closingImage: 'closing_image_url',
  hashtag: 'hashtag',
  marquee: 'marquee_text',
  socialLinks: 'social_links',

  logo: 'logo_url',
  heroVideo: 'hero_video_url',
  music: 'music_url',

  coverEnabled: 'cover_enabled',
  coverInitials: 'cover_initials',
  coverLine: 'cover_line',
  coverHint: 'cover_hint',
} as const
