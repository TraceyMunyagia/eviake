export type BusinessSlug = 'evia_web' | 'evia_invites'
export type QuoteStatus = 'draft' | 'sent' | 'accepted' | 'rejected'

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
  source_request_id?: string | null
  invitation_details?: {
    eventType?: string
    template?: string
    eventName?: string
    hostName?: string
    eventDate?: string
    eventTime?: string
    venue?: string
    address?: string
    mapsUrl?: string
    dressCode?: string
    description?: string
    schedule?: string
    rsvp?: { enabled?: boolean; deadline?: string; fields?: string[]; plusOne?: boolean; customQuestions?: string }
    media?: { name: string; category: string; path: string }[]
  } | null
  created_at: string
  updated_at: string
  clients?: { name: string; business_name: string | null; email: string | null; phone: string | null } | null
}

export type PriceItem = {
  id: string
  business_id: string
  kind: 'package' | 'addon' | 'care'
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

export type Quote = {
  id: string
  quote_no: number
  business_id: string
  client_id: string
  order_id: string | null
  status: QuoteStatus
  public_token: string
  valid_until: string | null
  discount_kes: number
  care_name: string | null
  monthly_kes: number
  subtotal_kes: number
  total_kes: number
  notes: string | null
  sent_at: string | null
  decided_at: string | null
  created_at: string
  clients?: { name: string; business_name: string | null; email: string | null; phone: string | null } | null
  orders?: { order_no: number } | null
}

export type QuoteItem = {
  kind: 'package' | 'addon' | 'custom'
  name: string
  description: string | null
  quantity: number
  unit_price_kes: number
}

export type QuoteDocument = {
  quote_no: number
  status: QuoteStatus
  valid_until: string | null
  created_at: string
  sent_at: string | null
  subtotal_kes: number
  discount_kes: number
  total_kes: number
  care_name: string | null
  monthly_kes: number
  notes: string | null
  business_name: string
  client_name: string
  client_business_name: string | null
  items: QuoteItem[]
}
