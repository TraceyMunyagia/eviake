export function Divider({ className = '' }: { className?: string }) {
  return <div className={`mx-auto h-px w-16 ${className}`} style={{ backgroundColor: 'var(--invite-hairline)' }} />
}