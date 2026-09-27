import type { InviteContent, InviteSections } from '@/types/database'

export const ROMANCE_SAMPLE_CONTENT: InviteContent = {
  couple_names: 'Wanjiku & Kevin',
  event_date: '2027-02-14',
  event_time: '15:00',
  venue: 'Rosewood Gardens',
  address: 'Tigoni Road, Limuru',
  event_type: 'Wedding',
  description: 'We can\'t wait to celebrate with you — please let us know by the date below.',
  invitation_message: 'With hearts full of joy, Wanjiku & Kevin warmly welcome you to their wedding.',
  invitation_signature: 'With love, the Kamau & Otieno families',
  welcome_quote: 'Whatever our souls are made of, his and mine are the same.',
  closing_message: 'With all our love, thank you for being part of our story.',
  hero_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
  gallery_urls: [
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=500',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=500',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=500',
  ],
}

export const ROMANCE_SAMPLE_SECTIONS: InviteSections = {
  countdown: true, schedule: false, gallery: true, video: false, rsvp: true, guestbook: false, guest_management: false,
}