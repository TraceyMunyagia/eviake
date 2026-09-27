// Editorial's type scale. Every section pulls from here instead of picking
// its own sizes — this is what keeps 11 different sections reading as one
// system rather than 11 unrelated designs.
export const editorialType = {
  kicker: 'text-[11px] uppercase tracking-[0.35em]',
  h1: 'text-[2.5rem] leading-[1.05] sm:text-[4.25rem]',
  h2: 'text-[1.85rem] leading-tight sm:text-[2.5rem]',
  h3: 'text-lg sm:text-xl',
  body: 'text-[15px] leading-relaxed sm:text-base',
  caption: 'text-xs',
}