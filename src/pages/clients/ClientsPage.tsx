import { useCallback, useEffect, useState } from 'react'
import { Plus, Search, UsersRound } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/format'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { ClientForm } from '@/pages/clients/ClientForm'
import type { Client } from '@/types/database'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { DataCard } from '@/components/ui/DataCard'
import { TableSkeleton } from '@/components/ui/Skeleton'

export function ClientsPage() {
  const { active } = useBusiness()
  const navigate = useNavigate()
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [params] = useSearchParams()
  const [query, setQuery] = useState(params.get('q') ?? '')
  const [editing, setEditing] = useState<Client | 'new' | null>(null)

  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    let q = supabase
      .from('clients')
      .select('*')
      .eq('business_id', active.id)
      .order('created_at', { ascending: false })
      .limit(100)

    const term = query.trim().replace(/[%,()]/g, '')
    if (term) {
      q = q.or(`name.ilike.%${term}%,business_name.ilike.%${term}%,email.ilike.%${term}%,phone.ilike.%${term}%`)
    }

    const { data, error: err } = await q
    if (err) {
      setLoadError(err.message)
      setLoading(false)
      return
    }
    setLoadError(null)
    setRows((data ?? []) as Client[])
    setLoading(false)
  }, [active, query])

  useEffect(() => {
  setQuery(params.get('q') ?? '')
}, [params])

  useEffect(() => {
    const t = setTimeout(load, 250)
    return () => clearTimeout(t)
  }, [load])

  if (!active) return null

  return (
    <div>
      <PageHeader
        title="Clients"
        subtitle={`People and businesses you work with in ${active.name}.`}
        action={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Add client
          </Button>
        }
      />

      <label className="mb-4 flex max-w-sm items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm">
        <Search className="size-4 text-muted" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, business, email or phone"
          aria-label="Search clients"
          className="w-full bg-transparent focus:outline-none"
        />
      </label>

      {loadError ? (
        <ErrorState message={`Could not load clients: ${loadError}`} onRetry={load} />
      ) : loading ? (
        <TableSkeleton />
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white shadow-sm">
          <EmptyState
            icon={UsersRound}
            title={query ? 'No clients match that search' : 'No clients yet'}
            body={query ? 'Try a different search.' : 'Add your first client to get started.'}
            actionLabel={!query ? 'Add client' : undefined}
            onAction={!query ? () => setEditing('new') : undefined}
          />
        </div>
      ) : (
      <>
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-sm sm:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Name</th>
              <th className="px-4 py-3 font-medium">Business</th>
              <th className="px-4 py-3 font-medium">Contact</th>
              <th className="px-4 py-3 font-medium">Added</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((c) => (
              <tr key={c.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">
                  <Link to={`/clients/${c.id}`} className="font-medium text-plum-900 hover:underline">
                    {c.name}
                  </Link>
                </td>
                <td className="px-4 py-3">{c.business_name ?? '–'}</td>
                <td className="px-4 py-3">
                  <div>{c.email ?? '–'}</div>
                  <div className="text-muted">{c.phone ?? ''}</div>
                </td>
                <td className="px-4 py-3">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>

      </div>
      <div className="space-y-3 sm:hidden">
        {rows.map((c) => (
          <DataCard
            key={c.id}
            onClick={() => navigate(`/clients/${c.id}`)}
            title={c.name}
            subtitle={c.business_name ?? undefined}
            rows={[
              { label: 'Email', value: c.email ?? '–' },
              { label: 'Phone', value: c.phone ?? '–' },
              { label: 'Added', value: formatDate(c.created_at) },
            ]}
          />
        ))}
      </div>
      </>
      )}

      <Modal
        open={editing !== null}
        onClose={() => setEditing(null)}
        title={editing === 'new' ? 'Add client' : 'Edit client'}
      >
        {editing !== null && (
          <ClientForm
            business={active}
            client={editing === 'new' ? null : editing}
            onClose={() => setEditing(null)}
            onSaved={() => {
              setEditing(null)
              load()
            }}
          />
        )}
      </Modal>
    </div>
  )
}
