import { useState, type FormEvent } from 'react'
import { useDomainsHosting } from '@/hooks/useDomainHosting'
import { Button } from '@/components/ui/Button'
import { Field, TextInput, inputClass } from '@/components/ui/Field'
import { StatusBadge, type Tone } from '@/components/ui/StatusBadge'
import type { DomainsHosting, Order, SslStatus } from '@/types/database'

const SSL_LABEL: Record<SslStatus, string> = {
  unknown: 'Unknown', active: 'Active', expiring: 'Expiring soon', expired: 'Expired', none: 'None',
}
const SSL_TONE: Record<SslStatus, Tone> = {
  unknown: 'neutral', active: 'live', expiring: 'pending', expired: 'overdue', none: 'neutral',
}

function daysUntil(date: string | null) {
  if (!date) return null
  const today = new Date(); today.setHours(0, 0, 0, 0)
  return Math.round((new Date(`${date}T00:00:00`).getTime() - today.getTime()) / 86_400_000)
}

function ExpiryNote({ date }: { date: string | null }) {
  const d = daysUntil(date)
  if (d === null) return null
  if (d < 0) return <span className="text-xs font-medium text-red-700">Expired {-d} day{d === -1 ? '' : 's'} ago</span>
  if (d <= 30) return <span className="text-xs font-medium text-red-700">Due in {d} day{d === 1 ? '' : 's'}</span>
  return <span className="text-xs text-muted">Due in {d} days</span>
}

export function HostingTab({ order }: { order: Order }) {
  const { record, loading, save } = useDomainsHosting(order)
  if (loading) return <p className="mt-6 text-sm text-muted">Loading…</p>
  return <HostingForm record={record} save={save} />
}

function HostingForm({ record, save }: {
  record: DomainsHosting | null
  save: (v: Partial<DomainsHosting>) => Promise<string | null>
}) {
  const [domain, setDomain] = useState(record?.domain ?? '')
  const [domainProvider, setDomainProvider] = useState(record?.domain_provider ?? '')
  const [domainExpiry, setDomainExpiry] = useState(record?.domain_expiry ?? '')
  const [hostingProvider, setHostingProvider] = useState(record?.hosting_provider ?? '')
  const [hostingPlan, setHostingPlan] = useState(record?.hosting_plan ?? '')
  const [hostingRenewal, setHostingRenewal] = useState(record?.hosting_renewal ?? '')
  const [ssl, setSsl] = useState<SslStatus>(record?.ssl_status ?? 'unknown')
  const [notes, setNotes] = useState(record?.notes ?? '')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setMessage(null)
    const err = await save({
      domain: domain.trim() || null,
      domain_provider: domainProvider.trim() || null,
      domain_expiry: domainExpiry || null,
      hosting_provider: hostingProvider.trim() || null,
      hosting_plan: hostingPlan.trim() || null,
      hosting_renewal: hostingRenewal || null,
      ssl_status: ssl,
      notes: notes.trim() || null,
    })
    setBusy(false)
    setMessage(err ? { ok: false, text: err } : { ok: true, text: 'Saved.' })
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 max-w-2xl space-y-4 rounded-2xl border border-line bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg text-plum-900">Domain & hosting</h2>
        <StatusBadge tone={SSL_TONE[ssl]}>SSL: {SSL_LABEL[ssl]}</StatusBadge>
      </div>

      <TextInput id="h-domain" label="Domain" placeholder="example.co.ke" value={domain} onChange={(e) => setDomain(e.target.value)} />
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput id="h-dprovider" label="Domain provider" value={domainProvider} onChange={(e) => setDomainProvider(e.target.value)} />
        <div>
          <TextInput id="h-dexpiry" label="Domain expiry" type="date" value={domainExpiry} onChange={(e) => setDomainExpiry(e.target.value)} />
          <div className="mt-1"><ExpiryNote date={domainExpiry || null} /></div>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <TextInput id="h-hprovider" label="Hosting provider" value={hostingProvider} onChange={(e) => setHostingProvider(e.target.value)} />
        <TextInput id="h-hplan" label="Hosting plan" value={hostingPlan} onChange={(e) => setHostingPlan(e.target.value)} />
      </div>
      <div>
        <TextInput id="h-hrenewal" label="Hosting renewal" type="date" value={hostingRenewal} onChange={(e) => setHostingRenewal(e.target.value)} />
        <div className="mt-1"><ExpiryNote date={hostingRenewal || null} /></div>
      </div>
      <Field label="SSL status" htmlFor="h-ssl">
        <select id="h-ssl" value={ssl} onChange={(e) => setSsl(e.target.value as SslStatus)} className={inputClass}>
          {Object.entries(SSL_LABEL).map(([k, label]) => <option key={k} value={k}>{label}</option>)}
        </select>
      </Field>
      <TextInput id="h-notes" label="Notes (logins kept elsewhere, special instructions)" value={notes} onChange={(e) => setNotes(e.target.value)} />

      {message && <p role={message.ok ? 'status' : 'alert'} className={message.ok ? 'text-sm text-green-800' : 'text-sm text-red-700'}>{message.text}</p>}
      <Button disabled={busy}>{busy ? 'Saving…' : 'Save hosting details'}</Button>
    </form>
  )
}