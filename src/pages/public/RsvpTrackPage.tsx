import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function RsvpTrackPage() {
  const { token } = useParams()
  const [data, setData] = useState<any>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    if (!token) return
    supabase.rpc('get_invite_by_rsvp_token', { p_token: token }).then(({ data, error }) => {
      if (error || !data) return setState('missing')
      setData(data)
      setState('ready')
    })
  }, [token])

  if (state === 'loading') return <p className="p-10 text-center text-sm text-muted">Loading…</p>
  if (state === 'missing') return <p className="p-10 text-center text-sm text-muted">This tracking link could not be found.</p>

  // Placeholder — becomes a read-only, token-scoped RSVP summary once guests
  // are linked to invites in Week 9–10.
  return (
    <div className="mx-auto max-w-xl p-10 text-center">
      <h1 className="font-display text-2xl">RSVP tracking</h1>
      <p className="mt-2 text-sm text-muted">Guest-level RSVP tracking for this invite arrives with the full builder.</p>
    </div>
  )
}