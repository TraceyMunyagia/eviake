export function Video({ url }: { url?: string }) {
  if (!url) return null
  return (
    <section className="px-6 py-12" style={{ color: 'var(--invite-primary)' }}>
      <h2 className="mb-6 text-center text-2xl" style={{ fontFamily: 'var(--invite-heading-font)' }}>Watch</h2>
      <div className="mx-auto max-w-2xl overflow-hidden rounded-lg">
        <video src={url} controls className="w-full" />
      </div>
    </section>
  )
}