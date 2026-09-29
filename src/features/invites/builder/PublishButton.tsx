import { supabase } from '@/lib/supabase'
import { usePublishInvite } from '@/hooks/usePublishInvite'
import { Button } from '@/components/ui/Button'
import type { Invite } from '@/types/database'
import { useState } from 'react'

export function PublishButton({ invite, onSaved }: { invite: Invite; onSaved: (invite: Invite) => void }) {
  const { publish, busy, error } = usePublishInvite()
  const [linkError, setLinkError] = useState<string | null>(null)

  async function handlePublish() {
    setLinkError(null)
    // Guest-linking has to exist before the RSVP form can accept a real
    // response, so this runs first and publish only proceeds if it succeeds.
    const { error: linkError } = await supabase.rpc('ensure_invite_event', { p_invite_id: invite.id })
    if (linkError) {
      setLinkError(linkError.message)
      return
    }
    const updated = await publish(invite, invite.content.couple_names || invite.content.event_name || '')
    if (updated) onSaved(updated)
  }

  return (
    <div>
      <Button onClick={handlePublish} disabled={busy}>{busy ? 'Publishing…' : 'Finish up & publish'}</Button>
      {linkError && <p role="alert" className="mt-2 text-sm text-red-700">{linkError}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}
