export function Gallery({ urls }: { urls?: string[] }) {
  if (!urls || urls.length === 0) {
    return (
      <section className="px-6 py-12 text-center" style={{ color: 'var(--invite-primary)' }}>
        <p className="text-sm opacity-70" style={{ fontFamily: 'var(--invite-body-font)' }}>No photos added yet.</p>
      </section>
    )
  }
  return (
    <section className="px-6 py-12" style={{ color: 'var(--invite-primary)' }}>
      <h2 className="mb-6 text-center text-2xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>Gallery</h2>
      <div className="mx-auto grid max-w-2xl grid-cols-2 gap-1.5 px-2 sm:gap-2 sm:px-0 sm:grid-cols-3">
        {urls.map((u, i) => (
          <img key={i} src={u} alt="" className="aspect-square w-full rounded-lg object-cover" />
        ))}
      </div>
    </section>
  )
}
