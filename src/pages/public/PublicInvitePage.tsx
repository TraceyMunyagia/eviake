import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'

export function PublicInvitePage() {
  const { slug } = useParams()
  const [data, setData] = useState<any>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    if (!slug) return
    supabase.rpc('get_public_invite', { p_slug: slug }).then(({ data, error }) => {
      if (error || !data) return setState('missing')
      setData(data)
      setState('ready')
    })
  }, [slug])

  if (state === 'loading') return <p className="p-10 text-center text-sm text-muted">Loading…</p>
  if (state === 'missing') return <p className="p-10 text-center text-sm text-muted">This invitation could not be found.</p>

  // Placeholder rendering — swapped for the real Editorial/Romance/Celebration
  // components in Week 9–10. The route and data-fetch are real now.
  return (
    <div className="mx-auto max-w-xl p-10 text-center">
      <p className="text-sm uppercase tracking-wide text-muted">{data.template} · {data.package}</p>
      <h1 className="mt-2 font-display text-3xl">{data.content.event_name || data.content.couple_names}</h1>
      <p className="mt-2 text-sm text-muted">{data.content.event_date} {data.content.event_time}</p>
      <p className="mt-1 text-sm text-muted">{data.content.venue}</p>
      {data.content.description && <p className="mt-4 text-sm">{data.content.description}</p>}
    </div>
  )
}