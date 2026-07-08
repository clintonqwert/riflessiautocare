# Automotive Service Website Framework — V1

Riflessi Auto Care is Version 1 of a reusable website framework for local
automotive service businesses, built on the Driftpilot architecture
(github.com/clintonqwert/driftpilot-site). This doc is the reuse contract:
what stays generic, what is Riflessi-specific, and how V2 (the next client)
becomes a content + token swap.

## The three swap layers

| Layer | Location | Swap effort for a new client |
|---|---|---|
| **Theme** | `src/app/globals.css` `@theme` + `src/lib/design-tokens.ts` | Replace token *values* only. Never rename tokens; components consume semantic names (`bg-surface`, `text-accent`) exclusively. |
| **Content** | `src/lib/content/*` + `src/types/content.ts` | Rewrite the data modules (services, pricing, process, gallery, faq, stats, site facts, navigation). Pages fetch through accessors and never hardcode business facts. |
| **Fonts** | `src/app/layout.tsx` (next/font) + `--font-*` tokens | Swap the two font imports; the serif/sans split is structural. |

Everything else — components, pages, SEO builders, the lead pipeline — is the
framework and should survive re-branding untouched.

## Inherited guardrails (from Driftpilot, still binding)

1. Pages fetch through `lib/content/*` accessors; components never fetch.
2. Semantic tokens only in components; raw hex confined to
   `design-tokens.ts` consumers (currently `opengraph-image.tsx`).
3. `buildMetadata` + a `seo.ts` JSON-LD builder on every route; new schema
   types are added as builders, never inlined per-page.
4. `ScrollReveal` + `[data-reveal]` CSS is never rewritten (encodes no-JS,
   pre-hydration, reduced-motion, and transition-hijack fixes).
5. The form → server action → `crm.ts` pipeline keeps its honeypot,
   time-gate, and value-echo behavior; change the POST target, not the
   interface.
6. No new client component without a reason; third-party embeds use a
   click-to-load facade.
7. Business claims in copy must trace to `src/lib/content/site.ts` or a
   content module (the no-invention rule).

## Riflessi-specific additions (part of the framework going forward)

- `ui/icons.tsx` — inline SVG set, 24px grid, 1.5px stroke, currentColor.
- `ui/SectionHeading.tsx` — eyebrow + display heading + signature hairline.
- `shared/MediaFrame.tsx` — the single image treatment; gradient placeholder
  until real photography exists, so photo drops are additive.
- `shared/BeforeAfterPair.tsx` — paired labeled frames, no JS slider.
- `shared/StatsBand.tsx` + `shared/CountUp.tsx` — animated counters with
  server-rendered final values (reduced-motion/no-JS safe).
- `layout/StickyBookBar.tsx` — mobile-only persistent primary CTA
  (body carries matching bottom padding in `layout.tsx`).

## Client JS census

`"use client"` appears only in: `NavBar`, `BookingForm`, `ScrollReveal`,
`CountUp`. Keep it that way; sections and pages stay server components.
