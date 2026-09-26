import { useCallback, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'

type Row = { item_key: string; done: boolean; done_at: string | null }

export function useLaunchChecklist() {
  const { active } = useBusiness()
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    const { data, error: err } = await supabase
      .from('launch_checklist_items')
      .select('item_key, done, done_at')
      .eq('business_id', active.id)
    setError(err ? err.message : null)
    setRows((data ?? []) as Row[])
    setLoading(false)
  }, [active])

  useEffect(() => {
    load()
  }, [load])

  async function toggle(itemKey: string, currentlyDone: boolean) {
    if (!active) return
    const { data: userData } = await supabase.auth.getUser()
    setRows((prev) => {
      const exists = prev.some((r) => r.item_key === itemKey)
      return exists
        ? prev.map((r) => (r.item_key === itemKey ? { ...r, done: !currentlyDone } : r))
        : [...prev, { item_key: itemKey, done: !currentlyDone, done_at: null }]
    })
    const { error: err } = await supabase.from('launch_checklist_items').upsert({
      business_id: active.id,
      item_key: itemKey,
      done: !currentlyDone,
      done_by: userData.user?.id ?? null,
      done_at: !currentlyDone ? new Date().toISOString() : null,
    })
    if (err) {
      setError(err.message)
      load()
    }
  }

  const isDone = (itemKey: string) => rows.find((r) => r.item_key === itemKey)?.done ?? false

  return { rows, loading, error, toggle, isDone, reload: load }
}