import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost'
}

export function Button({ variant = 'primary', className, ...props }: Props) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium disabled:opacity-60',
        variant === 'primary' && 'bg-gold-500 text-plum-950 hover:bg-gold-400',
        variant === 'secondary' && 'border border-line bg-white text-ink hover:bg-gold-100',
        variant === 'ghost' && 'text-ink hover:bg-gold-100',
        className,
      )}
    />
  )
}