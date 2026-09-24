import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import type { Quote, QuoteStatus } from '@/types/database'
import { PdfButton } from '@/components/quotes/PdfButton'
import { SendButtons } from '@/components/quotes/SendButtons'

export function QuoteToolbar({ quote, locked, onChanged }: {
  quote: Quote
  locked: boolean
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function setStatus(status: QuoteStatus) {
    setBusy(true)
    setError(null)
    const { error: err } = await supabase.from('quotes').update({ status }).eq('id', quote.id)
    setBusy(false)
    if (err) return setError(err.message)
    onChanged()
  }

  const disabled = busy || locked

  return (
    <div className="mb-6 rounded-2xl border border-line bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {quote.status === 'draft' && (
          <Button disabled={disabled} onClick={() => setStatus('sent')}>Mark as sent</Button>
        )}
        {quote.status === 'sent' && (
          <>
            <Button disabled={disabled} onClick={() => setStatus('accepted')}>Mark as accepted</Button>
            <Button variant="secondary" disabled={disabled} onClick={() => setStatus('rejected')}>Mark as rejected</Button>
            <Button variant="ghost" disabled={disabled} onClick={() => setStatus('draft')}>Back to draft</Button>
          </>
        )}
        {(quote.status === 'accepted' || quote.status === 'rejected') && (
          <Button variant="secondary" disabled={disabled} onClick={() => setStatus('sent')}>Reopen as sent</Button>
        )}
      <PdfButton quote={quote} />
      {quote.status !== 'rejected' && (
        <SendButtons quote={quote} disabled={disabled} onChanged={onChanged} />
      )}
      </div>
      {locked && <p className="mt-2 text-sm text-muted">Save your changes before changing the status.</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
    </div>
  )
}
