# Components

Presentation layer only — **components never fetch data**. Pages (in
`src/app/`) fetch via `lib/content/*` accessors and pass typed props down.

| Folder | Purpose | Client JS allowed? |
|---|---|---|
| `layout/` | NavBar, SiteFooter, StickyBookBar | NavBar only |
| `home/` | Homepage sections | No |
| `forms/` | BookingForm (submits via Server Action) | Yes |
| `shared/` | Cross-page fragments (PageHero, CTABand, FAQSection, MediaFrame, StatsBand…) | CountUp + ScrollReveal only |
| `ui/` | Primitives (button recipe, Card, field recipes, icons, SectionHeading) | No |

- `home/`/`shared/` may import from `ui/`; `ui/` never imports upward.
- `"use client"` appears **only** in: NavBar, BookingForm, ScrollReveal,
  CountUp. Never on a section or page.
- No hex colors in JSX — design tokens live in `app/globals.css`; raw hex is
  confined to `lib/design-tokens.ts` consumers (opengraph-image).
- Images go through `shared/MediaFrame.tsx` — never raw `<img>`/`<Image>` in
  sections.
