import { useEffect, useRef, useState } from 'react'
import { Music2, Volume2, VolumeX, X } from 'lucide-react'
import type { InviteContent } from '@/types/database'
import { musicSegment, musicSource } from '@/features/invites/music/music'
import { useSpotifySegment } from '@/features/invites/music/useSpotifySegment'

const buttonStyle = { backgroundColor: 'var(--invite-primary)', color: 'var(--invite-background)', borderColor: 'var(--invite-accent)' }
const buttonClass = 'fixed right-5 z-[60] flex size-12 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-105'

export function MusicPlayer({ content }: { content: InviteContent }) {
  const source = musicSource(content)
  const { start, end } = musicSegment(content)
  if (!source) return null
  return source.kind === 'spotify'
    ? <SpotifyMusic trackId={source.trackId} start={start} end={end} />
    : <FileMusic url={source.url} start={start} end={end} />
}

function Badge() {
  return <Music2 className="absolute -right-1 -top-1 size-4 rounded-full p-0.5" style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)' }} />
}

/** Uploaded song: plays the chosen part on a loop. */
function FileMusic({ url, start, end }: { url: string; start: number; end: number | null }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const toStart = () => { audio.currentTime = start }
    if (audio.readyState >= 1) toStart()
    else audio.addEventListener('loadedmetadata', toStart, { once: true })
    // Browsers commonly block autoplay, so the button stays the reliable way for a guest to start it
    void audio.play().then(() => setPlaying(true)).catch(() => undefined)
    return () => audio.removeEventListener('loadedmetadata', toStart)
  }, [url, start])

  function onTime() {
    const audio = audioRef.current
    if (audio && end !== null && audio.currentTime >= end) audio.currentTime = start
  }

  async function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      if (audio.currentTime < start || (end !== null && audio.currentTime >= end)) audio.currentTime = start
      try { await audio.play(); setPlaying(true) } catch { setPlaying(false) }
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <audio
        ref={audioRef} src={url} preload="metadata" onTimeUpdate={onTime}
        onEnded={() => { const a = audioRef.current; if (a) { a.currentTime = start; void a.play() } }}
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      />
      <button type="button" onClick={toggle} aria-label={playing ? 'Pause invitation music' : 'Play invitation music'} title={playing ? 'Pause music' : 'Play music'} className={`${buttonClass} bottom-5`} style={buttonStyle}>
        {playing ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        <Badge />
      </button>
    </>
  )
}

/** Spotify track: the button opens Spotify's own player (it must stay visible), which plays the chosen part on a loop. */
function SpotifyMusic({ trackId, start, end }: { trackId: string; start: number; end: number | null }) {
  const [open, setOpen] = useState(false)
  const host = useRef<HTMLDivElement>(null)
  const { controller, playback, error } = useSpotifySegment(host, open ? trackId : null, start, end)
  const playing = !!playback && !playback.isPaused

  // Spotify only starts on a tap; once the player is ready, the tap that opened it starts the song
  useEffect(() => { controller?.play() }, [controller])

  function close() {
    controller?.pause()
    setOpen(false)
  }

  return (
    <>
      {open && (
        // Docked just left of the music button, the same height as Spotify's smallest player (80px)
        <div className="fixed bottom-5 right-[4.25rem] z-[60] h-20 w-[min(15rem,calc(100vw-5.75rem))] overflow-hidden rounded-xl shadow-lg">
          <div ref={host} className="h-20" />
          {error && <p className="absolute inset-0 grid place-items-center bg-white p-2 text-center text-xs text-red-700">{error}</p>}
          <button type="button" onClick={close} aria-label="Close music player" className="absolute left-1 top-1 rounded-full bg-black/40 p-0.5 text-white"><X className="size-3" /></button>
        </div>
      )}
      <button
        type="button"
        onClick={() => (open ? controller?.togglePlay() : setOpen(true))}
        aria-label={playing ? 'Pause invitation music' : 'Play invitation music'}
        title={playing ? 'Pause music' : 'Play music'}
        className={`${buttonClass} ${open ? 'bottom-9' : 'bottom-5'}`} style={buttonStyle}
      >
        {playing ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        <Badge />
      </button>
    </>
  )
}
