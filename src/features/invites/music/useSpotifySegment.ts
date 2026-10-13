import { useEffect, useRef, useState, type RefObject } from 'react'
import { createSpotifyPlayer, type SpotifyController, type SpotifyPlayback } from './spotifyEmbed'

/**
 * Mounts Spotify's player for trackId inside container and keeps playback inside [start, end), looping.
 * If Spotify only offers its 30-second preview (guest not logged in) and the start is past it, the preview plays as is.
 */
export function useSpotifySegment(container: RefObject<HTMLDivElement | null>, trackId: string | null, start: number, end: number | null) {
  const [controller, setController] = useState<SpotifyController | null>(null)
  const [playback, setPlayback] = useState<SpotifyPlayback | null>(null)
  const [error, setError] = useState<string | null>(null)
  const segment = useRef({ start, end })
  segment.current = { start, end }

  useEffect(() => {
    const host = container.current
    if (!host || !trackId) return
    let cancelled = false
    let ctrl: SpotifyController | null = null
    // Spotify replaces this element with its iframe, so it lives outside React's tree
    const target = document.createElement('div')
    host.appendChild(target)
    setError(null)
    createSpotifyPlayer(target, trackId)
      .then((c) => {
        if (cancelled) return c.destroy()
        ctrl = c
        c.addListener('playback_update', ({ data }) => {
          setPlayback(data)
          const { start: s, end: e } = segment.current
          const trimmable = data.duration > 0 && s * 1000 < data.duration
          if (!trimmable || data.isBuffering) return
          if (!data.isPaused && data.position < s * 1000 - 1500) c.seek(s)
          else if (!data.isPaused && e !== null && data.position >= e * 1000) c.seek(s)
          else if (data.isPaused && data.position > 0 && data.position >= data.duration - 600) { c.seek(s); c.resume() } // loop at the song's end
        })
        setController(c)
      })
      .catch((err: Error) => { if (!cancelled) setError(err.message) })
    return () => {
      cancelled = true
      ctrl?.destroy()
      setController(null)
      setPlayback(null)
      host.replaceChildren()
    }
  }, [container, trackId])

  return { controller, playback, error }
}
