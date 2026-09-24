import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useProjectDetails } from '@/hooks/useProjectDetails'
import { Button } from '@/components/ui/Button'
import { TextArea, TextInput } from '@/components/ui/Field'
import type { ChecklistItem, Order, ProjectDetails } from '@/types/database'

const STANDARD_ITEMS = [
  'Logo',
  'Brand colours',
  'About text',
  'Services or products list',
  'Photos',
  'Contact details',
  'Social media links',
  'Testimonials',
]

export function RequirementsTab({ order }: { order: Order }) {
  const { details, loading, save } = useProjectDetails(order)
  return (
    <div className="mt-6 grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2">
        {loading ? <p className="text-sm text-muted">Loading…</p> : <RequirementsForm details={details} save={save} />}
      </div>
      <Checklist order={order} />
    </div>
  )
}

function RequirementsForm({ details, save }: {
  details: ProjectDetails | null
  save: (v: Partial<ProjectDetails>) => Promise<string | null>
}) {
  const [summary, setSummary] = useState(details?.business_summary ?? '')
  const [goals, setGoals] = useState(details?.website_goals ?? '')
  const [pages, setPages] = useState(details?.pages_needed ?? '')
  const [refs, setRefs] = useState(details?.reference_sites ?? '')
  const [tech, setTech] = useState(details?.technical_notes ?? '')
  const [assets, setAssets] = useState(details?.assets_url ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const err = await save({
      business_summary: summary.trim() || null,
      website_goals: goals.trim() || null,
      pages_needed: pages.trim() || null,
      reference_sites: refs.trim() || null,
      technical_notes: tech.trim() || null,
      assets_url: assets.trim() || null,
    })
    setBusy(false)
    setMessage(err ? { ok: false, text: err } : { ok: true, text: 'Saved.' })
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h2 className="font-display text-lg text-plum-900">Requirements</h2>
      <TextArea id="r-summary" label="About the business" value={summary} onChange={(e) => setSummary(e.target.value)} />
      <TextArea id="r-goals" label="What the website should achieve" value={goals} onChange={(e) => setGoals(e.target.value)} />
      <TextArea id="r-pages" label="Pages needed (one per line)" value={pages} onChange={(e) => setPages(e.target.value)} />
      <TextArea id="r-refs" label="Inspiration and reference websites (one per line)" value={refs} onChange={(e) => setRefs(e.target.value)} />
      <TextArea id="r-tech" label="Technical requirements (domain, WhatsApp number, integrations)" value={tech} onChange={(e) => setTech(e.target.value)} />
      <TextInput id="r-assets" label="Link to logo, photos and brand files (Drive, Dropbox)" type="url" placeholder="https://" value={assets} onChange={(e) => setAssets(e.target.value)} />
      {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-sm text-green-800' : 'text-sm text-red-700'}>{message.text}</p>}
      <Button disabled={busy}>{busy ? 'Saving…' : 'Save requirements'}</Button>
    </form>
  )
}

function Checklist({ order }: { order: Order }) {
  const [items, setItems] = useState<ChecklistItem[]>([])
  const [loading, setLoading] = useState(true)
  const [label, setLabel] = useState('')
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('project_checklist')
      .select('*')
      .eq('order_id', order.id)
      .order('sort_order')
      .order('created_at')
    setError(err ? err.message : null)
    setItems((data ?? []) as ChecklistItem[])
    setLoading(false)
  }, [order.id])

  useEffect(() => {
    load()
  }, [load])

  const nextOrder = (items[items.length - 1]?.sort_order ?? 0) + 10

  async function add(labels: string[]) {
    const rows = labels.map((l, i) => ({
      business_id: order.business_id,
      order_id: order.id,
      label: l,
      sort_order: nextOrder + i * 10,
    }))
    const { error: err } = await supabase.from('project_checklist').insert(rows)
    if (err) return setError(err.message)
    await load()
  }

  async function toggle(item: ChecklistItem) {
    setItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, done: !i.done } : i)))
    const { error: err } = await supabase.from('project_checklist').update({ done: !item.done }).eq('id', item.id)
    if (err) {
      setError(err.message)
      load()
    }
  }

  async function remove(item: ChecklistItem) {
    setItems((prev) => prev.filter((i) => i.id !== item.id))
    const { error: err } = await supabase.from('project_checklist').delete().eq('id', item.id)
    if (err) {
      setError(err.message)
      load()
    }
  }

  const done = items.filter((i) => i.done).length

  return (
    <section className="h-fit rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-1 flex items-baseline justify-between">
        <h2 className="font-display text-lg text-plum-900">Content checklist</h2>
        {items.length > 0 && <span className="text-sm text-muted">{done} / {items.length} ready</span>}
      </div>
      <p className="mb-4 text-sm text-muted">What the client still needs to send.</p>

      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}

      {!loading && items.length === 0 && (
        <Button variant="secondary" onClick={() => add(STANDARD_ITEMS)} className="mb-4">
          Add standard checklist
        </Button>
      )}

      <ul className="space-y-1">
        {items.map((i) => (
          <li key={i.id} className="flex items-center gap-3 rounded-lg px-1 py-1.5 text-sm hover:bg-gold-100">
            <label className="flex flex-1 items-center gap-3">
              <input type="checkbox" checked={i.done} onChange={() => toggle(i)} className="size-4 accent-plum-800" />
              <span className={i.done ? 'text-muted line-through' : ''}>{i.label}</span>
            </label>
            <button aria-label={`Remove ${i.label}`} onClick={() => remove(i)} className="rounded p-1 text-muted hover:text-red-700">
              <Trash2 className="size-4" />
            </button>
          </li>
        ))}
      </ul>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          const text = label.trim()
          if (!text) return
          setLabel('')
          add([text])
        }}
        className="mt-4 flex gap-2"
      >
        <input
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Add an item"
          aria-label="New checklist item"
          className="w-full rounded-lg border border-line px-3 py-2 text-sm"
        />
        <Button variant="secondary" aria-label="Add item"><Plus className="size-4" /></Button>
      </form>
    </section>
  )
}