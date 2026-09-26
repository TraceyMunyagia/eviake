import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { randomSuffix, randomToken, slugify } from '@/lib/slug'
import type { Invite } from '@/types/database'

export function usePublishInvite() {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function publish(invite: Invite, baseName: string): Promise<Invite | null> {
    setBusy(true)
    setError(null)
    const base = slugify(baseName || invite.template) || 'invite'
    let lastErr: string | null = null

    for (let attempt = 0; attempt < 5; attempt++) {
      const slug = attempt === 0 ? base : `${base}-${randomSuffix()}`
      const { data, error: err } = await supabase
        .from('invites')
        .update({
          status: 'published',
          public_slug: slug,
          rsvp_track_token: invite.rsvp_track_token ?? randomToken(),
          published_at: new Date().toISOString(),
        })
        .eq('id', invite.id)
        .select('*')
        .single()

      if (!err) { setBusy(false); return data as Invite }
      lastErr = err.message
      if (!err.message.includes('duplicate') && !err.message.includes('unique')) break
    }

    setBusy(false)
    setError(lastErr ?? 'Could not publish this invite.')
    return null
  }

  return { publish, busy, error }
}