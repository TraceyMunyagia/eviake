import { useEffect, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { formatTime } from '../music/music'

const CLIP_LENGTHS = [5, 10, 15, 30, 60] as const
const BAR = 3
const GAP = 3

/** Same bars for the same song every time (the audio itself can't be read for Spotify tracks). */
function barHeights(seed: string, count: number) {
  let h = 2166136261
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  const out: number[] = []
  let prev = 0.5
  for (let i = 0; i < count; i++) {
    h = Math.imul(h ^ (h >>> 13), 1274126177)
    const r = ((h >>> 0) % 1000) / 1000
    prev = prev * 0.55 + r * 0.45 // smooth neighbouring bars, like a waveform
    out.push(0.25 + prev * 0.75)
  }
  return out
}

/**
 * Instagram-style clip picker: the song scrolls under a fixed window the length of the clip.
 * Drag (or scroll, or use the arrow keys) to choose where the clip starts; pick a clip length below.
 */
export function ClipPicker({ seed, length, start, duration, position, onStart, onDuration }: {
  seed: string
  /** Song length in seconds, once known. */
  length: number | null
  start: number
  /** Clip length in seconds; null plays the whole song from start. */
  duration: number | null
  /** Current playback position in seconds while previewing, for the progress fill. */
  position: number | null
  onStart: (seconds: number) => void
  onDuration: (seconds: number | null) => void
}) {
  const scroller = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(0)
  const dragging = useRef<{ x: number; left: number } | null>(null)
  const userScroll = useRef(false)

  useLayoutEffect(() => {
    const el = scroller.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidth(el.clientWidth))
    ro.observe(el)
    setWidth(el.clientWidth)
    return () => ro.disconnect()
  }, [])

  const total = length ?? 180 // until Spotify reports the length
  const clip = Math.min(duration ?? total, total)
  const whole = duration === null
  const windowW = whole ? Math.max(width - 32, 0) : Math.max(Math.min(width * 0.45, 260), 96)
  const pps = clip > 0 ? windowW / clip : 1 // pixels per second
  const side = Math.max((width - windowW) / 2, 0)
  const maxStart = Math.max(total - clip, 0)
  const bars = useMemo(() => barHeights(seed, Math.max(1, Math.ceil((total * pps) / (BAR + GAP)))), [seed, total, pps])

  // Keep the strip in step when start changes from outside (typing, reset), but not while the user is moving it
  useEffect(() => {
    const el = scroller.current
    if (!el || userScroll.current) return
    const target = Math.min(start, maxStart) * pps
    if (Math.abs(el.scrollLeft - target) > 1) el.scrollLeft = target
  }, [start, pps, maxStart, width])

  function onScroll() {
    const el = scroller.current
    if (!el || !userScroll.current) return
    const next = Math.round(Math.min(Math.max(el.scrollLeft / pps, 0), maxStart))
    if (next !== start) onStart(next)
  }

  // Mouse drag; touch and trackpads scroll natively
  function onPointerDown(e: PointerEvent) {
    userScroll.current = true
    if (e.pointerType !== 'mouse' || !scroller.current) return
    dragging.current = { x: e.clientX, left: scroller.current.scrollLeft }
    scroller.current.setPointerCapture(e.pointerId)
  }
  function onPointerMove(e: PointerEvent) {
    if (!dragging.current || !scroller.current) return
    scroller.current.scrollLeft = dragging.current.left - (e.clientX - dragging.current.x)
  }
  function endDrag() {
    dragging.current = null
    window.setTimeout(() => { userScroll.current = false }, 150)
  }

  function onKey(e: KeyboardEvent) {
    const step = e.shiftKey ? 5 : 1
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault()
      onStart(Math.min(Math.max(start + (e.key === 'ArrowRight' ? step : -step), 0), maxStart))
    } else if (e.key === 'Home') { e.preventDefault(); onStart(0) }
    else if (e.key === 'End') { e.preventDefault(); onStart(maxStart) }
  }

  const progress = position !== null && position >= start && position <= start + clip ? (position - start) / clip : null

  return (
    // contain: the strip's width never feeds back into this box's width (it is measured to size the strip)
    <div className="min-w-0 space-y-3 [contain:inline-size]">
      <div className="text-center">
        <span className="font-mono text-2xl font-medium text-plum-900">{formatTime(start)}</span>
        <span className="ml-1.5 text-sm text-muted">/ {length !== null ? formatTime(length) : '–:––'}</span>
      </div>

      <div className="relative select-none">
        <div
          ref={scroller}
          role="slider"
          tabIndex={0}
          aria-label="Where the song starts"
          aria-valuemin={0}
          aria-valuemax={Math.round(maxStart)}
          aria-valuenow={start}
          aria-valuetext={`Starts at ${formatTime(start)}`}
          onScroll={onScroll}
          onWheel={() => { userScroll.current = true; endDrag() }}
          onTouchStart={() => { userScroll.current = true }}
          onTouchEnd={endDrag}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onKeyDown={onKey}
          className={`overflow-x-auto rounded-xl bg-plum-950/[0.04] py-3 outline-none focus-visible:ring-2 focus-visible:ring-gold-500 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden ${whole ? '' : 'cursor-grab active:cursor-grabbing'}`}
        >
          <div className="flex h-14 items-center" style={{ paddingLeft: side, paddingRight: side, width: total * pps + side * 2, gap: GAP }}>
            {bars.map((h, i) => (
              <span key={i} className="shrink-0 rounded-full bg-plum-900/30" style={{ width: BAR, height: `${h * 100}%` }} />
            ))}
          </div>
        </div>

        {/* The fixed clip window, centred over the strip */}
        <div aria-hidden className="pointer-events-none absolute inset-y-1 left-1/2 -translate-x-1/2 overflow-hidden rounded-lg border-[3px] border-gold-500" style={{ width: windowW }}>
          {progress !== null && <div className="h-full bg-gold-500/30 transition-[width] duration-200" style={{ width: `${progress * 100}%` }} />}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-center gap-1.5" role="radiogroup" aria-label="Clip length">
        {CLIP_LENGTHS.filter((s) => length === null || s < length).map((s) => (
          <button key={s} type="button" role="radio" aria-checked={duration === s} onClick={() => onDuration(s)}
            className={`rounded-full px-3 py-1 text-sm ${duration === s ? 'bg-plum-900 font-medium text-white' : 'bg-plum-950/[0.06] text-ink hover:bg-plum-950/10'}`}>
            {s}s
          </button>
        ))}
        <button type="button" role="radio" aria-checked={whole} onClick={() => onDuration(null)}
          className={`rounded-full px-3 py-1 text-sm ${whole ? 'bg-plum-900 font-medium text-white' : 'bg-plum-950/[0.06] text-ink hover:bg-plum-950/10'}`}>
          Whole song
        </button>
      </div>
    </div>
  )
}
