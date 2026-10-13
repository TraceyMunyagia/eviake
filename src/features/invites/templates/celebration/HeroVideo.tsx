import { useRef, useState } from 'react'
import { usePrefersReducedMotion } from '@/hooks/usePrefersReducedMotion'

/** Autoplays muted when the visitor allows motion and data. Otherwise shows the poster with a play button. */
export function HeroVideo({ src, poster, className }: { src: string; poster?: string; className?: string }) {
  const reduce = usePrefersReducedMotion()
  const saveData = typeof navigator !== 'undefined' && (navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData === true
  const auto = !reduce && !saveData
  const ref = useRef<HTMLVideoElement>(null)
  const [playing, setPlaying] = useState(false)

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <video
        ref={ref} src={src} poster={poster} muted loop playsInline
        autoPlay={auto} preload={auto ? 'auto' : 'none'} controls={!auto && playing}
        className="h-full w-full object-cover"
        onPlay={() => setPlaying(true)} onPause={() => setPlaying(false)}
      />
      {!auto && !playing && (
        <button type="button" aria-label="Play video" onClick={() => void ref.current?.play()} className="absolute inset-0 grid place-items-center bg-black/20">
          <span className="grid size-14 place-items-center rounded-full bg-white/90 text-xl text-black">▶</span>
        </button>
      )}
    </div>
  )
}
