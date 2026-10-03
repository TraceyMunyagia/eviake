import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import QRCode from 'qrcode'
import { supabase } from '@/lib/supabase'
import { tokenStyle } from '@/features/invites/templates/tokenStyle'
import { formatEventDate } from '@/lib/eventFormat'
import type { GuestPass } from '@/types/database'

export function GuestPassPage() {
  const { token } = useParams()
  const [pass, setPass] = useState<GuestPass | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    if (!token) return
    supabase.rpc('get_guest_pass', { p_token: token }).then(({ data, error }) => {
      if (error || !data) return setState('missing')
      setPass(data as GuestPass)
      setState('ready')
    })
  }, [token])

  useEffect(() => {
    if (!token) return
    QRCode.toDataURL(token, { width: 320, margin: 1 })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(null))
  }, [token])

  if (state === 'loading') return <p className="p-10 text-center text-sm text-muted">Loading…</p>
  if (state === 'missing' || !pass) return <p className="p-10 text-center text-sm text-muted">This pass could not be found.</p>

  return (
    <div style={tokenStyle(pass.tokens)} className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <div
        className="w-full max-w-xs rounded-3xl border-2 bg-white p-6 text-center shadow-lg"
        style={{ borderColor: 'var(--invite-hairline)', color: 'var(--invite-primary)' }}
      >
        <p className="text-xs font-semibold uppercase tracking-widest opacity-70">{pass.event_name ?? 'Your pass'}</p>
        <p className="mt-1 text-sm opacity-70">
          {formatEventDate(pass.event_date ?? undefined)}{pass.venue ? ` · ${pass.venue}` : ''}
        </p>

        <div className="mx-auto my-6 w-full max-w-[220px]">
          {qrDataUrl ? (
            <img src={qrDataUrl} alt="Your check-in QR code" className="w-full" />
          ) : (
            <div className="flex aspect-square w-full items-center justify-center rounded-lg bg-gray-100 text-xs text-muted">Generating…</div>
          )}
        </div>

        <p className="text-lg font-semibold">{pass.guest_name}</p>
        <p className="text-sm opacity-70">Party of {pass.party_size}</p>

        {pass.checked_in_at ? (
          <p className="mt-4 rounded-full bg-green-100 px-3 py-1 text-xs font-medium text-green-800">Checked in</p>
        ) : (
          <p className="mt-4 text-xs opacity-60">Show this code at the door</p>
        )}
      </div>
    </div>
  )
}