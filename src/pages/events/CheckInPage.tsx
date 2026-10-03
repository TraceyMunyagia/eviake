import { useEffect, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import QrScanner from 'qr-scanner'
import QrScannerWorkerPath from 'qr-scanner/qr-scanner-worker.min.js?url'
import { ArrowLeft, Camera, CameraOff, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

QrScanner.WORKER_PATH = QrScannerWorkerPath

type Result = { ok: boolean; message: string; guestName?: string; partySize?: number }
type SearchRow = { id: string; name: string; plus_ones: number; checked_in_at: string | null }

export function CheckInPage() {
  const { id: eventId } = useParams()
  const videoRef = useRef<HTMLVideoElement>(null)
  const scannerRef = useRef<QrScanner | null>(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [cameraError, setCameraError] = useState<string | null>(null)
  const [result, setResult] = useState<Result | null>(null)
  const [busy, setBusy] = useState(false)
  const [query, setQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchRow[]>([])

  async function processToken(token: string) {
    if (busy) return
    setBusy(true)
    const { data, error } = await supabase.rpc('check_in_guest_by_token', { p_token: token })
    setBusy(false)
    if (error) return setResult({ ok: false, message: error.message })
    setResult({ ok: true, message: 'Checked in', guestName: data.guest_name, partySize: data.party_size })
  }

  async function startCamera() {
    if (!videoRef.current) return
    setCameraError(null)
    const scanner = new QrScanner(videoRef.current, (res) => processToken(res.data), {
      highlightScanRegion: true,
      highlightCodeOutline: true,
      maxScansPerSecond: 4,
    })
    scannerRef.current = scanner
    try {
      await scanner.start()
      setCameraOn(true)
    } catch {
      setCameraError('Could not access the camera. Use search below instead.')
      setCameraOn(false)
    }
  }

  function stopCamera() {
    scannerRef.current?.stop()
    scannerRef.current?.destroy()
    scannerRef.current = null
    setCameraOn(false)
  }

  useEffect(() => {
    startCamera()
    return () => stopCamera()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!eventId || query.trim().length < 2) { setSearchResults([]); return }
    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from('guests')
        .select('id, name, plus_ones, checked_in_at')
        .eq('event_id', eventId)
        .ilike('name', `%${query.trim()}%`)
        .limit(8)
      setSearchResults((data ?? []) as SearchRow[])
    }, 250)
    return () => clearTimeout(timer)
  }, [query, eventId])

  async function checkInById(guestId: string) {
    if (busy) return
    setBusy(true)
    const { data, error } = await supabase.rpc('check_in_guest_by_id', { p_guest_id: guestId })
    setBusy(false)
    if (error) return setResult({ ok: false, message: error.message })
    setResult({ ok: true, message: 'Checked in', guestName: data.guest_name, partySize: data.party_size })
    setQuery('')
    setSearchResults([])
  }

  return (
    <div className="mx-auto max-w-lg">
      <Link to={`/events/${eventId}`} className="mb-4 inline-flex items-center gap-1 text-sm text-muted hover:text-ink">
        <ArrowLeft className="size-4" /> Event
      </Link>
      <h1 className="mb-4 font-display text-2xl text-plum-900">Check-in</h1>

      <div className="overflow-hidden rounded-2xl border border-line bg-black">
        <video ref={videoRef} className="aspect-square w-full object-cover" muted playsInline />
      </div>

      <div className="mt-3 flex items-center justify-between">
        {cameraError ? (
          <p className="text-sm text-red-700">{cameraError}</p>
        ) : (
          <p className="text-sm text-muted">{cameraOn ? 'Point the camera at a guest pass.' : 'Starting camera…'}</p>
        )}
        <Button variant="secondary" onClick={cameraOn ? stopCamera : startCamera}>
          {cameraOn ? <><CameraOff className="size-4" /> Stop</> : <><Camera className="size-4" /> Start</>}
        </Button>
      </div>

      {result && (
        <div
          role="status"
          className={`mt-4 rounded-2xl border p-4 text-center ${result.ok ? 'border-green-300 bg-green-50 text-green-900' : 'border-red-300 bg-red-50 text-red-800'}`}
        >
          {result.ok ? (
            <p className="font-medium">{result.guestName} checked in — party of {result.partySize}</p>
          ) : (
            <p className="font-medium">{result.message}</p>
          )}
        </div>
      )}

      <div className="mt-8">
        <p className="mb-2 text-sm font-medium text-plum-900">Can't scan? Search by name</p>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Guest name"
            className="w-full rounded-lg border border-line py-2 pl-9 pr-3 text-sm"
          />
        </div>
        {searchResults.length > 0 && (
          <ul className="mt-2 divide-y divide-line rounded-lg border border-line bg-white">
            {searchResults.map((g) => (
              <li key={g.id} className="flex items-center justify-between gap-3 px-3 py-2 text-sm">
                <span>{g.name} <span className="text-muted">· party of {1 + g.plus_ones}</span></span>
                {g.checked_in_at ? (
                  <span className="text-xs text-green-700">Checked in</span>
                ) : (
                  <Button variant="secondary" onClick={() => checkInById(g.id)} disabled={busy}>Check in</Button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}