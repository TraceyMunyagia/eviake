import { useState } from 'react'
import { inputClass } from '@/components/ui/Field'
import { usePanel } from '../content/PanelContext'

const fieldId = (path: string) => `m-${path.replace(/\W/g, '-')}`

/** One image: upload from the device or paste a link. */
export function MediaInput({ path, label, hint }: { path: string; label: string; hint?: string }) {
  const { get, setPath, upload } = usePanel()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const url: string = get(path) ?? ''
  const id = fieldId(path)

  async function pick(file: File | undefined) {
    if (!file) return
    setBusy(true)
    setError(null)
    try { setPath(path, await upload(file)) }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not upload the image.') }
    finally { setBusy(false) }
  }

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium">{label}</label>
      <div className="mt-1 flex items-start gap-3">
        {url ? (
          <img src={url} alt="" className="size-14 shrink-0 rounded-lg border border-line object-cover" />
        ) : (
          <div className="grid size-14 shrink-0 place-items-center rounded-lg border border-dashed border-line text-[10px] text-muted">No image</div>
        )}
        <div className="min-w-0 flex-1 space-y-1.5">
          <input id={id} value={url} placeholder="Paste an image link, or upload" onChange={(e) => setPath(path, e.target.value)} className={inputClass.replace('mt-1 ', '')} />
          <div className="flex items-center gap-3 text-xs">
            <label className="cursor-pointer rounded-md bg-gold-100 px-2.5 py-1 font-medium text-ink">
              {busy ? 'Uploading…' : 'Upload'}
              <input type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(e) => { pick(e.target.files?.[0]); e.currentTarget.value = '' }} />
            </label>
            {url && <button type="button" className="text-muted hover:text-ink" onClick={() => setPath(path, '')}>Remove</button>}
          </div>
        </div>
      </div>
      {error && <p role="alert" className="mt-1 text-xs text-red-700">{error}</p>}
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  )
}
