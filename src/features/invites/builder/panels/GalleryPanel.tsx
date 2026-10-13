import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { inputClass } from '@/components/ui/Field'
import type { InviteContent } from '@/types/database'
import { ACCEPT, MediaError, removeInviteMedia, uploadInviteMedia } from '@/lib/uploadInviteMedia'
import { P } from '../content/contentPaths'
import { usePanel } from '../content/PanelContext'

const input = inputClass.replace('mt-1 ', '')
const MAX_PHOTOS = 20
type Item = { url: string; caption: string; alt: string }

// Photos live in three index-aligned arrays (urls, captions, alts), so every edit rewrites all three together
const toItems = (c: InviteContent): Item[] => {
  const urls = (c[P.gallery] as string[] | undefined) ?? []
  const caps = (c[P.galleryCaptions] as string[] | undefined) ?? []
  const alts = (c[P.galleryAlts] as string[] | undefined) ?? []
  return urls.map((url, i) => ({ url, caption: caps[i] ?? '', alt: alts[i] ?? '' }))
}
const fromItems = (items: Item[]) => ({
  [P.gallery]: items.map((x) => x.url),
  [P.galleryCaptions]: items.map((x) => x.caption),
  [P.galleryAlts]: items.map((x) => x.alt),
})

export function GalleryPanel() {
  const { invite, updateInvite } = usePanel()
  const items = toItems(invite.content)
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  // Always applied to the newest content, since uploads finish after other edits
  const edit = (fn: (items: Item[]) => Item[]) =>
    updateInvite((current) => ({ content: { ...current.content, ...fromItems(fn(toItems(current.content))) } }))
  const patch = (i: number, p: Partial<Item>) => edit((list) => list.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const move = (i: number, d: -1 | 1) =>
    edit((list) => {
      const j = i + d
      if (j < 0 || j >= list.length) return list
      const next = [...list]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  const remove = (i: number) => {
    const url = items[i]?.url
    if (url) void removeInviteMedia(url, invite.business_id)
    edit((list) => list.filter((_, k) => k !== i))
  }

  async function addFiles(list: FileList | null) {
    if (!list?.length) return
    const files = Array.from(list).slice(0, Math.max(MAX_PHOTOS - items.length, 0))
    const problems: string[] = list.length > files.length ? [`Only ${MAX_PHOTOS} photos fit. Extra files were skipped.`] : []
    setErrors([])
    setBusy(files.length)
    // One at a time; each success is saved straight away, so a bad file never loses the good ones
    for (const file of files) {
      try {
        const { url } = await uploadInviteMedia({ businessId: invite.business_id, inviteId: invite.id, file, slot: 'gallery' })
        edit((current) => [...current, { url, caption: '', alt: '' }])
      } catch (e) {
        problems.push(`${file.name}: ${e instanceof MediaError ? e.message : 'upload failed'}`)
      } finally {
        setBusy((n) => n - 1)
      }
    }
    setErrors(problems)
    if (fileInput.current) fileInput.current.value = ''
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && busy === 0 && <p className="text-sm text-muted">No photos yet.</p>}

      {items.map((it, i) => (
        <div key={`${it.url}-${i}`} className="flex gap-3 rounded-xl border border-line bg-white p-2">
          {it.url ? <img src={it.url} alt="" className="size-16 shrink-0 rounded-lg object-cover" /> : <div className="size-16 shrink-0 rounded-lg bg-gold-100" />}
          <div className="min-w-0 flex-1 space-y-1.5">
            <input aria-label={`Photo ${i + 1} caption`} placeholder="Caption (optional)" value={it.caption} onChange={(e) => patch(i, { caption: e.target.value })} className={input} />
            <input aria-label={`Photo ${i + 1} description for screen readers`} placeholder="Description for screen readers" value={it.alt} onChange={(e) => patch(i, { alt: e.target.value })} className={input} />
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex gap-1">
              <button type="button" aria-label={`Move photo ${i + 1} up`} disabled={i === 0} className="rounded border border-line px-1.5 disabled:opacity-40" onClick={() => move(i, -1)}>↑</button>
              <button type="button" aria-label={`Move photo ${i + 1} down`} disabled={i === items.length - 1} className="rounded border border-line px-1.5 disabled:opacity-40" onClick={() => move(i, 1)}>↓</button>
            </div>
            <button type="button" className="text-xs text-red-700" onClick={() => remove(i)}>Remove</button>
          </div>
        </div>
      ))}

      {busy > 0 && <p className="flex items-center gap-2 text-sm text-muted"><Loader2 className="size-4 animate-spin" /> Uploading {busy} photo{busy > 1 ? 's' : ''}…</p>}

      <input ref={fileInput} type="file" multiple accept={ACCEPT.image} className="sr-only" aria-label="Add photos" onChange={(e) => void addFiles(e.target.files)} />
      <button type="button" disabled={busy > 0 || items.length >= MAX_PHOTOS} onClick={() => fileInput.current?.click()}
        className="rounded-lg border border-line bg-white px-3 py-1.5 text-sm font-medium hover:bg-gold-100 disabled:opacity-50">
        + Add photos ({items.length}/{MAX_PHOTOS})
      </button>

      {errors.map((e, i) => <p key={i} role="alert" className="text-xs text-red-700">{e}</p>)}
    </div>
  )
}
