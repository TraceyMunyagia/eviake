import { romanceType } from '@/features/invites/templates/romance/type'

export function SectionLabel({ children }: { children: string }) {
  return (
    <p className={romanceType.kicker} style={{ color: 'var(--invite-accent)', fontFamily: 'var(--invite-body-font)' }}>
      {children}
    </p>
  )
}