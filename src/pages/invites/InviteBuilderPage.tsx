import { useState } from 'react'
import { Link } from 'react-router-dom'
import { LayoutTemplate, Plus } from 'lucide-react'
import { useInviteTemplates } from '@/hooks/useInviteTemplates'
import { useInvites } from '@/hooks/useInvites'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { ErrorState } from '@/components/ui/ErrorState'
import { EmptyState } from '@/components/ui/EmptyState'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { formatDateTime, formatOrderNo } from '@/lib/format'
import { OrderPickerModal } from '@/components/invites/OrderPickerModal'

export function InviteBuilderPage() {
  const { templates, loading: templatesLoading, error: templatesError } = useInviteTemplates()
  const { invites, loading: invitesLoading, error: invitesError, reload } = useInvites()
  const [pickerOpen, setPickerOpen] = useState(false)

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl text-plum-900">Invite Builder</h1>
          <p className="mt-1 text-sm text-muted">Turn a paid order into a published invitation.</p>
        </div>
        <Button onClick={() => setPickerOpen(true)}><Plus className="size-4" /> Build invite</Button>
      </div>

      <section className="mb-10">
        <h2 className="mb-3 font-display text-lg text-plum-900">Templates</h2>
        {templatesError ? (
          <ErrorState message={templatesError} onRetry={() => window.location.reload()} />
        ) : templatesLoading ? (
          <div className="grid gap-4 sm:grid-cols-3">{Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-3">
            {templates.map((t) => (
              <div key={t.key} className="overflow-hidden rounded-2xl border border-line bg-white shadow-sm">
                <div className="flex h-36 items-center justify-center bg-gold-100 text-muted">
                  {t.sample_image_url ? <img src={t.sample_image_url} alt={t.label} className="h-full w-full object-cover" /> : <LayoutTemplate className="size-8" />}
                </div>
                <div className="p-4">
                  <p className="font-medium text-plum-900">{t.label}</p>
                  {t.description && <p className="mt-1 text-sm text-muted">{t.description}</p>}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-3 font-display text-lg text-plum-900">Invites in progress</h2>
        {invitesError ? (
          <ErrorState message={invitesError} onRetry={reload} />
        ) : invitesLoading ? (
          <CardSkeleton />
        ) : invites.length === 0 ? (
          <EmptyState icon={LayoutTemplate} title="No invites yet" body="Click Build invite to turn a part-paid or paid order into an invitation." />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-line bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-line text-muted">
                <tr>{['Order', 'Client', 'Template', 'Package', 'Status', 'Updated'].map((h) => <th key={h} className="px-4 py-3 font-medium">{h}</th>)}</tr>
              </thead>
              <tbody>
                {invites.map((i) => (
                  <tr key={i.id} className="border-b border-line last:border-0">
                    <td className="px-4 py-3"><Link to={`/invites/${i.id}`} className="font-medium text-plum-900 hover:underline">{i.orders && formatOrderNo(i.orders.order_no)}</Link></td>
                    <td className="px-4 py-3">{i.orders?.clients?.name ?? '–'}</td>
                    <td className="px-4 py-3 capitalize">{i.template}</td>
                    <td className="px-4 py-3 capitalize">{i.package}</td>
                    <td className="px-4 py-3"><StatusBadge tone={i.status === 'published' ? 'live' : 'pending'}>{i.status}</StatusBadge></td>
                    <td className="px-4 py-3">{formatDateTime(i.published_at ?? '')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

    <Modal open={pickerOpen} onClose={() => setPickerOpen(false)} title="Build invite">
  {pickerOpen && <OrderPickerModal templates={templates} onClose={() => setPickerOpen(false)} onCreated={() => reload()} />}
</Modal>
    </div>
  )
}