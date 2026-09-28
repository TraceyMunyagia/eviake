// Splits text into words, each sliding up from behind a mask with a stagger.
// The parent heading should carry an aria-label, since the split words are
// hidden from screen readers.
export function AnimatedWords({ text, baseDelay = 0, step = 90 }: { text: string; baseDelay?: number; step?: number }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <span aria-hidden>
      {words.map((word, i) => (
        <span key={`${word}-${i}`} className="cel-word" style={{ marginRight: '0.25em' }}>
          <span style={{ animationDelay: `${baseDelay + i * step}ms` }}>{word}</span>
        </span>
      ))}
    </span>
  )
}