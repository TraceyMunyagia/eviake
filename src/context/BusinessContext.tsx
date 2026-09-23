import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/context/AuthContext'
import type { Business } from '@/types/database'

const STORAGE_KEY = 'evia.activeBusiness'

type BusinessState = {
  businesses: Business[]
  active: Business | null
  loading: boolean
  setActive: (slug: Business['slug']) => void
}

const BusinessContext = createContext<BusinessState | null>(null)

export function BusinessProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [activeSlug, setActiveSlug] = useState<string | null>(() =>
    localStorage.getItem(STORAGE_KEY),
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setBusinesses([])
      setLoading(false)
      return
    }
    setLoading(true)
    supabase
      .from('business_members')
      .select('businesses ( id, slug, name )')
      .eq('user_id', user.id)
      .then(({ data, error }) => {
        if (error) console.error('Could not load businesses', error.message)
        const rows = (data ?? []) as unknown as { businesses: Business | null }[]
        const list = rows
          .map((r) => r.businesses)
          .filter((b): b is Business => b !== null)
          .sort((a, b) => (a.slug === 'evia_web' ? -1 : b.slug === 'evia_web' ? 1 : 0))
        setBusinesses(list)
        setLoading(false)
      })
  }, [user])

  const active = useMemo(
    () => businesses.find((b) => b.slug === activeSlug) ?? businesses[0] ?? null,
    [businesses, activeSlug],
  )

  const value = useMemo<BusinessState>(
    () => ({
      businesses,
      active,
      loading,
      setActive: (slug) => {
        localStorage.setItem(STORAGE_KEY, slug)
        setActiveSlug(slug)
      },
    }),
    [businesses, active, loading],
  )

  return <BusinessContext.Provider value={value}>{children}</BusinessContext.Provider>
}

export function useBusiness() {
  const ctx = useContext(BusinessContext)
  if (!ctx) throw new Error('useBusiness must be used inside <BusinessProvider>')
  return ctx
}