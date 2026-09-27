export function Divider({ className = '' }: { className?: string }) {
  return (
    <div className={`mx-auto flex items-center justify-center gap-3 ${className}`} aria-hidden>
      <span className="h-px w-10" style={{ backgroundColor: 'var(--invite-hairline)' }} />
      <span className="size-1.5 rotate-45" style={{ backgroundColor: 'var(--invite-accent)' }} />
      <span className="h-px w-10" style={{ backgroundColor: 'var(--invite-hairline)' }} />
    </div>
  )
}