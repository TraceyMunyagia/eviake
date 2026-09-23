import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { METHOD_LABELS, formatDate, formatKES } from '@/lib/format'
import { Button } from '@/components/ui/Button'
import { Field, TextInput, inputClass } from '@/components/ui/Field'
import { Modal } from '@/components/ui/Modal'
import type { Order, Payment } from '@/types/database'

export function PaymentsSection({ order, onChanged }: { order: Order; onChanged: () => void }) {
  const [payments, setPayments] = useState<Payment[]>([])
  const [adding, setAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', order.id)
      .order('paid_at', { ascending: false })
    setError(err ? err.message : null)
    setPayments((data ?? []) as Payment[])
  }, [order.id])

  useEffect(() => {
    load()
  }, [load])

  const paid = payments.reduce((sum, p) => sum + Number(p.amount_kes), 0)
  const balance = Math.max(Number(order.total_kes) - paid, 0)

  async function remove(p: Payment) {
    if (!window.confirm(`Delete the ${formatKES(p.amount_kes)} payment? This cannot be undone.`)) return
    const { error: err } = await supabase.from('payments').delete().eq('id', p.id)
    if (err) return setError(err.message)
    await load()
    onChanged()
  }

  return (
    <section className="mt-6 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-lg text-plum-900">Payments</h2>
        <Button variant="secondary" onClick={() => setAdding(true)}>
          <Plus className="size-4" /> Record payment
        </Button>
      </div>

      <dl className="mb-4 grid grid-cols-3 gap-4 text-sm">
        <div><dt className="text-muted">Total</dt><dd className="mt-1 font-medium">{formatKES(order.total_kes)}</dd></div>
        <div><dt className="text-muted">Paid</dt><dd className="mt-1 font-medium">{formatKES(paid)}</dd></div>
        <div><dt className="text-muted">Balance</dt><dd className="mt-1 font-medium">{formatKES(balance)}</dd></div>
      </dl>

      {error && <p role="alert" className="mb-3 text-sm text-red-700">{error}</p>}

      {payments.length === 0 ? (
        <p className="text-sm text-muted">No payments recorded yet.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-line text-muted">
              <tr>
                <th className="py-2 pr-4 font-medium">Date</th>
                <th className="py-2 pr-4 font-medium">Method</th>
                <th className="py-2 pr-4 font-medium">Reference</th>
                <th className="py-2 pr-4 font-medium">Amount</th>
                <th className="py-2"><span className="sr-only">Actions</span></th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="py-2 pr-4">{formatDate(p.paid_at)}</td>
                  <td className="py-2 pr-4">{p.method ? METHOD_LABELS[p.method] : '–'}</td>
                  <td className="py-2 pr-4">{p.reference ?? '–'}</td>
                  <td className="py-2 pr-4">{formatKES(p.amount_kes)}</td>
                  <td className="py-2 text-right">
                    <button aria-label="Delete payment" onClick={() => remove(p)} className="rounded-lg p-1.5 text-muted hover:bg-gold-100 hover:text-red-700">
                      <Trash2 className="size-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal open={adding} onClose={() => setAdding(false)} title="Record payment">
        {adding && (
          <PaymentForm
            order={order}
            defaultAmount={balance}
            onClose={() => setAdding(false)}
            onSaved={async () => {
              setAdding(false)
              await load()
              onChanged()
            }}
          />
        )}
      </Modal>
    </section>
  )
}

function PaymentForm({ order, defaultAmount, onClose, onSaved }: {
  order: Order
  defaultAmount: number
  onClose: () => void
  onSaved: () => void
}) {
  const [amount, setAmount] = useState(defaultAmount > 0 ? String(defaultAmount) : '')
  const [method, setMethod] = useState('mpesa')
  const [reference, setReference] = useState('')
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10))
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.from('payments').insert({
      business_id: order.business_id,
      order_id: order.id,
      amount_kes: Number(amount),
      method,
      reference: reference.trim() || null,
      paid_at: new Date(`${date}T12:00:00`).toISOString(),
    })
    setBusy(false)
    if (err) return setError(err.message)
    onSaved()
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <TextInput id="pay-amount" label="Amount (KSh)" type="number" min={1} step="any" required value={amount} onChange={(e) => setAmount(e.target.value)} />
      <Field label="Method" htmlFor="pay-method">
        <select id="pay-method" value={method} onChange={(e) => setMethod(e.target.value)} className={inputClass}>
          {Object.entries(METHOD_LABELS).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </Field>
      <TextInput id="pay-ref" label="Reference (for example the M-Pesa code)" value={reference} onChange={(e) => setReference(e.target.value)} />
      <TextInput id="pay-date" label="Date received" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
      {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
        <Button disabled={busy}>{busy ? 'Saving…' : 'Record payment'}</Button>
      </div>
    </form>
  )
}