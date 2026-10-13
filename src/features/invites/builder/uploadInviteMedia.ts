import { supabase } from '@/lib/supabase'
import type { Invite } from '@/types/database'

/** Uploads to the invite's folder in the invite-media bucket and returns the public URL. */
export async function uploadInviteMedia(invite: Pick<Invite, 'id' | 'business_id'>, file: File, kind: 'image' | 'video' | 'audio' = 'image') {
  if (!file.type.startsWith(`${kind}/`)) throw new Error(`${file.name} is not a ${kind}.`)
  const maxSize = kind === 'video' ? 50 : 10
  if (file.size > maxSize * 1024 * 1024) throw new Error(`${file.name} is larger than ${maxSize} MB.`)
  const safeName = file.name.replace(/[^a-z0-9._-]/gi, '-').toLowerCase()
  const path = `${invite.business_id}/${invite.id}/${crypto.randomUUID()}-${safeName}`
  const { error } = await supabase.storage.from('invite-media').upload(path, file, {
    contentType: file.type,
    cacheControl: '3600',
    upsert: false,
  })
  if (error) throw new Error(error.message)
  return supabase.storage.from('invite-media').getPublicUrl(path).data.publicUrl
}
