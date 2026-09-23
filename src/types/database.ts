export type BusinessSlug = 'evia_web' | 'evia_invites'

export type Business = {
  id: string
  slug: BusinessSlug
  name: string
  created_at?: string
}

export type Client = {
  id: string
  business_id: string
  name: string
  business_name: string | null
  email: string | null
  phone: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export type PaymentStatus = 'unpaid' | 'partial' | 'paid'

export type OrderStatus = {
  business_id: string
  key: string
  label: string
  tone: string
  sort_order: number
}

export type Order = {
  id: string
  order_no: number
  business_id: string
  client_id: string
  status: string
  payment_status: PaymentStatus
  package: string | null
  total_kes: number
  deadline: string | null
  notes: string | null
  created_at: string
  updated_at: string
  clients?: { name: string; business_name: string | null; email: string | null; phone: string | null } | null
}

export type PriceItem = {
  id: string
  business_id: string
  kind: 'package' | 'addon'
  name: string
  description: string | null
  price_kes: number
  active: boolean
  sort_order: number
}

export type Payment = {
  id: string
  business_id: string
  order_id: string
  amount_kes: number
  method: 'mpesa' | 'bank' | 'cash' | 'other' | null
  reference: string | null
  paid_at: string
  orders?: { id: string; order_no: number; clients?: { name: string } | null } | null
}

export type AppNotification = {
  id: string
  business_id: string
  kind: string
  title: string
  body: string | null
  link: string | null
  read_at: string | null
  created_at: string
}
