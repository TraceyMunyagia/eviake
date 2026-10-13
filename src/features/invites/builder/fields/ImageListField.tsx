import { useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { ACCEPT, MediaError, removeInviteMedia, uploadInviteMedia } from '@/lib/uploadInviteMedia'
import { usePanel } from '../content/PanelContext'

/** Several photos stored as a list of URLs (e.g. dress-code inspiration). */
export function ImageListField({ path, label, hint, slot, max = 8 }: { path: string; label: string; hint?: string; slot: string; max?: number }) {
  const { invite, get, updateInvite } = usePanel()
  const list: string[] = Array.isArray(get(path)) ? get(path) : []
  const fileInput = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(0)
  const [errors, setErrors] = useState<string[]>([])

  const edit = (fn: (urls: string[]) => string[]) =>
    updateInvite((current) => ({ content: { ...current.content, [path]: fn((current.content[path] as string[] | undefined) ?? []) } }))

  async function addFiles(files: FileList | null) {
    if (!files?.length) return
    const picked = Array.from(files).slice(0, Math.max(max - list.length, 0))
    const problems: string[] = []
    setErrors([])
    setBusy(picked.length)
    for (const file of picked) {
      try {
        const { url } = await uploadInviteMedia({ businessId: invite.business_id, inviteId: invite.id, file, slot })
        edit((urls) => [...urls, url])
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
    <div>
      <p className="text-sm font-medium">{label}</p>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        {list.map((url, i) => (
          <div key={`${url}-${i}`} className="relative">
            <img src={url} alt="" className="size-16 rounded-lg border border-line object-cover" />
            <button type="button" aria-label={`Remove image ${i + 1}`} onClick={() => { void removeInviteMedia(url, invite.business_id); edit((urls) => urls.filter((_, k) => k !== i)) }}
              className="absolute -right-1.5 -top-1.5 grid size-5 place-items-center rounded-full bg-white text-xs shadow ring-1 ring-line hover:bg-red-50">×</button>
          </div>
        ))}
        {list.length < max && (
          <button type="button" disabled={busy > 0} onClick={() => fileInput.current?.click()}
            className="grid size-16 place-items-center rounded-lg border border-dashed border-line text-xs text-muted hover:bg-gold-100 disabled:opacity-60">
            {busy > 0 ? <Loader2 className="size-4 animate-spin" /> : '+ Add'}
          </button>
        )}
      </div>
      <input ref={fileInput} type="file" multiple accept={ACCEPT.image} className="sr-only" aria-label={`Add ${label.toLowerCase()}`} onChange={(e) => void addFiles(e.target.files)} />
      {errors.map((e, i) => <p key={i} role="alert" className="mt-1 text-xs text-red-700">{e}</p>)}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
