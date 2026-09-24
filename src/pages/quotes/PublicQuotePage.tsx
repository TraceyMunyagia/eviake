import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Download } from 'lucide-react'
import { functionsUrl, supabase } from '@/lib/supabase'
import { formatDate, formatKES } from '@/lib/format'
import { formatQuoteNo, lineTotal } from '@/lib/quote'
import type { QuoteDocument } from '@/types/database'

export function PublicQuotePage() {
  const { token } = useParams()
  const [doc, setDoc] = useState<QuoteDocument | null | undefined>(undefined)

  useEffect(() => {
    if (!token) {
      setDoc(null)
      return
    }
    supabase.rpc('get_public_quote', { p_token: token }).then(({ data, error }) => {
      setDoc(error ? null : (data as QuoteDocument | null))
    })
  }, [token])

  if (doc === undefined) {
    return <div className="grid min-h-screen place-items-center bg-cream text-sm text-muted">Loading quote…</div>
  }

  if (doc === null) {
    return (
      <div className="grid min-h-screen place-items-center bg-cream p-6">
        <div className="max-w-md rounded-2xl border border-line bg-white p-8 text-center">
          <h1 className="font-display text-2xl text-plum-900">Quote not available</h1>
          <p className="mt-2 text-sm text-muted">
            This link is not valid, or the quote has not been sent yet. Please contact Evia Web for a new link.
          </p>
        </div>
      </div>
    )
  }

  const today = new Date().toISOString().slice(0, 10)
  const expired = doc.status === 'sent' && !!doc.valid_until && doc.valid_until < today

  return (
    <div className="min-h-screen bg-cream p-4 sm:p-8">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
        <header className="flex items-end justify-between bg-plum-900 px-6 py-6 sm:px-8">
          <span className="font-display text-3xl tracking-wide text-gold-400">Evia</span>
          <div className="text-right">
            <p className="text-xs font-medium tracking-widest text-gold-400">QUOTATION</p>
            <p className="font-display text-2xl text-white">{formatQuoteNo(doc.quote_no)}</p>
          </div>
        </header>

        <div className="space-y-8 p-6 sm:p-8">
          {doc.status === 'accepted' && (
            <p className="rounded-lg bg-green-100 px-4 py-3 text-sm text-green-900">This quote has been accepted. Thank you!</p>
          )}
          {doc.status === 'rejected' && (
            <p className="rounded-lg bg-stone-100 px-4 py-3 text-sm text-stone-700">This quote is no longer open.</p>
          )}
          {expired && (
            <p className="rounded-lg bg-yellow-100 px-4 py-3 text-sm text-yellow-900">
              This quote has expired. Please contact {doc.business_name} for an updated one.
            </p>
          )}

          <div className="flex flex-wrap justify-between gap-6 text-sm">
            <div>
              <p className="text-xs font-medium tracking-widest text-muted">PREPARED FOR</p>
              <p className="mt-1 text-base font-medium">{doc.client_name}</p>
              {doc.client_business_name && <p className="text-muted">{doc.client_business_name}</p>}
            </div>
            <dl className="grid grid-cols-[auto_auto] gap-x-6 gap-y-1">
              <dt className="text-muted">Issued</dt><dd className="text-right font-medium">{formatDate(doc.sent_at ?? doc.created_at)}</dd>
              <dt className="text-muted">Valid until</dt><dd className="text-right font-medium">{formatDate(doc.valid_until)}</dd>
              <dt className="text-muted">From</dt><dd className="text-right font-medium">{doc.business_name}</dd>
            </dl>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-line text-xs tracking-wider text-muted">
                <tr>
                  <th className="py-2.5 pr-3 font-medium">DESCRIPTION</th>
                  <th className="px-3 py-2.5 text-right font-medium">QTY</th>
                  <th className="px-3 py-2.5 text-right font-medium">UNIT PRICE</th>
                  <th className="py-2.5 pl-3 text-right font-medium">AMOUNT</th>
                </tr>
              </thead>
              <tbody>
                {doc.items.map((i, idx) => (
                  <tr key={idx} className="border-b border-line">
                    <td className="py-3 pr-3">
                      <p className="font-medium">{i.name}</p>
                      {i.description && <p className="text-muted">{i.description}</p>}
                    </td>
                    <td className="px-3 py-3 text-right">{i.quantity}</td>
                    <td className="px-3 py-3 text-right">{formatKES(i.unit_price_kes)}</td>
                    <td className="py-3 pl-3 text-right font-medium">{formatKES(lineTotal(i))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="ml-auto max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-muted"><span>Subtotal</span><span>{formatKES(doc.subtotal_kes)}</span></div>
            {doc.discount_kes > 0 && (
              <div className="flex justify-between text-muted"><span>Discount</span><span>– {formatKES(doc.discount_kes)}</span></div>
            )}
            <div className="flex items-baseline justify-between border-t border-gold-500 pt-2 font-medium">
              <span>Website setup</span>
              <span className="font-display text-2xl text-plum-900">{formatKES(doc.total_kes)}</span>
            </div>
            {doc.monthly_kes > 0 && (
              <div className="flex items-baseline justify-between pt-1">
                <span className="font-medium">Monthly care</span>
                <span className="font-medium">{formatKES(doc.monthly_kes)} / month</span>
              </div>
            )}
            {doc.monthly_kes > 0 && doc.care_name && <p className="text-xs text-muted">{doc.care_name}</p>}
          </div>

          {doc.notes && (
            <div>
              <p className="text-xs font-medium tracking-widest text-muted">NOTES</p>
              <p className="mt-1 whitespace-pre-wrap text-sm">{doc.notes}</p>
            </div>
          )}

          <a
            href={`${functionsUrl}/quote-pdf?token=${encodeURIComponent(token ?? '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg bg-gold-500 px-4 py-2.5 text-sm font-medium text-plum-950 hover:bg-gold-400"
          >
            <Download className="size-4" /> Download PDF
          </a>
        </div>
      </div>
    </div>
  )
}
