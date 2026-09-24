import { useState } from 'react'
import { Copy, Mail, MessageCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate, formatKES } from '@/lib/format'
import { formatQuoteNo, mailtoLink, publicQuoteUrl, quoteMessage, whatsAppLink } from '@/lib/quote'
import { Button } from '@/components/ui/Button'
import type { Quote } from '@/types/database'

export function SendButtons({ quote, disabled, onChanged }: {
  quote: Quote
  disabled: boolean
  onChanged: () => void
}) {
  const [copied, setCopied] = useState(false)
  const url = publicQuoteUrl(quote.public_token)
  const message = quoteMessage({
    clientName: quote.clients?.name ?? '',
    quoteNo: quote.quote_no,
    total: quote.total_kes,
    monthly: quote.monthly_kes,
    validUntil: quote.valid_until,
    url,
    formatKES,
    formatDate,
  })

  async function markSentIfDraft() {
    if (quote.status !== 'draft') return
    const { error } = await supabase.from('quotes').update({ status: 'sent' }).eq('id', quote.id)
    if (!error) onChanged()
  }

  function whatsapp() {
    window.open(whatsAppLink(quote.clients?.phone, message), '_blank', 'noopener')
    markSentIfDraft()
  }

  function email() {
    const subject = `Website quotation ${formatQuoteNo(quote.quote_no)} from Evia Web`
    window.location.href = mailtoLink(quote.clients?.email, subject, message)
    markSentIfDraft()
  }

  async function copy() {
    if (
      quote.status === 'draft' &&
      !window.confirm('The link only works once the quote is sent. Mark this quote as sent and copy the link?')
    ) {
      return
    }
    await navigator.clipboard.writeText(url)
    await markSentIfDraft()
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <Button variant="secondary" disabled={disabled} onClick={whatsapp}>
        <MessageCircle className="size-4" /> Send via WhatsApp
      </Button>
      <Button variant="secondary" disabled={disabled} onClick={email}>
        <Mail className="size-4" /> Send via email
      </Button>
      <Button variant="secondary" disabled={disabled} onClick={copy}>
        <Copy className="size-4" /> {copied ? 'Link copied' : 'Copy public link'}
      </Button>
    </>
  )
}