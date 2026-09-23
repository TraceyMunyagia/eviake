import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import type { OrderStatus } from '@/types/database'

export function useOrderStatuses() {
  const { active } = useBusiness()
  const [statuses, setStatuses] = useState<OrderStatus[]>([])

  useEffect(() => {
    setStatuses([])
    if (!active) return
    supabase
      .from('order_statuses')
      .select('*')
      .eq('business_id', active.id)
      .order('sort_order')
      .then(({ data }) => setStatuses((data ?? []) as OrderStatus[]))
  }, [active])

  return statuses
}