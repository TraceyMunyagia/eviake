import { useState } from 'react'
import { inputClass } from '@/components/ui/Field'
import { P } from '../content/contentPaths'
import { usePanel } from '../content/PanelContext'

const input = inputClass.replace('mt-1 ', '')

// Photos live in two index-aligned arrays (gallery_urls + gallery_captions), so every edit updates both together.
export function GalleryPanel() {
  const { get, updateInvite, upload } = usePanel()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const urls: string[] = Array.isArray(get(P.gallery)) ? get(P.gallery) : []
  const captions: string[] = Array.isArray(get(P.galleryCaptions)) ? get(P.galleryCaptions) : []
  const items = urls.map((url, i) => ({ url, caption: captions[i] ?? '' }))

  const save = (next: { url: string; caption: string }[]) =>
    updateInvite((current) => ({
      content: { ...current.content, [P.gallery]: next.map((x) => x.url), [P.galleryCaptions]: next.map((x) => x.caption) },
    }))
  const patch = (i: number, p: Partial<{ url: string; caption: string }>) => save(items.map((x, k) => (k === i ? { ...x, ...p } : x)))
  const move = (i: number, d: -1 | 1) => {
    const j = i + d
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    save(next)
  }

  async function addFiles(files: File[]) {
    if (!files.length) return
    setBusy(true)
    setError(null)
    try {
      const added = await Promise.all(files.map((f) => upload(f)))
      updateInvite((current) => {
        const u = (current.content[P.gallery] as string[] | undefined) ?? []
        const c = (current.content[P.galleryCaptions] as string[] | undefined) ?? []
        return { content: { ...current.content, [P.gallery]: [...u, ...added], [P.galleryCaptions]: [...u.map((_, i) => c[i] ?? ''), ...added.map(() => '')] } }
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not upload the photos.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-3">
      {items.length === 0 && <p className="text-sm text-muted">No photos yet.</p>}
      {items.map((it, i) => (
        <div key={i} className="flex gap-3 rounded-xl border border-line bg-white p-2">
          {it.url ? <img src={it.url} alt="" className="size-16 shrink-0 rounded-lg object-cover" /> : <div className="size-16 shrink-0 rounded-lg bg-gold-100" />}
          <div className="min-w-0 flex-1 space-y-1.5">
            <input aria-label={`Photo ${i + 1} link`} placeholder="Image link" value={it.url} onChange={(e) => patch(i, { url: e.target.value })} className={input} />
            <input aria-label={`Photo ${i + 1} caption`} placeholder="Caption (optional)" value={it.caption} onChange={(e) => patch(i, { caption: e.target.value })} className={input} />
          </div>
          <div className="flex flex-col justify-between">
            <div className="flex gap-1">
              <button type="button" aria-label={`Move photo ${i + 1} up`} disabled={i === 0} className="rounded border border-line px-1.5 disabled:opacity-40" onClick={() => move(i, -1)}>↑</button>
              <button type="button" aria-label={`Move photo ${i + 1} down`} disabled={i === items.length - 1} className="rounded border border-line px-1.5 disabled:opacity-40" onClick={() => move(i, 1)}>↓</button>
            </div>
            <button type="button" className="text-xs text-red-700" onClick={() => save(items.filter((_, k) => k !== i))}>Remove</button>
          </div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <label className="cursor-pointer rounded-lg bg-gold-100 px-3 py-1.5 font-medium">
          {busy ? 'Uploading…' : '+ Upload photos'}
          <input type="file" accept="image/*" multiple className="sr-only" disabled={busy}
            onChange={(e) => { addFiles(Array.from(e.target.files ?? [])); e.currentTarget.value = '' }} />
        </label>
        <button type="button" className="text-plum-900 underline-offset-4 hover:underline" onClick={() => save([...items, { url: '', caption: '' }])}>
          + Add by link
        </button>
      </div>
      {error && <p role="alert" className="text-xs text-red-700">{error}</p>}
    </div>
  )
}
