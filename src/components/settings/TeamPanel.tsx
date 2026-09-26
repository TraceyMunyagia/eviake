import { useCallback, useEffect, useState, type FormEvent } from 'react'
import { supabase } from '@/lib/supabase'
import { useBusiness } from '@/context/BusinessContext'
import { Button } from '@/components/ui/Button'
import { Field, TextInput, inputClass } from '@/components/ui/Field'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState } from '@/components/ui/ErrorState'
import { formatDateTime } from '@/lib/format'
import type { Membership, MembershipInvite, MembershipRole } from '@/types/database'

export function TeamPanel() {
  const { active } = useBusiness()
  const [members, setMembers] = useState<Membership[]>([])
  const [invites, setInvites] = useState<MembershipInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<MembershipRole>('member')
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [lastLink, setLastLink] = useState<string | null>(null)

  const load = useCallback(async () => {
    if (!active) return
    setLoading(true)
    const [m, i] = await Promise.all([
      supabase.from('business_members').select('business_id, user_id, role').eq('business_id', active.id),
      supabase.from('membership_invites').select('*').eq('business_id', active.id).is('accepted_at', null).order('created_at', { ascending: false }),
    ])
    if (m.error || i.error) { setError((m.error ?? i.error)!.message); setLoading(false); return }
    setError(null)
    setMembers((m.data ?? []) as unknown as Membership[])
    setInvites((i.data ?? []) as MembershipInvite[])
    setLoading(false)
  }, [active])

  useEffect(() => { load() }, [load])

  async function onInvite(e: FormEvent) {
    e.preventDefault()
    if (!active) return
    setBusy(true)
    setFormError(null)
    setLastLink(null)
    const { data, error } = await supabase.functions.invoke('send-team-invite', {
      body: { business_id: active.id, email: email.trim(), role },
    })
    setBusy(false)
    if (error) return setFormError(error.message)
    setLastLink(data?.link ?? null)
    setEmail('')
    load()
  }

  async function revoke(invite: MembershipInvite) {
    await supabase.from('membership_invites').delete().eq('id', invite.id)
    load()
  }

  if (error) return <div className="mt-6"><ErrorState message={error} onRetry={load} /></div>

  return (
    <div className="mt-6 space-y-6">
      <form onSubmit={onInvite} className="rounded-2xl border border-line bg-white p-5 shadow-sm">
        <h2 className="mb-4 font-display text-lg text-plum-900">Invite a teammate</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_auto_auto]">
          <TextInput id="invite-email" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          <Field label="Role" htmlFor="invite-role">
            <select id="invite-role" value={role} onChange={(e) => setRole(e.target.value as MembershipRole)} className={inputClass}>
              <option value="member">Member</option>
              <option value="owner">Owner</option>
            </select>
          </Field>
          <div className="flex items-end">
            <Button disabled={busy}>{busy ? 'Sending…' : 'Send invite'}</Button>
          </div>
        </div>
        {formError && <p role="alert" className="mt-3 text-sm text-red-700">{formError}</p>}
        {lastLink && (
          <p className="mt-3 text-sm text-muted">
            Invite created. Email sending isn't wired up yet — share this link manually: <code className="text-plum-900">{lastLink}</code>
          </p>
        )}
      </form>

      <section>
        <h2 className="mb-3 font-display text-lg text-plum-900">Members</h2>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>{['Name', 'User ID', 'Role'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.user_id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3">{m.profiles?.full_name || m.user_id}</td>
                    <td className="px-4 py-3">{m.profiles?.email || m.user_id}</td>
                    <td className="px-4 py-3 capitalize">{m.role}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {members.length === 0 && <p className="p-6 text-center text-sm text-muted">No members loaded.</p>}
          </div>
        )}
      </section>

      {invites.length > 0 && (
        <section>
          <h2 className="mb-3 font-display text-lg text-plum-900">Pending invites</h2>
          <ul className="divide-y divide-line rounded-2xl border border-line bg-white shadow-sm">
            {invites.map((i) => (
              <li key={i.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>{i.email} <span className="text-muted">· {i.role}</span></span>
                <span className="flex items-center gap-3">
                  <StatusBadge tone="pending">Sent {formatDateTime(i.created_at)}</StatusBadge>
                  <button onClick={() => revoke(i)} className="text-red-700 underline">Revoke</button>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}
