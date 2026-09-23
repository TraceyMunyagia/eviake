import { StatusBadge, type Tone } from '@/components/ui/StatusBadge'
import type { OrderStatus, PaymentStatus } from '@/types/database'

export function OrderStatusBadge({ status, statuses }: { status: string; statuses: OrderStatus[] }) {
  const match = statuses.find((s) => s.key === status)
  return <StatusBadge tone={(match?.tone as Tone) ?? 'neutral'}>{match?.label ?? status}</StatusBadge>
}

const PAYMENT: Record<PaymentStatus, { label: string; tone: Tone }> = {
  unpaid: { label: 'Unpaid', tone: 'overdue' },
  partial: { label: 'Part paid', tone: 'pending' },
  paid: { label: 'Paid', tone: 'live' },
}

export function PaymentBadge({ value }: { value: PaymentStatus }) {
  const p = PAYMENT[value]
  return <StatusBadge tone={p.tone}>{p.label}</StatusBadge>
}