export function Guestbook() {
  return (
    <section className="px-6 py-12 text-center" style={{ color: 'var(--invite-primary)' }}>
      <h2 className="text-2xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>Guestbook</h2>
      <p className="mx-auto mt-3 max-w-md text-sm opacity-70" style={{ fontFamily: 'var(--invite-body-font)' }}>
        Guest messages will appear here once guests can leave notes.
      </p>
    </section>
  )
}