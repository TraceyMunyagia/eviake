import type { InviteContent, InviteSections } from '@/types/database'

// Swap the image URLs for any photos you like; they're placeholders.
export const CELEBRATION_SAMPLE_CONTENT: InviteContent = {
  couple_names: "Zuri's 10th Birthday Bash",
  event_type: 'Birthday',
  event_date: '2027-04-17',
  event_time: '14:00',
  venue: 'Jungle Jamboree Play Park',
  address: '22 Ngong Road, Nairobi',
  parking_info: 'Free parking behind the main gate.',
  invitation_message:
    "Ten years of Zuri means one thing: it's time for the loudest, brightest, most sugar-fuelled party we can throw. Come ready to play!",
  invitation_signature: 'Love, Mum & Dad',
  hero_image_url: 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=1000',
  gallery_urls: [
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
    'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600',
  ],
  gallery_captions: ['Age 1', 'Age 4', 'Age 7', 'Age 9'],
  schedule: [
    { time: '2:00 PM', label: 'Doors open & face painting' },
    { time: '3:00 PM', label: 'Party games' },
    { time: '4:30 PM', label: 'Cake!' },
    { time: '5:30 PM', label: 'Home time' },
  ],
  dress_code: 'Bright & Playful',
  dress_code_note: 'Wear something you can run around in. The brighter the better.',
  dress_code_palette: ['#FF4D6D', '#FFD23F', '#2EC4B6', '#7B5CFF'],
  rsvp_deadline: '2027-04-01',
  rsvp_max_party: 5,
  rsvp_questions: [
    { id: 'q_diet', label: 'Any allergies we should know about?', type: 'text' },
    { id: 'q_pizza', label: 'Pizza topping', type: 'choice', options: ['Cheese', 'Veggie', 'Pepperoni'], required: true },
  ],
  closing_message: 'Thanks for helping make ten unforgettable!',
  hashtag: 'ZuriTurns10',
  social_links: [{ name: 'Instagram', url: 'https://instagram.com' }],
}

export const CELEBRATION_SAMPLE_SECTIONS: InviteSections = {
  countdown: true, schedule: true, gallery: true, video: false, rsvp: true, guestbook: false, guest_management: false,
}

// Deliberately awkward: very long name/venue, no hero image, one photo, a
// schedule flag with no schedule, a past RSVP deadline, an unlinked social
// button and a hashtag with a leading #. Exists purely for QA.
export const CELEBRATION_STRESS_CONTENT: InviteContent = {
  couple_names: 'Christopher Alexander Whitmore-Sinclair’s Extraordinarily Spectacular Fortieth Birthday Extravaganza',
  event_type: 'Milestone Birthday Celebration Weekend',
  event_date: '2027-12-31',
  event_time: '19:30',
  venue: 'The Grand Ballroom at the Historic Riverside Country Club and Botanical Gardens',
  address: '1 Very Long Street Name That Goes On For Quite A While, Off The Main Highway, Nakuru County',
  gallery_urls: ['https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600'],
  dress_code: 'Black Tie Optional But Strongly Encouraged For This Formal Evening Event',
  rsvp_deadline: '2025-01-01',
  rsvp_max_party: 1,
  hashtag: '#ChrisTurns40',
  social_links: [{ name: 'Instagram' }, { name: 'TikTok', url: 'https://tiktok.com' }],
}

export const CELEBRATION_STRESS_SECTIONS: InviteSections = {
  countdown: true, schedule: true, gallery: true, video: true, rsvp: true, guestbook: true, guest_management: true,
}