import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import { formatKES, formatOrderNo } from '@/lib/format'
import { buildInviteDefaults } from '@/lib/inviteDefaults'
import { Button } from '@/components/ui/Button'
import { Field, inputClass } from '@/components/ui/Field'
import { PaymentBadge } from '@/pages/orders/Badges'
import type { InvitePackage, InviteTemplate, InviteTemplateKey, Order } from '@/types/database'

type OrderRow = Order & { clients: { name: string } | null; invites: { id: string }[] }

export function OrderPickerModal({ templates, onClose, onCreated }: {
  templates: InviteTemplate[]
  onClose: () => void
  onCreated: (inviteId: string) => void
}) {
  const { active } = useBusiness()
  const navigate = useNavigate()
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [orderId, setOrderId] = useState('')
  const [template, setTemplate] = useState<InviteTemplateKey>(templates[0]?.key ?? 'editorial')
  const [pkg, setPkg] = useState<InvitePackage>('essential')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!active) return
    supabase
      .from('orders')
      .select('*, clients(name), invites(id)')
      .eq('business_id', active.id)
      .in('payment_status', ['partial', 'paid'])
      .order('order_no', { ascending: false })
      .then(({ data }) => {
        setOrders(((data ?? []) as unknown as OrderRow[]).filter((o) => o.invites.length === 0))
        setLoading(false)
      })
  }, [active])

  const selected = orders.find((o) => o.id === orderId)

  async function create() {
    if (!active || !orderId) return setError('Choose an order first.')
    setBusy(true)
    setError(null)
    const defaults = buildInviteDefaults(template, pkg)
    const content = {
      couple_names: selected?.clients?.name ?? '',
      event_name: '', event_date: '', event_time: '', venue: '',
      description: '', dress_code: '', schedule: [],
    }
    const { data, error: err } = await supabase
      .from('invites')
      .insert({ business_id: active.id, order_id: orderId, template, package: pkg, content, tokens: defaults.tokens, sections: defaults.sections, status: 'draft' })
      .select('id')
      .single()
    setBusy(false)
    if (err) return setError(err.message)
    onCreated(data.id)
    navigate(`/invites/${data.id}`)
  }

  return (
    <div className="space-y-4">
      {loading ? (
        <p className="text-sm text-muted">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-sm text-muted">No part-paid or paid orders without an invite yet.</p>
      ) : (
        <>
          <Field label="Order" htmlFor="pick-order">
            <select id="pick-order" value={orderId} onChange={(e) => setOrderId(e.target.value)} className={inputClass}>
              <option value="">Select an order</option>
              {orders.map((o) => <option key={o.id} value={o.id}>{formatOrderNo(o.order_no)} · {o.clients?.name} · {formatKES(o.total_kes)}</option>)}
            </select>
          </Field>
          {selected && <PaymentBadge value={selected.payment_status} />}

          <Field label="Template" htmlFor="pick-template">
            <select id="pick-template" value={template} onChange={(e) => setTemplate(e.target.value as InviteTemplateKey)} className={inputClass}>
              {templates.map((t) => <option key={t.key} value={t.key}>{t.label}</option>)}
            </select>
          </Field>

          <Field label="Package" htmlFor="pick-package">
            <select id="pick-package" value={pkg} onChange={(e) => setPkg(e.target.value as InvitePackage)} className={inputClass}>
              <option value="essential">Essential</option>
              <option value="signature">Signature</option>
              <option value="experience">Experience</option>
            </select>
          </Field>

          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button onClick={create} disabled={busy || !orderId}>{busy ? 'Creating…' : 'Create invite'}</Button>
          </div>
        </>
      )}
    </div>
  )
}