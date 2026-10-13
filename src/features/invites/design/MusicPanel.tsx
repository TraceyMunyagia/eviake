import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { inputClass } from '@/components/ui/Field'
import { MediaInput } from '../builder/fields/MediaInput'
import { P } from '../builder/content/contentPaths'
import { usePanel } from '../builder/content/PanelContext'
import { formatTime, musicSegment, parseSpotifyTrack } from '../music/music'
import { useSpotifySegment } from '../music/useSpotifySegment'
import { ClipPicker } from './ClipPicker'

type Clip = { start: number; end: number | null }

/** Background music: an uploaded song or a Spotify track, and which part of it plays (Instagram-style picker). */
export function MusicPanel() {
  const { invite, updateInvite } = usePanel()
  const c = invite.content
  const source = c.music_source ?? 'file'
  const clip = musicSegment(c)
  const set = (patch: Partial<typeof c>) => updateInvite((current) => ({ content: { ...current.content, ...patch } }))
  const trackId = parseSpotifyTrack(c.music_spotify_url)
  const [length, setLength] = useState<number | null>(null) // song length in seconds, once known
  const [position, setPosition] = useState<number | null>(null)

  const picker = (seed: string) => (
    <ClipPicker
      seed={seed}
      length={length}
      start={clip.start}
      duration={c.music_duration ?? null}
      position={position}
      onStart={(s) => set({ music_start: s })}
      onDuration={(d) => set(d === null ? { music_duration: undefined, music_start: 0 } : { music_duration: d, music_start: length !== null ? Math.min(clip.start, Math.max(length - d, 0)) : clip.start })}
    />
  )

  return (
    <div className="space-y-4">
      <div role="radiogroup" aria-label="Music source" className="flex gap-2 text-sm">
        {([['file', 'Upload a song'], ['spotify', 'Spotify link']] as const).map(([key, label]) => (
          <button key={key} type="button" role="radio" aria-checked={source === key} onClick={() => { set({ music_source: key }); setLength(null); setPosition(null) }}
            className={source === key ? 'rounded-lg border border-gold-500 bg-gold-100 px-3 py-1.5 font-medium text-plum-900' : 'rounded-lg border border-line bg-white px-3 py-1.5 text-muted hover:text-ink'}>
            {label}
          </button>
        ))}
      </div>

      {source === 'file' ? (
        <MediaInput path={P.music} kind="audio" label="Song file" slot="music" hint="MP3, M4A, AAC, OGG or WAV. It starts when the invite opens where the browser allows; guests can always pause or play." />
      ) : (
        <div>
          <label htmlFor="music-spotify" className="block text-sm font-medium">Spotify song link</label>
          <input id="music-spotify" type="url" value={c.music_spotify_url ?? ''} placeholder="https://open.spotify.com/track/…" onChange={(e) => set({ music_spotify_url: e.target.value })} className={inputClass} />
          {c.music_spotify_url?.trim() && !trackId && (
            <p role="alert" className="mt-1 text-xs text-red-700">Paste a link to a single song (open.spotify.com/track/…). Albums and playlists can't be trimmed.</p>
          )}
          <p className="mt-1 text-xs text-muted">
            In Spotify: ⋯ → Share → Copy song link. Guests tap the music button to start it (Spotify never autoplays), and guests who
            aren't logged into Spotify hear Spotify's 30-second preview instead of your chosen part.
          </p>
        </div>
      )}

      {source === 'file' && c.music_url && (
        <div className="space-y-3 rounded-xl border border-line bg-white p-3">
          <p className="text-sm font-medium">Choose the part that plays</p>
          {picker(c.music_url)}
          <FilePreview url={c.music_url} clip={clip} onLength={setLength} onPosition={setPosition} />
        </div>
      )}

      {source === 'spotify' && trackId && (
        <div className="space-y-3 rounded-xl border border-line bg-white p-3">
          <p className="text-sm font-medium">Choose the part that plays</p>
          {picker(trackId)}
          <SpotifyPreview key={trackId} trackId={trackId} clip={clip} onLength={setLength} onPosition={setPosition} />
        </div>
      )}
    </div>
  )
}

/** Plays the chosen part on a loop; moving the clip while playing jumps to the new start. */
function FilePreview({ url, clip, onLength, onPosition }: { url: string; clip: Clip; onLength: (s: number) => void; onPosition: (s: number | null) => void }) {
  const audio = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const a = audio.current
    if (a && !a.paused) a.currentTime = clip.start
  }, [clip.start])

  function toggle() {
    const a = audio.current
    if (!a) return
    if (a.paused) { a.currentTime = clip.start; void a.play() } else a.pause()
  }

  return (
    <div className="flex items-center justify-center">
      <audio
        ref={audio} src={url} preload="metadata"
        onLoadedMetadata={(e) => onLength(e.currentTarget.duration)}
        onTimeUpdate={(e) => {
          const a = e.currentTarget
          if (clip.end !== null && a.currentTime >= clip.end) a.currentTime = clip.start
          onPosition(a.paused ? null : a.currentTime)
        }}
        onEnded={(e) => { e.currentTarget.currentTime = clip.start; void e.currentTarget.play() }}
        onPlay={() => setPlaying(true)}
        onPause={() => { setPlaying(false); onPosition(null) }}
      />
      <button type="button" onClick={toggle} aria-label={playing ? 'Stop preview' : 'Play the chosen part'}
        className="grid size-11 place-items-center rounded-full bg-plum-900 text-white shadow hover:bg-plum-800">
        {playing ? <Pause className="size-5" /> : <Play className="ml-0.5 size-5" />}
      </button>
    </div>
  )
}

/** Spotify's own player (it has to stay visible), kept to the chosen part. */
function SpotifyPreview({ trackId, clip, onLength, onPosition }: { trackId: string; clip: Clip; onLength: (s: number) => void; onPosition: (s: number | null) => void }) {
  const host = useRef<HTMLDivElement>(null)
  const { playback, error } = useSpotifySegment(host, trackId, clip.start, clip.end)
  const duration = playback?.duration ?? 0
  const preview = duration > 0 && duration <= 31000

  useEffect(() => { if (duration) onLength(duration / 1000) }, [duration, onLength])
  useEffect(() => { onPosition(playback && !playback.isPaused ? playback.position / 1000 : null) }, [playback, onPosition])

  return (
    <div className="space-y-1">
      <div ref={host} className="min-h-20 overflow-hidden rounded-lg" />
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
      <p className="text-xs text-muted">
        {preview
          ? `Spotify is playing its ${formatTime(duration / 1000)} preview because you're not logged into Spotify in this browser, so you can only pick within the preview here. Log in at open.spotify.com to pick from the whole song.`
          : duration ? 'Press play to hear the chosen part.' : 'Press play once to load the song length, then drag to choose the part.'}
      </p>
    </div>
  )
}
