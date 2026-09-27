import { editorialType } from '@/features/invites/templates/editorial/type'

export function SectionLabel({ children }: { children: string }) {
  return (
    <p className={editorialType.kicker} style={{ color: 'var(--invite-accent)', fontFamily: 'var(--invite-body-font)' }}>
      {children}
    </p>
  )
}