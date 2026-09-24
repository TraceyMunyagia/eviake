import { useState } from 'react'
import { Download } from 'lucide-react'
import { functionsUrl, supabase, supabaseAnonKey } from '@/lib/supabase'
import { formatQuoteNo } from '@/lib/quote'
import { Button } from '@/components/ui/Button'
import type { Quote } from '@/types/database'

export function PdfButton({ quote }: { quote: Quote }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function download() {
    setBusy(true)
    setError(null)
    try {
      const { data } = await supabase.auth.getSession()
      const res = await fetch(`${functionsUrl}/quote-pdf?id=${quote.id}`, {
        headers: {
          Authorization: `Bearer ${data.session?.access_token ?? ''}`,
          apikey: supabaseAnonKey,
        },
      })
      if (!res.ok) throw new Error(String(res.status))
      const href = URL.createObjectURL(await res.blob())
      const a = document.createElement('a')
      a.href = href
      a.download = `${formatQuoteNo(quote.quote_no)}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      setTimeout(() => URL.revokeObjectURL(href), 10_000)
    } catch {
      setError('Could not create the PDF. Check that the quote-pdf function is deployed.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Button variant="secondary" disabled={busy} onClick={download}>
        <Download className="size-4" /> {busy ? 'Creating…' : 'Download PDF'}
      </Button>
      {error && <span role="alert" className="text-sm text-red-700">{error}</span>}
    </>
  )
}