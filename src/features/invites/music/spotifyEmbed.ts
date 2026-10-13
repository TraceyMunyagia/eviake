// Spotify's official embed player API (https://developer.spotify.com/documentation/embeds/references/iframe-api).
// Guests not logged into Spotify in that browser hear a 30-second preview; Spotify never autoplays.

export interface SpotifyPlayback { isPaused: boolean; isBuffering: boolean; duration: number; position: number } // ms
export interface SpotifyController {
  play(): void
  pause(): void
  resume(): void
  togglePlay(): void
  seek(seconds: number): void
  destroy(): void
  addListener(event: 'ready', cb: () => void): void
  addListener(event: 'playback_update', cb: (e: { data: SpotifyPlayback }) => void): void
}
interface SpotifyIFrameAPI {
  createController(el: HTMLElement, options: { uri: string; width?: string | number; height?: string | number }, cb: (c: SpotifyController) => void): void
}

declare global {
  interface Window { onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void }
}

let apiPromise: Promise<SpotifyIFrameAPI> | null = null

function loadApi(): Promise<SpotifyIFrameAPI> {
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      window.onSpotifyIframeApiReady = resolve
      const script = document.createElement('script')
      script.src = 'https://open.spotify.com/embed/iframe-api/v1'
      script.async = true
      script.onerror = () => { apiPromise = null; reject(new Error('Could not load the Spotify player.')) }
      document.body.appendChild(script)
    })
  }
  return apiPromise
}

/** Mounts a compact Spotify player for a track into el. The element is replaced by Spotify's iframe. */
export async function createSpotifyPlayer(el: HTMLElement, trackId: string): Promise<SpotifyController> {
  const api = await loadApi()
  return new Promise((resolve) => api.createController(el, { uri: `spotify:track:${trackId}`, width: '100%', height: 80 }, resolve))
}
