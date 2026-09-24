import { formatKES } from '@/lib/format'
import { lineTotal } from '@/lib/quote'
import type { QuoteItem } from '@/types/database'

export function QuoteSummary({ items, subtotal, discount, total, careName, monthly }: {
  items: QuoteItem[]
  subtotal: number
  discount: number
  total: number
  careName: string | null
  monthly: number
}) {
  return (
    <div className="rounded-2xl border border-line bg-white p-5 shadow-sm">
      <h2 className="mb-4 font-display text-lg text-plum-900">Quote summary</h2>

      {items.length === 0 ? (
        <p className="text-sm text-muted">Choose a package or add-ons to see the price.</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {items.map((i, idx) => (
            <li key={`${i.kind}-${i.name}-${idx}`} className="flex justify-between gap-3">
              <span>
                {i.name}
                {i.quantity > 1 && <span className="text-muted"> × {i.quantity}</span>}
              </span>
              <span className="shrink-0">{formatKES(lineTotal(i))}</span>
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 space-y-1.5 border-t border-line pt-4 text-sm">
        <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatKES(subtotal)}</span></div>
        {discount > 0 && (
          <div className="flex justify-between text-muted"><span>Discount</span><span>– {formatKES(discount)}</span></div>
        )}
        <div className="flex justify-between font-medium">
          <span>Website setup</span><span className="font-display text-xl text-plum-900">{formatKES(total)}</span>
        </div>
        {monthly > 0 && (
          <div className="flex justify-between text-muted">
            <span>{careName || 'Monthly care'}</span><span>{formatKES(monthly)} / month</span>
          </div>
        )}
      </div>
    </div>
  )
}