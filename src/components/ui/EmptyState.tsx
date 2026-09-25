import type { LucideIcon } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export function EmptyState({ icon: Icon, title, body, actionLabel, onAction }: {
  icon: LucideIcon
  title: string
  body: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-2 p-10 text-center">
      <Icon className="size-8 text-muted" />
      <p className="font-medium text-plum-900">{title}</p>
      <p className="max-w-sm text-sm text-muted">{body}</p>
      {actionLabel && onAction && (
        <Button variant="secondary" onClick={onAction} className="mt-2">{actionLabel}</Button>
      )}
    </div>
  )
}