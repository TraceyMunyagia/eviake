import { useCallback, useEffect, useState } from 'react'
import { Plus, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/format'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { PageHeader } from '@/components/ui/PageHeader'
import { ClientForm } from '@/pages/clients/ClientForm'
import type { Client } from '@/types/database'
import { Link, useSearchParams } from 'react-router-dom'

export function ClientsPage() {
  const { active } = useBusiness()
  const [rows, setRows] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
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
    setError(err ? err.message : null)
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

      {error && <p role="alert" className="mb-4 text-sm text-red-700">Could not load clients: {error}</p>}

      <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
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

        {!loading && rows.length === 0 && (
          <p className="p-8 text-center text-sm text-muted">
            {query ? 'No clients match that search.' : 'No clients yet. Add your first client to get started.'}
          </p>
        )}
        {loading && rows.length === 0 && <p className="p-8 text-center text-sm text-muted">Loading…</p>}
      </div>

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
