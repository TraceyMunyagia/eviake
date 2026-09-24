import { useState, type FormEvent } from 'react'
import { ExternalLink } from 'lucide-react'
import { useProjectDetails } from '@/hooks/useProjectDetails'
import { Button } from '@/components/ui/Button'
import { TextArea, TextInput } from '@/components/ui/Field'
import type { Order, ProjectDetails } from '@/types/database'

export function WebsiteTab({ order }: { order: Order }) {
  const { details, loading, save } = useProjectDetails(order)
  if (loading) return <p className="mt-6 text-sm text-muted">Loading…</p>
  return <WebsiteForm details={details} save={save} />
}

function WebsiteForm({ details, save }: {
  details: ProjectDetails | null
  save: (v: Partial<ProjectDetails>) => Promise<string | null>
}) {
  const [websiteUrl, setWebsiteUrl] = useState(details?.website_url ?? '')
  const [stagingUrl, setStagingUrl] = useState(details?.staging_url ?? '')
  const [cms, setCms] = useState(details?.cms ?? '')
  const [notes, setNotes] = useState(details?.deployment_notes ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const err = await save({
      website_url: websiteUrl.trim() || null,
      staging_url: stagingUrl.trim() || null,
      cms: cms.trim() || null,
      deployment_notes: notes.trim() || null,
    })
    setBusy(false)
    setMessage(err ? { ok: false, text: err } : { ok: true, text: 'Saved.' })
  }

  const link = (url: string, label: string) =>
    url.trim() ? (
      <a href={url.trim()} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-sm text-plum-900 underline">
        {label} <ExternalLink className="size-3.5" />
      </a>
    ) : null

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg text-plum-900">Website</h2>
      <TextInput id="w-url" label="Live website address" type="url" placeholder="https://" value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} />
      <TextInput id="w-staging" label="Preview / staging address" type="url" placeholder="https://" value={stagingUrl} onChange={(e) => setStagingUrl(e.target.value)} />
      <div className="flex gap-4">{link(websiteUrl, 'Open live site')}{link(stagingUrl, 'Open preview')}</div>
      <TextInput id="w-cms" label="CMS / platform" list="cms-options" placeholder="For example WordPress, Next.js, Webflow" value={cms} onChange={(e) => setCms(e.target.value)} />
      <datalist id="cms-options">
        <option value="WordPress" /><option value="Next.js" /><option value="React" /><option value="Webflow" /><option value="Shopify" /><option value="Custom" />
      </datalist>
      <TextArea id="w-deploy" label="Deployment notes (where it is hosted, logins kept elsewhere, how to update)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-sm text-green-800' : 'text-sm text-red-700'}>{message.text}</p>}
      <Button disabled={busy}>{busy ? 'Saving…' : 'Save website details'}</Button>
    </form>
  )
}