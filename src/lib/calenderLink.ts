import type { InviteContent } from '@/types/database'

function toGoogleDate(date?: string, time?: string) {
  if (!date) return ''
  const dt = new Date(`${date}T${time || '00:00'}:00`)
  return dt.toISOString().replace(/[-:]|\.\d{3}/g, '')
}

export function buildGoogleCalendarUrl(content: InviteContent) {
  const title = content.couple_names || content.event_name || 'Event'
  const start = toGoogleDate(content.event_date, content.event_time)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: start ? `${start}/${start}` : '',
    location: [content.venue, content.address].filter(Boolean).join(', '),
    details: content.description || '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}