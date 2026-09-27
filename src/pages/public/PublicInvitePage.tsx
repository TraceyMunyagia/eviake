import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { getTemplateComponent } from '@/features/invites/templates/registry'
import type { Invite } from '@/types/database'


type PublicInviteData = Pick<Invite, 'template' | 'package' | 'content' | 'tokens' | 'sections' | 'status'>

export function PublicInvitePage() {
  const { slug } = useParams()
  const [data, setData] = useState<PublicInviteData | null>(null)
  const [state, setState] = useState<'loading' | 'ready' | 'missing'>('loading')

  useEffect(() => {
    if (!slug) return
    supabase.rpc('get_public_invite', { p_slug: slug }).then(({ data, error }) => {
      if (error || !data) return setState('missing')
      setData(data as PublicInviteData)
      setState('ready')
    })
  }, [slug])

  if (state === 'loading') return <p className="p-10 text-center text-sm text-muted">Loading…</p>
  if (state === 'missing' || !data) return <p className="p-10 text-center text-sm text-muted">This invitation could not be found.</p>

  const Template = getTemplateComponent(data.template)
  if (!Template) {
    return <p className="p-10 text-center text-sm text-muted">This invitation's design isn't available yet.</p>
  }

  return <Template content={data.content} tokens={data.tokens} sections={data.sections} mode="public" />
}