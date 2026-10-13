import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Check, Copy, ExternalLink, Mail, Pencil, Search } from 'lucide-react'
import { useInvites } from '@/hooks/useInvites'
import { formatDate, formatOrderNo } from '@/lib/format'
import { publicInviteUrl, rsvpTrackUrl } from '@/lib/inviteLinks'
import { cn } from '@/lib/utils'
import { PageHeader } from '@/components/ui/PageHeader'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { EmptyState } from '@/components/ui/EmptyState'
import { ErrorState } from '@/components/ui/ErrorState'
import { TableSkeleton } from '@/components/ui/Skeleton'
import type { InviteStatus } from '@/types/database'

type Row = ReturnType<typeof useInvites>['invites'][number]

const FILTERS: { key: '' | InviteStatus; label: string }[] = [
  { key: '', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
]

const titleOf = (i: Row) => i.content.event_name || i.content.couple_names || 'Untitled invite'

export function InvitationsPage() {
  const { invites, loading, error, reload } = useInvites()
  const [params, setParams] = useSearchParams()
  const status = (params.get('status') ?? '') as '' | InviteStatus
  const [text, setText] = useState('')

  const counts = useMemo(() => ({
    '': invites.length,
    published: invites.filter((i) => i.status === 'published').length,
    draft: invites.filter((i) => i.status === 'draft').length,
  }), [invites])

  const visible = useMemo(() => {
    const term = text.trim().toLowerCase().replace('#', '')
    return invites.filter((i) => {
      if (status && i.status !== status) return false
      if (!term) return true
      return [titleOf(i), i.orders?.clients?.name, i.template, i.package, i.orders && String(i.orders.order_no)]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(term))
    })
  }, [invites, status, text])

  function setStatus(key: string) {
    setParams(key ? { status: key } : {}, { replace: true })
  }

  return (
    <div>
      <PageHeader title="Invitations" subtitle="Every invite, with the links to share with guests and clients." />

      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Filter by status" className="flex gap-1 rounded-lg border border-line bg-white p-1 text-sm">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              role="tab"
              aria-selected={status === f.key}
              onClick={() => setStatus(f.key)}
              className={cn('rounded-md px-3 py-1.5', status === f.key ? 'bg-gold-100 font-medium text-plum-900' : 'text-muted hover:text-ink')}
            >
              {f.label} <span className="text-muted">{counts[f.key]}</span>
            </button>
          ))}
        </div>
        <label className="flex min-w-64 flex-1 items-center gap-2 rounded-lg border border-line bg-white px-3 py-2 text-sm sm:flex-none">
          <Search className="size-4 text-muted" />
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Search event, client or order number"
            aria-label="Search invitations"
            className="w-full bg-transparent focus:outline-none"
          />
        </label>
      </div>

      {error ? (
        <ErrorState message={`Could not load invitations: ${error}`} onRetry={reload} />
      ) : loading ? (
        <TableSkeleton />
      ) : visible.length === 0 ? (
        <div className="rounded-2xl border border-line bg-white shadow-sm">
          <EmptyState
            icon={Mail}
            title={invites.length === 0 ? 'No invitations yet' : 'No invitations match'}
            body={invites.length === 0 ? 'Build an invite from a paid order in the Invite Builder.' : 'Try another status or search.'}
          />
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto rounded-2xl border border-line bg-white shadow-sm md:block">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>
                  {['Invite', 'Order', 'Design', 'Event date', 'Status', 'Links', ''].map((h) => (
                    <th key={h} className="px-4 py-3 font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map((i) => (
                  <tr key={i.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">
                      <div className="font-medium text-plum-900">{titleOf(i)}</div>
                      <div className="text-muted">{i.orders?.clients?.name ?? '–'}</div>
                    </td>
                    <td className="px-4 py-3">{i.orders ? formatOrderNo(i.orders.order_no) : '–'}</td>
                    <td className="px-4 py-3 capitalize">{i.template} · {i.package}</td>
                    <td className="px-4 py-3">{formatDate(i.content.event_date)}</td>
                    <td className="px-4 py-3"><InviteStatusBadge status={i.status} /></td>
                    <td className="px-4 py-3"><CopyLinks invite={i} /></td>
                    <td className="px-4 py-3"><OpenLinks invite={i} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-3 md:hidden">
            {visible.map((i) => (
              <div key={i.id} className="rounded-2xl border border-line bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-plum-900">{titleOf(i)}</p>
                    <p className="mt-0.5 text-sm text-muted">
                      {i.orders?.clients?.name ?? '–'}{i.orders ? ` · ${formatOrderNo(i.orders.order_no)}` : ''}
                    </p>
                  </div>
                  <InviteStatusBadge status={i.status} />
                </div>
                <p className="mt-2 text-sm capitalize text-muted">
                  {i.template} · {i.package}{i.content.event_date ? ` · ${formatDate(i.content.event_date)}` : ''}
                </p>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <CopyLinks invite={i} />
                  <OpenLinks invite={i} />
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function InviteStatusBadge({ status }: { status: InviteStatus }) {
  return <StatusBadge tone={status === 'published' ? 'live' : 'pending'}>{status === 'published' ? 'Published' : 'Draft'}</StatusBadge>
}

// Links only work once the invite is published
function CopyLinks({ invite }: { invite: Row }) {
  const [copied, setCopied] = useState<'invite' | 'rsvp' | null>(null)
  const live = invite.status === 'published'
  const inviteUrl = live && invite.public_slug ? publicInviteUrl(invite.public_slug) : null
  const rsvpUrl = live && invite.rsvp_track_token ? rsvpTrackUrl(invite.rsvp_track_token) : null

  async function copy(url: string, which: 'invite' | 'rsvp') {
    await navigator.clipboard.writeText(url)
    setCopied(which)
    setTimeout(() => setCopied(null), 2000)
  }

  if (!live) return <span className="text-xs text-muted">Publish to get links</span>

  return (
    <div className="flex flex-wrap gap-1.5">
      <CopyButton label="Invite link" done={copied === 'invite'} disabled={!inviteUrl} onClick={() => inviteUrl && copy(inviteUrl, 'invite')} />
      <CopyButton label="RSVP tracking" done={copied === 'rsvp'} disabled={!rsvpUrl} onClick={() => rsvpUrl && copy(rsvpUrl, 'rsvp')} />
    </div>
  )
}

function CopyButton({ label, done, disabled, onClick }: { label: string; done: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-2.5 py-1.5 text-xs hover:bg-gold-100 disabled:opacity-50"
    >
      {done ? <Check className="size-3.5 text-green-800" /> : <Copy className="size-3.5" />}
      {done ? 'Copied' : label}
    </button>
  )
}

function OpenLinks({ invite }: { invite: Row }) {
  const live = invite.status === 'published' && invite.public_slug
  return (
    <div className="flex items-center justify-end gap-1.5">
      {live && (
        <a
          href={publicInviteUrl(invite.public_slug!)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-2.5 py-1.5 text-xs hover:bg-gold-100"
        >
          <ExternalLink className="size-3.5" /> Open invite
        </a>
      )}
      <Link
        to={`/invites/${invite.id}`}
        className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-lg border border-line px-2.5 py-1.5 text-xs hover:bg-gold-100"
      >
        <Pencil className="size-3.5" /> Edit
      </Link>
    </div>
  )
}
