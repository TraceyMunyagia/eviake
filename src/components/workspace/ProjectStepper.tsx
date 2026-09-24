import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { OrderStatus } from '@/types/database'

export function ProjectStepper({ statuses, current, onChange, disabled }: {
  statuses: OrderStatus[]
  current: string
  onChange: (key: string) => void
  disabled?: boolean
}) {
  const index = statuses.findIndex((s) => s.key === current)

  return (
    <nav aria-label="Project progress" className="mb-6 overflow-x-auto rounded-2xl border border-line bg-white p-4 shadow-sm">
      <ol className="flex min-w-max items-start">
        {statuses.map((s, i) => {
          const done = i < index
          const isCurrent = i === index
          return (
            <li key={s.key} className="flex items-start">
              <button
                type="button"
                disabled={disabled}
                onClick={() => !isCurrent && onChange(s.key)}
                aria-current={isCurrent ? 'step' : undefined}
                className="group flex w-20 flex-col items-center gap-1.5 text-center disabled:opacity-60"
              >
                <span
                  className={cn(
                    'flex size-8 items-center justify-center rounded-full border text-xs font-semibold',
                    done && 'border-gold-500 bg-gold-500 text-plum-950',
                    isCurrent && 'border-plum-900 bg-plum-900 text-white ring-4 ring-gold-200',
                    !done && !isCurrent && 'border-line bg-white text-muted group-hover:border-gold-500',
                  )}
                >
                  {done ? <Check className="size-4" /> : i + 1}
                </span>
                <span className={cn('text-xs', isCurrent ? 'font-medium text-plum-900' : 'text-muted')}>{s.label}</span>
              </button>
              {i < statuses.length - 1 && (
                <span aria-hidden className={cn('mt-4 h-0.5 w-3', i < index ? 'bg-gold-500' : 'bg-line')} />
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}