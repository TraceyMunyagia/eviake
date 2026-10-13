import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { inputClass } from '@/components/ui/Field'
import { ACCEPT, MediaError, removeInviteMedia, uploadInviteMedia, type MediaKind } from '@/lib/uploadInviteMedia'
import { usePanel } from '../content/PanelContext'

const fieldId = (path: string) => `m-${path.replace(/\W/g, '-')}`

/** One photo, video or audio file: upload (click or drop) or paste a link. Replacing or removing deletes the old upload. */
export function MediaInput({ path, label, hint, slot, kind = 'image' }: { path: string; label: string; hint?: string; slot?: string; kind?: MediaKind }) {
  const { invite, get, setPath } = usePanel()
  const url: string = get(path) ?? ''
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [link, setLink] = useState(false)
  const [drag, setDrag] = useState(false)
  const input = useRef<HTMLInputElement>(null)
  const id = fieldId(path)

  async function handle(file: File | undefined) {
    if (!file) return
    setError(null)
    setBusy(true)
    try {
      const { url: next } = await uploadInviteMedia({ businessId: invite.business_id, inviteId: invite.id, file, kind, slot: slot ?? path })
      const prev = url
      setPath(path, next)
      if (prev) void removeInviteMedia(prev, invite.business_id)
    } catch (e) {
      setError(e instanceof MediaError ? e.message : 'Upload failed. Check your connection and try again.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  function remove() {
    if (url) void removeInviteMedia(url, invite.business_id)
    setPath(path, '')
  }

  const thumb = 'size-14 shrink-0 rounded-lg border border-line object-cover'
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <div
        onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => { e.preventDefault(); setDrag(false); void handle(e.dataTransfer.files?.[0]) }}
        className={`mt-1 flex items-center gap-3 rounded-xl border border-dashed p-2 ${drag ? 'border-gold-500 bg-gold-100' : 'border-line bg-white'}`}
      >
        {url ? (
          kind === 'video' ? <video src={url} muted preload="metadata" className={thumb} />
            : kind === 'audio' ? <audio src={url} controls preload="none" className="h-10 w-40" />
              : <img src={url} alt="" className={thumb} />
        ) : (
          <div className="grid size-14 shrink-0 place-items-center rounded-lg bg-gold-100/60 text-[10px] capitalize text-muted">{kind}</div>
        )}
        <div className="flex flex-1 flex-wrap items-center gap-x-3 gap-y-1 text-sm">
          <input ref={input} id={id} type="file" className="sr-only" accept={ACCEPT[kind]} onChange={(e) => void handle(e.target.files?.[0])} />
          <button type="button" disabled={busy} onClick={() => input.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-white px-3 py-1.5 font-medium hover:bg-gold-100 disabled:opacity-60">
            {busy && <Loader2 className="size-3.5 animate-spin" />}
            {busy ? 'Uploading…' : url ? 'Replace' : `Choose ${kind === 'image' ? 'photo' : kind}`}
          </button>
          {url && !busy && <button type="button" className="text-xs text-red-700 underline underline-offset-4" onClick={remove}>Remove</button>}
          <button type="button" className="text-xs text-muted underline underline-offset-4" onClick={() => setLink((v) => !v)}>
            {link ? 'Hide link' : 'Use a link instead'}
          </button>
          {!url && !busy && <span className="text-xs text-muted">or drop a file here</span>}
        </div>
      </div>
      {link && <input aria-label={`${label} link`} value={url} placeholder="https://…" onChange={(e) => setPath(path, e.target.value)} className={inputClass} />}
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
