import { useEffect, useRef, useState } from 'react'
import { Music2, Volume2, VolumeX } from 'lucide-react'
import type { InviteContent } from '@/types/database'

export function MusicPlayer({ content }: { content: InviteContent }) {
  const audioRef = useRef<HTMLAudioElement>(null)
  const [playing, setPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    // Browsers commonly block autoplay, so the control below remains the
    // reliable way for a guest to start the track after opening the invite.
    void audio.play().then(() => setPlaying(true)).catch(() => undefined)
  }, [content.music_url])

  if (!content.music_url) return null

  async function toggle() {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) {
      try {
        await audio.play()
        setPlaying(true)
      } catch {
        setPlaying(false)
      }
    } else {
      audio.pause()
      setPlaying(false)
    }
  }

  return (
    <>
      <audio ref={audioRef} src={content.music_url} loop preload="metadata" onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)} />
      <button
        type="button"
        onClick={toggle}
        aria-label={playing ? 'Pause invitation music' : 'Play invitation music'}
        title={playing ? 'Pause music' : 'Play music'}
        className="fixed bottom-5 right-5 z-[60] flex size-12 items-center justify-center rounded-full border shadow-lg transition-transform hover:scale-105"
        style={{ backgroundColor: 'var(--invite-primary)', color: 'var(--invite-background)', borderColor: 'var(--invite-accent)' }}
      >
        {playing ? <Volume2 className="size-5" /> : <VolumeX className="size-5" />}
        <Music2 className="absolute -right-1 -top-1 size-4 rounded-full p-0.5" style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)' }} />
      </button>
    </>
  )
}
