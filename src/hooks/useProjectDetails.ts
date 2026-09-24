import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { Order, ProjectDetails } from '@/types/database'

type Editable = Partial<Omit<ProjectDetails, 'order_id' | 'business_id'>>

export function useProjectDetails(order: Order) {
  const [details, setDetails] = useState<ProjectDetails | null>(null)
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    const { data } = await supabase.from('project_details').select('*').eq('order_id', order.id).maybeSingle()
    setDetails((data as ProjectDetails | null) ?? null)
    setLoading(false)
  }, [order.id])

  useEffect(() => {
    load()
  }, [load])

  // Saves only the fields you pass, creating the row the first time
  const save = useCallback(
    async (values: Editable): Promise<string | null> => {
      const { error } = await supabase
        .from('project_details')
        .upsert({ order_id: order.id, business_id: order.business_id, ...values }, { onConflict: 'order_id' })
      if (error) return error.message
      await load()
      return null
    },
    [order.id, order.business_id, load],
  )

  return { details, loading, save }
}