import type { InviteContent, InviteSections } from '@/types/database'

export const EDITORIAL_SAMPLE_CONTENT: InviteContent = {
  couple_names: 'Amara & Jomo',
  event_date: '2027-03-20',
  event_time: '16:00',
  venue: 'The Hartley Estate',
  address: '14 Riverside Lane, Karen, Nairobi',
  event_type: 'Wedding',
  invitation_message: 'Together with their families, Amara & Jomo joyfully invite you to celebrate the beginning of their forever.',
  invitation_signature: 'The Njoroge & Mbeki families',
  about_title: 'How it began',
  about_text: 'A chance introduction at a mutual friend\'s wedding, three years of long-distance calls, and one very nervous proposal on a Lamu beach at sunset.',
  about_image_url: 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=900',
  about_image_url_2: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=400',
  dress_code_note: 'We\'d love to see the garden in bloom — soft, garden-party colours are welcome. No white, please.',
  dress_code_palette: ['#F4E7D3', '#C9A66B', '#6B7D5B', '#A65D57'], 
  parking_info: 'Free valet parking available at the main entrance.',
  description: 'Kindly let us know if you\'ll be joining us, and for how many.',
  closing_message: 'Every love story is beautiful, but ours is our favourite.',
  hero_image_url: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1200',
  gallery_urls: [
    'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600',
    'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600',
    'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600',
  ],
  schedule: [
    { time: '4:00 PM', label: 'Ceremony begins' },
    { time: '5:30 PM', label: 'Cocktail hour' },
    { time: '7:00 PM', label: 'Reception & dinner' },
    { time: '9:00 PM', label: 'Dancing' },
  ],
}

export const EDITORIAL_SAMPLE_SECTIONS: InviteSections = {
  countdown: true, schedule: true, gallery: true, video: false, rsvp: true, guestbook: false, guest_management: false,
}