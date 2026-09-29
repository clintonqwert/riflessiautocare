# Riflessi design-system rules

- Use the semantic Tailwind tokens and existing shared components instead of raw values or one-off component variants.
- The palette is mirrored between `src/app/globals.css` and `src/lib/design-tokens.ts`; change both values together.
- The brand mark is one traced SVG path in `src/lib/riflessi-mark.json`. The header and footer render it through `Wordmark` (mark plus live-text name), and `npm run brand-icons` rebuilds the favicon, Apple icon, and JSON-LD logo from it. Never ship the owner's raster originals (kept gitignored in `public/brand/_originals/`).
- Preserve the premium, restrained automotive presentation: intentional imagery, readable typography, and clear booking CTAs.
- Cinematic motion is progressive enhancement. It must respect reduced-motion preferences and leave essential content usable when unavailable.
- Do not let temporary stock photography imply completed Riflessi work.
