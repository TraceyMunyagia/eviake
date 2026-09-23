import { useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { TextArea, TextInput } from '@/components/ui/Field'
import type { Business, PriceItem } from '@/types/database'

export function PriceForm({ business, kind, item, nextOrder, onClose, onSaved }: {
  business: Business
  kind: PriceItem['kind']
  item: PriceItem | null
  nextOrder: number
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [price, setPrice] = useState(String(item?.price_kes ?? ''))
  const [active, setActive] = useState(item?.active ?? true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const values = {
      name: name.trim(),
      description: description.trim() || null,
      price_kes: Number(price) || 0,
      active,
    }
    const { error: err } = item
      ? await supabase.from('price_items').update(values).eq('id', item.id)
      : await supabase.from('price_items').insert({ ...values, business_id: business.id, kind, sort_order: nextOrder })
    setBusy(false)
    if (err) return setError(err.code === '23505' ? 'An item with that name already exists.' : err.message)
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextInput id="p-name" label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <TextArea id="p-desc" label="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
      <TextInput id="p-price" label="Price (KSh)" type="number" min={0} step={50} required value={price} onChange={(e) => setPrice(e.target.value)} />
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={active} onChange={(e) => setActive(e.target.checked)} className="size-4 accent-plum-800" />
        Active (available when creating orders)
      </label>
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={busy}>{busy ? 'Saving…' : item ? 'Save changes' : 'Add item'}</Button>
      </div>
    </form>
  )
}