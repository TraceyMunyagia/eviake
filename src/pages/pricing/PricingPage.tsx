import { useCallback, useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatKES } from '@/lib/format'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { PriceForm } from '@/pages/pricing/PriceForm'
import type { PriceItem } from '@/types/database'

type Editing = { kind: PriceItem['kind']; item: PriceItem | null } | null

export function PricingPage() {
  const { active } = useBusiness()
  const [items, setItems] = useState<PriceItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [editing, setEditing] = useState<Editing>(null)

  const load = useCallback(async () => {
    if (!active) return
    const { data, error: err } = await supabase
      .from('price_items')
      .select('*')
      .eq('business_id', active.id)
      .order('sort_order')
      .order('name')
    setError(err ? err.message : null)
    setItems((data ?? []) as PriceItem[])
  }, [active])

  useEffect(() => {
    load()
  }, [load])

  if (!active) return null

  const section = (kind: PriceItem['kind'], title: string, hint: string) => {
    const list = items.filter((i) => i.kind === kind)
    const nextOrder = (list[list.length - 1]?.sort_order ?? 0) + 10
    return (
      <section className="mb-10">
        <div className="mb-3 flex items-end justify-between gap-3">
          <div>
            <h2 className="font-display text-xl text-plum-900">{title}</h2>
            <p className="text-sm text-muted">{hint}</p>
          </div>
          <Button variant="secondary" onClick={() => setEditing({ kind, item: null })}>
            <Plus className="size-4" /> Add
          </Button>
        </div>
        <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Description</th>
                <th className="px-4 py-3 font-medium">Price</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {list.map((i) => (
                <tr key={i.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setEditing({ kind, item: i })}
                      className="font-medium text-plum-900 hover:underline"
                    >
                      {i.name}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted">{i.description ?? ''}</td>
                  <td className="px-4 py-3">{formatKES(i.price_kes)}</td>
                  <td className="px-4 py-3">
                    <StatusBadge tone={i.active ? 'live' : 'neutral'}>{i.active ? 'Active' : 'Hidden'}</StatusBadge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {list.length === 0 && <p className="p-6 text-center text-sm text-muted">Nothing here yet.</p>}
        </div>
        {editing && editing.kind === kind && (
          <Modal
            open
            onClose={() => setEditing(null)}
            title={editing.item ? `Edit ${editing.item.name}` : `Add ${kind === 'package' ? 'package' : kind === 'addon' ? 'add-on' : 'care plan'}`}
          >
            <PriceForm
              business={active}
              kind={kind}
              item={editing.item}
              nextOrder={nextOrder}
              onClose={() => setEditing(null)}
              onSaved={() => {
                setEditing(null)
                load()
              }}
            />
          </Modal>
        )}
      </section>
    )
  }

  return (
    <div>
      <PageHeader title="Pricing" subtitle="Change a price here and every new order uses it. No code changes needed." />
      {error && <p role="alert" className="mb-4 text-sm text-red-700">Could not load pricing: {error}</p>}
      {section('package', 'Packages', 'The main options a client chooses from.')}
      {active.slug === 'evia_web' && section('addon', 'Add-ons', 'Extras that add to a package price.')}
      {active.slug === 'evia_web' && section('care', 'Monthly care', 'Recurring website care and hosting plans, priced per month.')}
    </div>
  )
}
