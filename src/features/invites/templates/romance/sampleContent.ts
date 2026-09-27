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
  story_items: [
    { title: 'A moment with no date or photo set — testing the sparsest possible entry' },
  ],
  registries: [{ name: 'A registry with no link at all' }],
  dress_code: 'Garden Formal — Soft Pastels Strongly Preferred, No Bold Patterns Please',
}

export const ROMANCE_SAMPLE_SECTIONS: InviteSections = {
    countdown: true, schedule: true, gallery: true, video: true, rsvp: true, guestbook: true, guest_management: true,

}

export const ROMANCE_STRESS_CONTENT: InviteContent = {
  couple_names: 'Wanjiku Njeri Kamau & Christopher Alexander Mwangi-Smith the Third',
  event_date: '2027-12-31',
  event_time: '19:30',
  venue: 'The Rosewood Conservatory and Grand Garden Pavilion at the Hillside Estate',
  address: '14 Extremely Long Garden Lane, off Limuru Road, Tigoni, Kiambu County, Nairobi',
  event_type: 'New Year’s Eve Wedding Celebration',
  description: 'We are so excited to welcome you for an evening of dinner, dancing, and a midnight toast as we begin this next chapter together.',
  invitation_message: 'With the greatest joy and a very full heart, Wanjiku and Christopher invite you to celebrate their wedding and the beginning of a lifetime together.',
  invitation_signature: 'With love, the Kamau, Mwangi, and Smith families',
  welcome_quote: 'A long name, a long story, and a lifetime still ahead of us.',
  closing_message: 'Thank you for making this extraordinary evening even more memorable.',
  hero_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
  gallery_urls: [
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
  ],
  gift_message: 'Your presence is the greatest gift. For those who have asked, a small registry is available below.',
  registries: [
    { name: 'The very long registry name for testing layout', url: 'https://example.com/registry' },
    { name: 'A registry without a link' },
  ],
  dress_code: 'Formal evening wear with festive New Year’s Eve accents and comfortable dancing shoes encouraged',
  venue_image_url: 'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=900',
}

export const ROMANCE_STRESS_SECTIONS: InviteSections = {
  countdown: true,
  schedule: false,
  gallery: true,
  video: false,
  rsvp: true,
  guestbook: false,
  guest_management: false,
}
