export function parseEventDate(date?: string) {
  if (!date) return null
  const d = new Date(`${date}T00:00:00`)
  return Number.isNaN(d.getTime()) ? null : d
}

export function formatEventDate(date?: string) {
  const d = parseEventDate(date)
  return d ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : ''
}

export function formatEventTime(time?: string) {
  if (!time) return ''
  const [h, m] = time.split(':').map(Number)
  if (Number.isNaN(h) || Number.isNaN(m)) return time
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
}