import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import type { Invite } from '@/types/database'

type Row = Invite & { orders: { order_no: number; clients: { name: string } | null } | null }

export function useInvites() {
  const { active } = useBusiness()
  const [invites, setInvites] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('invites')
      .select('*, orders(order_no, clients(name))')
      .eq('business_id', active.id)
      .order('created_at', { ascending: false })
    setError(err ? err.message : null)
    setInvites((data ?? []) as unknown as Row[])
    setLoading(false)
  }, [active])

  useEffect(() => {
    load()
  }, [load])

  return { invites, loading, error, reload: load }
}