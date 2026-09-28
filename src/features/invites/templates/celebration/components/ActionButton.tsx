import type { CSSProperties, ReactNode } from 'react'

const TONES = {
  accent: { bg: 'var(--invite-accent)', fg: 'var(--invite-primary)' },
  secondary: { bg: 'var(--invite-secondary)', fg: 'var(--invite-primary)' },
  light: { bg: 'var(--invite-background)', fg: 'var(--invite-primary)' },
} as const

export function ActionButton({ children, icon, href, onClick, disabled, submit, onDark, tone = 'accent' }: {
  children: ReactNode
  icon?: ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
  submit?: boolean
  onDark?: boolean // for primary-coloured sections, where a primary border would vanish
  tone?: keyof typeof TONES
}) {
  const style: CSSProperties = {
    backgroundColor: TONES[tone].bg,
    color: TONES[tone].fg,
    borderColor: onDark ? 'var(--invite-background)' : 'var(--invite-primary)',
    boxShadow: `4px 4px 0 ${onDark ? 'var(--invite-secondary)' : 'var(--invite-primary)'}`,
    fontFamily: 'var(--invite-body-font)',
  }
  const cls = 'cel-press inline-flex items-center gap-2 rounded-full border-2 px-5 py-2.5 text-sm font-bold disabled:opacity-60'

  if (href && !disabled) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
        {icon}{children}
      </a>
    )
  }
  return (
    <button type={submit ? 'submit' : 'button'} onClick={onClick} disabled={disabled} className={cls} style={style}>
      {icon}{children}
    </button>
  )
}