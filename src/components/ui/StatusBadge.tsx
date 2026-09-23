import { cn } from '@/lib/utils'

export type Tone = 'pending' | 'progress' | 'review' | 'live' | 'overdue' | 'neutral'

const tones: Record<Tone, string> = {
  pending: 'bg-yellow-100 text-yellow-900',
  progress: 'bg-blue-100 text-blue-900',
  review: 'bg-purple-100 text-purple-900',
  live: 'bg-green-100 text-green-900',
  overdue: 'bg-red-100 text-red-900',
  neutral: 'bg-stone-100 text-stone-700',
}

export function StatusBadge({ tone = 'neutral', children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span className={cn('inline-block rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone])}>
      {children}
    </span>
  )
}