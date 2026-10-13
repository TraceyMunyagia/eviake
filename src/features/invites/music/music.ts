import type { InviteContent } from '@/types/database'

/** open.spotify.com/track/ID (any locale prefix, any ?si=) or spotify:track:ID -> ID. Albums and playlists aren't supported. */
export function parseSpotifyTrack(input: string | undefined): string | null {
  const s = (input ?? '').trim()
  const m = s.match(/^spotify:track:([A-Za-z0-9]{22})$/) ?? s.match(/open\.spotify\.com\/(?:intl-[a-z-]+\/)?(?:embed\/)?track\/([A-Za-z0-9]{22})/)
  return m ? m[1] : null
}

export type MusicSource = { kind: 'file'; url: string } | { kind: 'spotify'; trackId: string }

/** Which music this invite plays, if any. Older invites without music_source use the uploaded file. */
export function musicSource(content: InviteContent): MusicSource | null {
  if (content.music_source === 'spotify') {
    const trackId = parseSpotifyTrack(content.music_spotify_url)
    return trackId ? { kind: 'spotify', trackId } : null
  }
  return content.music_url ? { kind: 'file', url: content.music_url } : null
}

/** The part of the song to play, in seconds. end is null for "to the end of the song". */
export function musicSegment(content: InviteContent): { start: number; end: number | null } {
  const start = Math.max(0, Number(content.music_start) || 0)
  const duration = Number(content.music_duration) || 0
  return { start, end: duration > 0 ? start + duration : null }
}

export const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

/** "1:23" or "83" -> 83. Anything else -> null. */
export function parseTime(text: string): number | null {
  const t = text.trim()
  if (/^\d+$/.test(t)) return Number(t)
  const m = t.match(/^(\d+):([0-5]?\d)$/)
  return m ? Number(m[1]) * 60 + Number(m[2]) : null
}
