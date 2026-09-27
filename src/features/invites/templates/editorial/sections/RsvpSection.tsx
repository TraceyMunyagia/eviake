import type { InviteContent } from '@/types/database'

export function RsvpSection({ content, mode }: { content: InviteContent; mode?: 'preview' | 'public' }) {
  return (
    <section className="px-6 py-12 text-center" style={{ backgroundColor: 'var(--invite-accent)', color: 'var(--invite-primary)' }}>
      <h2 className="text-2xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>RSVP</h2>
      {content.description && (
        <p className="mx-auto mt-3 max-w-md text-sm" style={{ fontFamily: 'var(--invite-body-font)' }}>{content.description}</p>
      )}
      <button
        type="button"
        disabled={mode === 'preview'}
        className="mt-6 w-full max-w-xs rounded-full bg-white px-6 py-3 text-sm font-medium shadow-sm disabled:opacity-70 sm:w-auto sm:px-8"
        style={{ fontFamily: 'var(--invite-body-font)' }}
      >
        {mode === 'preview' ? 'RSVP button (guest form ships later)' : 'Respond now'}
      </button>
    </section>
  )
}
