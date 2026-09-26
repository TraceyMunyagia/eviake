import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import type { InviteTemplate } from '@/types/database'

export function useInviteTemplates() {
  const [templates, setTemplates] = useState<InviteTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    supabase.from('invite_templates').select('*').order('sort_order').then(({ data, error: err }) => {
      if (cancelled) return
      setError(err ? err.message : null)
      setTemplates((data ?? []) as InviteTemplate[])
      setLoading(false)
    })
    return () => { cancelled = true }
  }, [])

  return { templates, loading, error }
}