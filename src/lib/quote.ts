import type { Tone } from '@/components/ui/StatusBadge'
import type { QuoteItem, QuoteStatus } from '@/types/database'

export function formatQuoteNo(n: number) {
  return `Q-${String(n).padStart(4, '0')}`
}

export const QUOTE_LABEL: Record<QuoteStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  rejected: 'Rejected',
}

export const QUOTE_TONE: Record<QuoteStatus, Tone> = {
  draft: 'neutral',
  sent: 'progress',
  accepted: 'live',
  rejected: 'overdue',
}

export function lineTotal(item: Pick<QuoteItem, 'quantity' | 'unit_price_kes'>) {
  return item.quantity * item.unit_price_kes
}

export function computeTotals(items: Pick<QuoteItem, 'quantity' | 'unit_price_kes'>[], discount: number) {
  const subtotal = items.reduce((sum, i) => sum + lineTotal(i), 0)
  return { subtotal, total: Math.max(subtotal - Math.max(discount, 0), 0) }
}

export function publicQuoteUrl(token: string) {
  const base = (import.meta.env.VITE_PUBLIC_APP_URL as string | undefined) || window.location.origin
  return `${base.replace(/\/$/, '')}/q/${token}`
}

// 0712 345 678, +254 712 345 678 and 712345678 all become 254712345678
export function toWhatsAppNumber(phone: string | null | undefined) {
  const digits = (phone ?? '').replace(/\D/g, '')
  if (!digits) return null
  if (digits.startsWith('254')) return digits
  if (digits.startsWith('0')) return `254${digits.slice(1)}`
  if (digits.length === 9) return `254${digits}`
  return digits
}

export function quoteMessage(args: {
  clientName: string
  quoteNo: number
  total: number
  monthly: number
  validUntil: string | null
  url: string
  formatKES: (n: number) => string
  formatDate: (s: string | null) => string
}) {
  const first = args.clientName.trim().split(/\s+/)[0] || 'there'
  const lines = [
    `Hi ${first}, here is your website quotation ${formatQuoteNo(args.quoteNo)} from Evia Web.`,
    '',
    `Website setup: ${args.formatKES(args.total)}`,
  ]
  if (args.monthly > 0) lines.push(`Website care & hosting: ${args.formatKES(args.monthly)}/month`)
  lines.push('', `View and download it here: ${args.url}`)
  if (args.validUntil) lines.push('', `This quote is valid until ${args.formatDate(args.validUntil)}.`)
  return lines.join('\n')
}

export function whatsAppLink(phone: string | null | undefined, message: string) {
  const number = toWhatsAppNumber(phone)
  return `https://wa.me/${number ?? ''}?text=${encodeURIComponent(message)}`
}

export function mailtoLink(email: string | null | undefined, subject: string, body: string) {
  return `mailto:${email ?? ''}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
}