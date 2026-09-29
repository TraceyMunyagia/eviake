import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import type { Invite, InviteContent } from '@/types/database'

type ImageKey = 'hero_image_url' | 'logo_url' | 'about_image_url'

function ImagePicker({ id, label, value, multiple = false, onPick, onRemove }: {
  id: string
  label: string
  value?: string
  multiple?: boolean
  onPick: (files: File[]) => void
  onRemove?: () => void
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <input
        id={id}
        type="file"
        accept="image/*"
        multiple={multiple}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length) onPick(files)
          event.currentTarget.value = ''
        }}
        className="mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-gold-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
      />
      {value && (
        <div className="mt-3 flex items-center gap-3">
          <img src={value} alt="" className="size-16 rounded-lg border border-line object-cover" />
          {onRemove && <Button type="button" variant="ghost" onClick={onRemove}>Remove</Button>}
        </div>
      )}
    </div>
  )
}

function VideoPicker({ value, onPick, onRemove }: { value?: string; onPick: (files: File[]) => void; onRemove: () => void }) {
  return (
    <div>
      <label htmlFor="media-video" className="block text-sm font-medium">Video</label>
      <input
        id="media-video"
        type="file"
        accept="video/*"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? [])
          if (files.length) onPick(files)
          event.currentTarget.value = ''
        }}
        className="mt-1 block w-full rounded-lg border border-line bg-white px-3 py-2 text-sm text-ink file:mr-3 file:rounded-md file:border-0 file:bg-gold-100 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-ink"
      />
      {value && (
        <div className="mt-3 flex items-center gap-3">
          <video src={value} controls className="h-20 w-36 rounded-lg border border-line object-cover" />
          <Button type="button" variant="ghost" onClick={onRemove}>Remove</Button>
        </div>
      )}
    </div>
  )
}

export function MediaPanel({ invite, onSaved }: { invite: Invite; onSaved: (invite: Invite) => void }) {
  const [content, setContent] = useState<InviteContent>(invite.content)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  useEffect(() => setContent(invite.content), [invite.id, invite.content])

  function set<K extends keyof InviteContent>(key: K, value: InviteContent[K]) {
    setContent((previous) => ({ ...previous, [key]: value }))
  }

  async function upload(file: File, kind: 'image' | 'video' = 'image') {
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

  async function pickSingle(key: ImageKey, files: File[]) {
    setBusy(true); setMessage(null)
    try { set(key, await upload(files[0])) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not upload image.') }
    finally { setBusy(false) }
  }

  async function pickGallery(files: File[]) {
    setBusy(true); setMessage(null)
    try { set('gallery_urls', [...(content.gallery_urls ?? []), ...(await Promise.all(files.map((file) => upload(file))))]) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not upload gallery images.') }
    finally { setBusy(false) }
  }

  async function pickDressCode(files: File[]) {
    setBusy(true); setMessage(null)
    try { set('dress_code_image_urls', [...(content.dress_code_image_urls ?? []), ...(await Promise.all(files.map((file) => upload(file))))]) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not upload dress-code images.') }
    finally { setBusy(false) }
  }

  async function pickVideo(files: File[]) {
    setBusy(true); setMessage(null)
    try { set('video_url', await upload(files[0], 'video')) }
    catch (error) { setMessage(error instanceof Error ? error.message : 'Could not upload video.') }
    finally { setBusy(false) }
  }

  async function save() {
    setBusy(true); setMessage(null)
    const { data, error } = await supabase.from('invites').update({ content }).eq('id', invite.id).select('*').single()
    setBusy(false)
    if (error) return setMessage(error.message)
    onSaved(data as Invite); setMessage('Media saved.')
  }

  const gallery = content.gallery_urls ?? []
  const dressCodeImages = content.dress_code_image_urls ?? []
  return (
    <div className="space-y-5 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <p className="text-sm text-muted">Choose images and a video from your device. Files are uploaded securely and attached to this invite.</p>
      <ImagePicker id="media-hero" label="Hero image" value={content.hero_image_url} onPick={(files) => pickSingle('hero_image_url', files)} onRemove={() => set('hero_image_url', '')} />
      <ImagePicker id="media-logo" label="Logo" value={content.logo_url} onPick={(files) => pickSingle('logo_url', files)} onRemove={() => set('logo_url', '')} />
      <div className="space-y-4 rounded-xl border border-line p-4">
        <p className="text-sm font-medium">Story media</p>
        <ImagePicker id="media-about" label="Story image" value={content.about_image_url} onPick={(files) => pickSingle('about_image_url', files)} onRemove={() => set('about_image_url', '')} />
        <VideoPicker value={content.video_url} onPick={pickVideo} onRemove={() => set('video_url', '')} />
      </div>
      <ImagePicker id="media-gallery" label="Gallery images" multiple onPick={pickGallery} />
      {gallery.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {gallery.map((url, index) => (
            <div key={`${url}-${index}`} className="relative">
              <img src={url} alt={`Gallery image ${index + 1}`} className="aspect-square w-full rounded-lg border border-line object-cover" />
              <Button type="button" variant="secondary" onClick={() => set('gallery_urls', gallery.filter((_, itemIndex) => itemIndex !== index))} className="mt-1 w-full px-2 py-1 text-xs">Remove</Button>
            </div>
          ))}
        </div>
      )}
      <ImagePicker id="media-dress-code" label="Dress-code inspiration images" multiple onPick={pickDressCode} />
      {dressCodeImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {dressCodeImages.map((url, index) => (
            <div key={`${url}-${index}`}>
              <img src={url} alt={`Dress-code inspiration ${index + 1}`} className="aspect-square w-full rounded-lg border border-line object-cover" />
              <Button type="button" variant="secondary" onClick={() => set('dress_code_image_urls', dressCodeImages.filter((_, itemIndex) => itemIndex !== index))} className="mt-1 w-full px-2 py-1 text-xs">Remove</Button>
            </div>
          ))}
        </div>
      )}
      {message && <p role="status" className="text-sm text-green-800">{message}</p>}
      <Button type="button" onClick={save} disabled={busy}>{busy ? 'Uploading…' : 'Save media'}</Button>
    </div>
  )
}
