import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { DomainsHosting, Order } from '@/types/database'

type Editable = Partial<Omit<DomainsHosting, 'order_id' | 'business_id'>>

export function useDomainsHosting(order: Order) {
  const [record, setRecord] = useState<DomainsHosting | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('domains_hosting').select('*').eq('order_id', order.id).maybeSingle()
    setRecord((data as DomainsHosting | null) ?? null)
    setLoading(false)
  }, [order.id])

  useEffect(() => {
    load()
  }, [load])

  const save = useCallback(
    async (values: Editable): Promise<string | null> => {
      const { error } = await supabase
        .from('domains_hosting')
        .upsert({ order_id: order.id, business_id: order.business_id, ...values }, { onConflict: 'order_id' })
      if (error) return error.message
      await load()
      return null
    },
    [order.id, order.business_id, load],
  )

  return { record, loading, save }
}