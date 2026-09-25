import type { ReactNode } from 'react'

export function DataCard({ title, subtitle, rows, onClick }: {
  title: ReactNode
  subtitle?: ReactNode
  rows: { label: string; value: ReactNode }[]
  onClick?: () => void
}) {
  const Comp = onClick ? 'button' : 'div'
  return (
    <Comp
      onClick={onClick}
      className="w-full rounded-2xl border border-line bg-white p-4 text-left shadow-sm active:bg-gold-100"
    >
      <p className="font-medium text-plum-900">{title}</p>
      {subtitle && <p className="mt-0.5 text-sm text-muted">{subtitle}</p>}
      <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
        {rows.map((r) => (
          <div key={r.label}>
            <dt className="text-xs text-muted">{r.label}</dt>
            <dd className="mt-0.5">{r.value}</dd>
          </div>
        ))}
      </dl>
    </Comp>
  )
}