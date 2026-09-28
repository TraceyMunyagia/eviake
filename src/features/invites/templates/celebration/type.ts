// Celebration's type scale: big, heavy, uppercase display type and oversized numbers.
// clamp() keeps everything fluid, so there are no per-breakpoint size jumps.
export const celebrationType = {
  kicker: 'text-xs font-bold uppercase tracking-[0.2em]',
  display: 'text-[clamp(2.75rem,12vw,8rem)] font-extrabold uppercase leading-[0.88] tracking-tight',
  h2: 'text-[clamp(2rem,7vw,4.5rem)] font-extrabold uppercase leading-[0.95] tracking-tight',
  statement: 'text-[clamp(1.5rem,5vw,3.25rem)] font-bold leading-[1.1] tracking-tight',
  body: 'text-base leading-relaxed sm:text-lg',
  caption: 'text-xs font-semibold uppercase tracking-widest',
  number: 'text-[clamp(3rem,14vw,7.5rem)] font-extrabold leading-none tabular-nums',
}