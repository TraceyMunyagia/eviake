# Celebration motion vocabulary

Celebration should feel like a digital event, so it moves. But motion follows rules.

## What moves, and how
| Kind | Where | Feel |
|---|---|---|
| Entrance | Hero title words | Slide up from a mask, 90ms stagger, 800ms, ease-out |
| Ambient | Floating shapes, spinning sticker, marquee band | Slow loops (6-9s floats, 16s spin, 32s marquee) |
| Scroll reveal | Every section after the Hero | Pop-in with slight overshoot, 600ms, tilt settles to 0 |
| Parallax | Hero shapes + media card only | Speed 0.05-0.09; never on text |
| Interaction | Buttons | Press down into the offset shadow |
| Data | Countdown digits | Tick-in on every change |

## Rules
1. Content is never hidden behind motion for longer than ~1s.
2. `prefers-reduced-motion` turns off every loop, entrance and reveal (CSS) and parallax + video autoplay (JS).
3. Ambient loops sit around the content, never under body text.
4. All motion is CSS classes prefixed `cel-` in `celebration.css`, except parallax (one rAF scroll listener) and countdown ticking.
5. Confetti is reserved for two moments only: RSVP confirmation and the Closing.