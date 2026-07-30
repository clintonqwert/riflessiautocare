# Riflessi Auto Care — Project Analysis

**Prepared by:** Staff Software Architect review
**Scope:** Full repository, static analysis only — no source code was modified to produce this report.
**Repo:** `github.com/clintonqwert/riflessiautocare` · **Branch analyzed:** `main` @ `288720d`

---

## 1. Executive Summary

Riflessi Auto Care is a **Next.js 16 (App Router) marketing + lead-generation site** for a solo, appointment-only car detailing business in Metro Vancouver. It is explicitly built as **Version 1 of a reusable "Automotive Service Website Framework"** — the codebase is designed so that a future client site is a token-and-content swap rather than a rebuild, and this reuse contract is documented in `docs/maintenance/FRAMEWORK.md`.

Key characteristics:

- **Fully static, server-first rendering.** Every route is prerendered at build time (SSG/ISR-free static output). Client JavaScript is deliberately minimized to four components site-wide, plus a homepage-only cinematic 3D experience that is capability-gated.
- **Strict layering discipline**: routes fetch content via typed accessor functions (`src/lib/content/*`), components are pure presentation and never fetch, and `src/types/` defines the contracts that hold the whole system together. This is enforced by convention and documented in `src/components/README.md`, not by tooling.
- **A single conversion path** — "Book a Detail" — wired through a Zod-validated React Server Action with spam defenses (honeypot + time-gate), retrying webhook delivery, and a fail-loud UX with a pre-filled `mailto` fallback so no lead is silently lost.
- **SEO-as-code**: a single `buildMetadata` helper and a family of JSON-LD builders (`AutoRepair`, `Service`, `FAQPage`, `OfferCatalog`, `BreadcrumbList`) are the sole authority for metadata and structured data across all pages.
- **A distinctive, high-effort homepage feature**: a scroll-driven WebGL "paint tester" stage (`react-three-fiber` + custom procedural geometry) that upgrades progressively and is capability-gated so low-power devices never download it. Copy is always server-rendered underneath it regardless of whether the 3D scene loads.
- **Honesty-as-a-constraint**: business claims are required to trace back to a single facts module (`src/lib/content/site.ts`); a documented "no-invention" and "no indoor-facility" vocabulary rule governs both copy and imagery.

**Maturity assessment:** The engineering foundation (architecture, SEO, forms, a11y scaffolding, motion safety) is production-grade and unusually well-documented for a project this size. What is **not** production-ready is business content: pricing is placeholder, contact email/domain are unconfirmed, legal pages are unreviewed drafts, and all 12 photographs are temporary licensed stock rather than the business's own work. These are tracked explicitly in `docs/maintenance/REVIEW-FINDINGS.md` as launch-gating owner TODOs, not code defects.

---

## 2. Folder Structure

```
riflessiautocare/
├── .claude/                     # Claude Code skills/config (builder, reviewer, tester, auditor, content-strategist)
├── docs/
│   ├── maintenance/
│   │   ├── FRAMEWORK.md         # Reuse contract: theme/content/font swap layers
│   │   ├── IMAGE-CREDITS.md     # Stock photo attributions + replacement plan
│   │   └── REVIEW-FINDINGS.md   # Tracked PR review findings + launch gate
│   └── seo/
│       └── LOCAL-SEO.md         # Off-site local SEO playbook (GBP, backlinks, etc.)
├── public/
│   └── images/                  # 12 temporary stock photos (about, why, gallery before/after)
├── scripts/
│   └── resume-role.sh
├── src/
│   ├── app/                     # Next.js App Router — routes only
│   │   ├── layout.tsx           # Root layout: fonts, NavBar, ScrollReveal, JsonLd, Footer, StickyBookBar, Analytics
│   │   ├── page.tsx             # Homepage (cinematic sequence + sections)
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx     # Booking form page
│   │   ├── gallery/page.tsx
│   │   ├── pricing/page.tsx
│   │   ├── services/page.tsx
│   │   ├── services/[slug]/page.tsx   # 4 static-generated service detail pages
│   │   ├── privacy/page.tsx
│   │   ├── terms/page.tsx
│   │   ├── thank-you/page.tsx   # noindex, post-booking confirmation
│   │   ├── not-found.tsx        # Custom 404 with nav + CTA
│   │   ├── opengraph-image.tsx  # Dynamic OG image generation
│   │   ├── sitemap.ts           # MetadataRoute.Sitemap
│   │   ├── robots.ts            # MetadataRoute.Robots
│   │   └── globals.css          # Tailwind v4 @theme tokens + utilities
│   ├── components/
│   │   ├── layout/               # NavBar (client), SiteFooter, StickyBookBar
│   │   ├── home/                 # Homepage-only sections (server components)
│   │   ├── forms/                 # BookingForm (client)
│   │   ├── shared/                # Cross-page fragments (PageHero, CTABand, MediaFrame, FAQSection, StatsBand, JsonLd, BeforeAfterPair, PhotoCredit, LegalContent, ScrollReveal, CountUp)
│   │   ├── ui/                    # Primitives: button recipe, Card, field recipes, icons, SectionHeading
│   │   ├── services/              # service-icons.ts map
│   │   ├── cinema/                # The WebGL scroll-story stage (isolated subsystem)
│   │   └── README.md              # Component layering rules (source of truth)
│   ├── lib/
│   │   ├── content/                # The "database": typed accessor modules per content type
│   │   ├── actions/                # submit-booking.ts (Server Action)
│   │   ├── crm.ts                  # Webhook client with retry/backoff
│   │   ├── seo.ts                  # buildMetadata + all JSON-LD builders
│   │   ├── design-tokens.ts        # NERO palette for raw-hex consumers (OG image, WebGL)
│   │   └── utils.ts                # cn() — clsx + tailwind-merge
│   └── types/
│       ├── content.ts               # Content shapes: services, pricing, gallery, stats, FAQ
│       └── forms.ts                 # Booking form data contracts
├── next.config.ts                   # Security headers, no other custom config
├── tsconfig.json                    # Strict mode, `@/*` path alias
├── eslint.config.mjs                # eslint-config-next (core-web-vitals + typescript)
└── package.json
```

No `tests/` directory exists anywhere in the repository (see §16, Technical Debt).

---

## 3. Tech Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | **Next.js 16.2.7** | App Router, React Server Components, static export per route |
| Language | **TypeScript 5**, strict mode | `tsconfig.json`: `strict: true`, path alias `@/* -> src/*` |
| UI runtime | **React 19.2.4** / React DOM 19.2.4 | |
| Styling | **Tailwind CSS v4** (`@tailwindcss/postcss`) | CSS-first `@theme` config, no `tailwind.config.js` |
| Fonts | `next/font/google` — Fraunces (display serif) + Figtree (body sans) | Self-hosted via Next's font optimization |
| Validation | **Zod 4** | Booking form schema |
| 3D/Motion | **@react-three/fiber 9**, **@react-three/drei 10**, **three 0.185**, **gsap 3.15**, **lenis 1.3** | All confined to `components/cinema/`, dynamically imported, homepage-only |
| Utility | `clsx` + `tailwind-merge` (via `cn()`), `server-only` | |
| Analytics | `@vercel/analytics`, `@vercel/speed-insights` | Cookieless, zero-config on Vercel |
| Hosting | **Vercel** | Static prerender + preview deployments |
| Tooling | ESLint 9 (`eslint-config-next`), PostCSS | No Prettier config found; no test runner configured |
| Package manager | npm (`package-lock.json` present) | |

Notably **absent**: no CMS, no database, no ORM, no auth, no state management library (Redux/Zustand/etc.), no test framework (Jest/Vitest/Playwright), no CI config files (`.github/workflows` not present in the file listing).

---

## 4. Routing Architecture

Next.js App Router, 100% file-based, no route groups or parallel/intercepting routes in use.

| Route | File | Rendering | Notes |
|---|---|---|---|
| `/` | `src/app/page.tsx` | Static | Cinematic hero sequence + 7 marketing sections |
| `/services` | `src/app/services/page.tsx` | Static | Overview grid, derives cards from content |
| `/services/[slug]` | `src/app/services/[slug]/page.tsx` | **SSG**, `generateStaticParams` + `dynamicParams = false` | 4 static params (`interior-detailing`, `exterior-detailing`, `full-detail`, `ceramic-coating`); unknown slugs 404 via `notFound()` |
| `/pricing` | `src/app/pricing/page.tsx` | Static | Packages × vehicle-size grid + add-ons, `OfferCatalog` schema |
| `/gallery` | `src/app/gallery/page.tsx` | Static | Before/after pairs |
| `/about` | `src/app/about/page.tsx` | Static | Story passages, standards, refusals, stats |
| `/contact` | `src/app/contact/page.tsx` | Static (form is client-hydrated) | Booking form + "how it works" aside |
| `/thank-you` | `src/app/thank-you/page.tsx` | Static, `robots: {index:false}` | Post-submit confirmation, reachable only via redirect |
| `/privacy`, `/terms` | `src/app/{privacy,terms}/page.tsx` | Static | Rendered from `legal.ts` content via shared `LegalContent` |
| `/sitemap.xml` | `src/app/sitemap.ts` | Generated | Explicit allow-list of routes; `/thank-you` deliberately excluded |
| `/robots.txt` | `src/app/robots.ts` | Generated | `allow: "/"`, points at sitemap |
| `/opengraph-image` | `src/app/opengraph-image.tsx` | Generated (`next/og`) | Single shared OG image for the whole site |
| `*` (404) | `src/app/not-found.tsx` | Static | Custom 404 with service links + CTA, never a dead end |

**Planned/deferred routes** (per README roadmap and `LOCAL-SEO.md`, not yet implemented):
- `/locations/[slug]` — 5 city landing pages (New Westminster, Burnaby, Coquitlam, Surrey, Vancouver)
- `/guides` + `/guides/[slug]` — SEO content hub (phase 2)

All internal navigation is driven from a single source of truth (`src/lib/content/navigation.ts`) consumed by `NavBar`, `SiteFooter`, and `not-found.tsx` — there is no route hardcoded independently in multiple components.

---

## 5. Component Hierarchy

```
RootLayout (src/app/layout.tsx)                         [Server]
├── <a> skip-to-content link
├── JsonLd × 2 (LocalBusiness, WebSite schemas)          [Server]
├── NavBar                                                [Client — scroll state, mobile drawer]
├── ScrollReveal                                          [Client — IntersectionObserver, renders null]
├── {children}  ← page content
│     Home (/) :
│       CinematicSequence                                [Client — orchestrator]
│       ├── PaintStage (dynamic import, ssr:false)        [Client — WebGL]
│       │   └── StageFallback                             [Server — CSS-only fallback]
│       ├── ActPanel × 7                                   [Server, rendered inside client tree via props]
│       │   └── slots: ServiceCards, CTA <Link> groups    [Server components passed as children]
│       WhySection, ProcessSection, GalleryPreview,
│       FeaturedPackages, ExperienceSection,
│       FAQSection, CTABand                                [All Server]
│
│     Service detail (/services/[slug]):
│       PageHero, Card × N, SectionHeading, FAQSection,
│       CTABand, JsonLd (Service + Breadcrumb)              [All Server]
│
│     Contact (/contact):
│       PageHero, Card > BookingForm                        [BookingForm is Client]
│       aside > icon steps                                   [Server]
│
│     About (/about):
│       PageHero, MediaFrame + PhotoCredit (repeated),
│       Card (standards), StatsBand > CountUp                [CountUp is Client]
│
├── SiteFooter                                              [Server]
├── StickyBookBar                                           [Server, CSS-only, mobile-only]
├── Analytics, SpeedInsights                                [Vercel client scripts]
```

**Structural rule** (enforced by convention, documented in `src/components/README.md`):
- `home/` and `shared/` may import from `ui/`; `ui/` never imports upward.
- Pages (`app/`) are the only layer allowed to call `lib/content/*` accessors; components receive typed props only.
- `"use client"` is confined to exactly: `NavBar`, `BookingForm`, `ScrollReveal`, `CountUp`, plus the `cinema/` subsystem (`CinematicSequence`, `PaintStage`, `capability.ts`, `useScrollStory.ts`). Every other component — including every page and every homepage/shared section — is a Server Component.

---

## 6. Shared Components

| Component | Location | Purpose | Client? |
|---|---|---|---|
| `PageHero` | `shared/` | Eyebrow + heading + subheading banner used at the top of every inner page | No |
| `CTABand` | `shared/` | Bottom-of-page conversion band, configurable headline/subhead/secondary CTA | No |
| `FAQSection` | `shared/` | Renders `FAQItem[]` + emits `FAQPage` JSON-LD | No |
| `MediaFrame` | `shared/` | **The single image treatment** — rounded frame, gradient placeholder (`paint-reflection` utility) when no `src`, real `next/image` when present | No |
| `BeforeAfterPair` | `shared/` | Paired labeled `MediaFrame`s, no JS slider | No |
| `StatsBand` | `shared/` | Row of animated stats, wraps `CountUp` | No (children are) |
| `CountUp` | `shared/` | Count-0-to-value animation, reduced-motion/no-JS safe (server-rendered final value) | **Yes** |
| `JsonLd` | `shared/` | Injects a `<script type="application/ld+json">` from a schema object | No |
| `PhotoCredit` | `shared/` | Attribution + UTM link for licensed stock photography | No |
| `LegalContent` | `shared/` | Renders privacy/terms sections + "last updated" | No |
| `ScrollReveal` | `shared/` | Global `[data-reveal]` IntersectionObserver mount, renders null | **Yes** |
| `Card` | `ui/` | Base surface primitive, optional `hover` state | No |
| `SectionHeading` | `ui/` | Eyebrow + display heading + signature "riflesso" hairline | No |
| `button.ts` | `ui/` | `buttonClasses()` — a class-string function (not a component) so `<Link>` call sites don't need a wrapper | No (utility) |
| `field.ts` | `ui/` | Shared dark input/label/error class recipes | No (utility) |
| `icons.tsx` | `ui/` | Inline SVG set, 24px grid, 1.5px stroke, `currentColor` | No |

Design principle: **no raw hex in JSX** — all color comes through Tailwind semantic classes (`bg-surface`, `text-accent`, etc.); the only sanctioned raw-hex consumers are `design-tokens.ts` (used by `opengraph-image.tsx` and WebGL materials, which can't read CSS custom properties).

---

## 7. State Management

There is **no global state management library** (no Redux, Zustand, Jotai, Context-based store, React Query, etc.). State is minimal and locally scoped by design:

- **Server state**: none — the site has no database; all "data" is static TypeScript content compiled at build time.
- **Form state**: `useActionState` (React 19) in `BookingForm.tsx` drives the booking form — a single hook manages pending/result/error state, backed by the `submitBooking` Server Action. No client-side validation library is used; Zod validation happens entirely server-side and errors are echoed back through the action's return value.
- **UI-local state**: `useState` for `NavBar`'s mobile drawer open/close; `useSyncExternalStore` for scroll-position detection (`isScrolled`) — a deliberate choice over `useState`+`useEffect` to avoid an extra render and to have a correct SSR snapshot (`getServerScrollSnapshot` returns `false`).
- **Mutable-but-not-React state**: `scroll-progress.ts` in `components/cinema/` explicitly avoids putting per-frame scroll values into React state — it's a plain mutable box read by the `useFrame` loop, documented as a hard rule to prevent the whole tree entering the animation loop on every scroll tick.
- **No client-side routing state / no URL search-param-driven state** anywhere in the app.

This is a legitimate architectural choice for a static marketing site — there is no cross-page shared state to manage.

---

## 8. Styling System

- **Tailwind CSS v4**, using the new CSS-first configuration (`@import "tailwindcss"` + `@theme` block in `globals.css`) — there is no `tailwind.config.js`/`.ts` file.
- **Design tokens** ("Nero Lucido" — obsidian black + champagne-bronze accent) are defined once in `globals.css`'s `@theme` block as CSS custom properties (`--color-surface`, `--color-accent`, etc.) and consumed exclusively via Tailwind's generated semantic utility classes (`bg-surface`, `text-accent-fg`, ...).
- **Duplicated mirror, by necessity**: the same 9 core hex values are hand-duplicated in `src/lib/design-tokens.ts` (`NERO` object) because two consumers — `next/og`'s `ImageResponse` and Three.js materials/lights — cannot read CSS custom properties at render/compile time. Both files carry an explicit `MIRROR:` comment pointing at each other, and this was a P2 finding in `REVIEW-FINDINGS.md` (documented rather than automated).
- **Custom `@utility` blocks** extend Tailwind with brand-specific treatments: `hero-glow` (radial bronze wash), `riflesso-line` (the signature 1px sweeping hairline motif), `stage-backdrop` (WebGL canvas backdrop gradient), `paint-reflection` (gradient placeholder for un-photographed `MediaFrame`s).
- **Typography**: Fraunces (serif, `opsz` optical-size axis) for headings via a global `h1,h2,h3 { @apply font-serif }` rule; Figtree (sans) for body via `body { @apply font-sans }`. A custom "display" type scale (`--text-display-sm` through `--text-display-xl`) supplements Tailwind's default scale for hero-sized headlines.
- **Motion**: no animation library for CSS-level effects — `@keyframes fadeUp`, `sheenSweep`, `riseIn` are hand-written, and the scroll-reveal system is CSS transitions gated by a `[data-reveal]`/`.is-revealed` class pair, safe-by-default under `prefers-reduced-motion`.
- **Class composition**: `cn()` (`clsx` + `tailwind-merge`) is available for conflict-safe merging, but `buttonClasses()` deliberately uses **plain string concatenation without `tailwind-merge`**, to keep the merge runtime out of `NavBar`'s (a client component) first-load bundle — a documented, intentional performance trade-off, with the caveat that call-site `className` must not repeat recipe utilities.
- **Dark-mode-only**: `color-scheme: dark` is hardcoded on `body`; there is no light theme or theme toggle.

---

## 9. API Architecture

There is **no traditional REST/GraphQL API layer** — no `src/app/api/` route handlers exist anywhere in the repo. The only "API" surface is:

1. **One React Server Action**: `submitBooking` (`src/lib/actions/submit-booking.ts`), invoked directly from `BookingForm` via `useActionState`. It:
   - Validates a honeypot field (`website`) — bot submissions are routed through the normal success redirect so detection is never revealed.
   - Validates a hidden `startedAt` timestamp against a 3-second minimum time-to-submit, treating missing/zero/negative timestamps as spam (a fixed P2 finding — `Number("")` used to pass a naive finite check).
   - Validates the payload with a **Zod schema** (name, email, phone, vehicle, service enum, vehicle-size enum, preferred date, optional notes).
   - On success, calls `deliverLead()`, which POSTs to an **outbound webhook** (`BOOKING_WEBHOOK_URL`) via `sendToCrm()`.
   - Redirects to `/thank-you` only on confirmed delivery (or in non-production without a configured webhook, to keep local dev unblocked); otherwise returns `{ ok: false, errors: { form: ... } }` so the form can show a fail-loud message with a pre-filled `mailto:` fallback built from the visitor's own answers.

2. **Outbound webhook client**: `src/lib/crm.ts` (`sendToCrm`), guarded by the `server-only` package so it can never be imported into a Client Component. Implements:
   - Up to 3 attempts with exponential backoff (400ms → 800ms).
   - Retries only on 5xx / 429 / network-timeout — 4xx responses are treated as permanently non-retryable (a documented fix for a prior P2 finding that retried un-retryable errors with no backoff).
   - An 8-second per-request timeout via `AbortSignal.timeout`, so a hung webhook can't stall the Server Action indefinitely.
   - Documented as "Phase 1" — a comment marks the intended evolution to API Gateway → SQS in a later phase, with the same calling interface preserved.

3. **Generated metadata endpoints**: `sitemap.ts`, `robots.ts`, and `opengraph-image.tsx` are Next.js file conventions that generate their respective outputs at build/request time — not hand-authored APIs, but worth noting as the only other "server compute" in the app.

There is no authentication, no session management, and no database — appropriate for the site's current scope (a single lead-capture form).

---

## 10. Deployment Architecture

- **Host**: Vercel. `main` auto-deploys to production; every pull request receives a preview deployment (there is no separate staging branch/environment).
- **Build**: fully static — `next build` prerenders every route (`next start` exists for completeness but the deployment model is static/serverless prerender via Vercel).
- **Rollback**: manual, via the Vercel dashboard ("Promote to Production" on a prior deployment) — no automated rollback tooling or git-revert-based process.
- **Headers**: `next.config.ts` sets a fixed security header set on every route (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control: on`) and disables `X-Powered-By`.
- **Observability**: `@vercel/analytics` (visitor analytics) and `@vercel/speed-insights` (real-user performance) are mounted in the root layout — both cookieless and zero-config on Vercel. `README.md`/`.env.example` explicitly caution against adding further tracking scripts without pruning, since the performance budget assumes only these two.
- **CI/CD**: **no GitHub Actions or other CI configuration exists in the repo.** `npm run lint`, `npm run typecheck`, and `npm run build` are documented as the pre-push gate in the `builder` skill instructions, but nothing enforces this automatically on push/PR today. A Lighthouse CI budget gate is explicitly listed in the README as a **deferred** item.
- **Environment separation**: no `.env` files are committed (`.gitignore` excludes `.env*`, explicitly re-including `.env.example`); secrets live in Vercel project settings only.
- **PR workflow** (process, not infra): the git history shows a strict one-PR-at-a-time cadence (`feat/site-foundation` → `feat/services-pricing` → `feat/about-gallery-legal` → `feat/cinematic-homepage` → `chore/unsplash-mcp-config` → `feat/about-paint-texture`), each squash-merged to `main`, matching the sequenced-PR roadmap documented in the README.

---

## 11. Environment Variables

All variables are documented centrally in `.env.example`:

| Variable | Required? | Purpose | Behavior when unset |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | **Required in production** | Canonical origin for metadata, canonicals, OG images, sitemap, JSON-LD | `src/lib/seo.ts` **throws at import time** if unset and `NODE_ENV === "production"` — a deliberate fail-fast guard against shipping broken canonical URLs. Falls back to `https://riflessiautocare.ca` in non-production. |
| `BOOKING_WEBHOOK_URL` | Recommended in production | Outbound URL the booking Server Action POSTs leads to | In dev/preview: leads are logged to the server console (`console.warn`) and the happy path (redirect to `/thank-you`) still completes. In production: leads are **not delivered**, `deliverLead()` returns `false`, and the visitor sees the fail-loud UI with the `mailto` fallback — nothing is silently lost, but this is a genuine launch blocker tracked in `REVIEW-FINDINGS.md`. |
| `UNSPLASH_ACCESS_KEY` | Optional, local-only | Feeds a local Unsplash MCP server (`.mcp.json`) used purely as an authoring aid for sourcing placeholder imagery | No effect on build or deploy; not read by any application code. |

No other secrets (API keys, database URLs, auth tokens) exist in the current architecture, consistent with there being no database or third-party API integrations beyond the CRM webhook and Vercel's own zero-config analytics.

---

## 12. Performance Analysis

**Strengths:**
- **Fully static output** — every route is prerendered; there is no per-request server computation for content pages, minimizing TTFB.
- **Minimal client JavaScript by design and by policy.** The component README enumerates exactly which components are allowed `"use client"`, and `FRAMEWORK.md` maintains a running "client JS census" that is updated whenever a new client boundary is added — an unusually disciplined practice for controlling bundle growth over time.
- **The homepage's heaviest feature (WebGL stage) is capability-gated *before* the import resolves**, not just before the render. `capability.ts`'s `detectStageCapability()` checks `prefers-reduced-motion`, viewport width (<768px → static), pointer coarseness, `navigator.connection.saveData`, `deviceMemory` (<4GB), and `hardwareConcurrency` (<4 cores) — any ambiguous signal falls back conservatively to a CSS-only `StageFallback`, so phones, save-data connections, and older machines never download `three`/`drei`/`gsap`/`lenis` at all. This is implemented via `next/dynamic(..., { ssr: false })` inside a Client Component boundary, matching the documented Next.js code-splitting requirement.
- **The 3D stage pauses off-screen**: an `IntersectionObserver` flips `frameloop` to `"never"` once the sequence scrolls out of view, and a single `useFrame` owner (`StageDirector`, per `FRAMEWORK.md`) drives camera/exposure/material — explicitly to avoid competing render loops.
- **No asset downloads for the 3D scene** — geometry is procedurally generated (`paint-tester-geometry.ts`) and lit with baked `Lightformer` planes rather than GLB/HDR assets, keeping the homepage's heaviest feature dependency-free of binary asset weight.
- **LCP-safe animation**: the `riseIn` keyframe used for hero text is transform-only (opacity stays at 1), explicitly so the largest contentful paint is never delayed by an animation.
- **Scroll-reveal system is hydration-safe**: the hidden state (`opacity:0`) is only ever applied once JS has run and stamped `html.js`, and elements already in the viewport on load are released from the reveal selector immediately — so no-JS visitors, slow-hydrating clients, and reduced-motion users never see a flash of invisible content.
- **Images**: `next/image` is used exclusively through the single `MediaFrame` component with responsive `sizes` hints tuned per usage context (grid vs. hero), rather than ad hoc `<img>` tags scattered through pages.
- **Fonts**: both typefaces are loaded via `next/font/google`, which self-hosts and inlines font-display strategy automatically, avoiding render-blocking external font requests.

**Risks / gaps:**
- **No performance CI gate exists yet.** The README explicitly targets "Lighthouse 95+" as a budget but the Lighthouse CI wiring into GitHub Actions is listed as **deferred**, not implemented — so regressions are currently caught only by manual review, not automatically enforced.
- **No bundle-size analysis tooling** (`@next/bundle-analyzer` or equivalent) is configured, so the client-JS census in `FRAMEWORK.md` is a manually maintained, not machine-verified, invariant.
- All 12 images are `.jpg` stock photography of unconfirmed dimensions/compression — `IMAGE-CREDITS.md` documents target display widths (~570px / ~285px) and recommended source sizes (1600×1200 / 1000×750), but there's no automated check that shipped files match those targets or are optimally compressed.
- `useSyncExternalStore` scroll listener in `NavBar` runs on every scroll event (throttled only by the browser's own event coalescing) — low risk given it just flips a boolean, but worth noting as the one always-on client subscription outside the homepage.

---

## 13. Accessibility

Accessibility is treated as a first-class, code-enforced concern rather than an afterthought:

- **Skip link**: a `sr-only focus:not-sr-only` "Skip to main content" anchor is the first element in `<body>`, targeting a `#main-content` div with `tabIndex={-1}` — present on every page via the root layout.
- **Reduced motion respected everywhere motion exists**: `ScrollReveal`, `CountUp`, and `detectStageCapability()` all check `prefers-reduced-motion: reduce` before running any animation, and CSS scroll-reveal rules are wrapped in an `@media (prefers-reduced-motion: no-preference)` block — the *default* state (no JS, or reduced motion) is always the fully visible, final content.
- **Focus management in the mobile nav drawer** (`NavBar.tsx`): focus moves to the first focusable element on open, `Escape` closes and returns focus to the hamburger button, and a manual Tab-trap (`handleDrawerKeyDown`) cycles focus between first/last focusable elements — a hand-rolled but complete focus-trap implementation, with `role="dialog"`, `aria-modal="true"`, and `aria-label`.
- **Form accessibility** (`BookingForm.tsx`): every field has an associated `<label>`, `aria-describedby` pointing at field-specific error text, `aria-invalid` reflecting validation state, and `role="alert"` on error messages so screen readers announce them. The delivery-failure banner is also `role="alert"`.
- **Icons and decorative elements**: consistently marked `aria-hidden="true"` (arrows, bullet dashes, the "riflesso" hairlines) so screen readers don't announce visual flourishes as content.
- **Semantic landmarks**: `<nav aria-label="...">` used distinctly for desktop nav, mobile nav, and each footer column, avoiding ambiguous multiple unlabeled `<nav>` elements.
- **Heading hierarchy discipline**: the homepage's first cinematic act renders an `<h1>`, subsequent acts render `<h2>` — enforced structurally in `ActPanel`, not left to per-page convention.
- **Color contrast**: the dark "Nero Lucido" palette was evidently designed with contrast in mind (near-white `--color-fg: #f5f2ec` on near-black surfaces), though no automated contrast-ratio testing (e.g., axe-core) appears in the toolchain.
- **Autofill styling override**: `globals.css` explicitly overrides the browser's default yellow/white autofill background to keep it on-palette without breaking legibility (`-webkit-text-fill-color`, `caret-color`).

**Gap**: there is no automated accessibility testing (no `axe-core`, `jest-axe`, or Playwright a11y assertions) — all of the above is manually authored and verified, with no regression safety net.

---

## 14. SEO

SEO is centralized and systematic rather than duplicated per-page:

- **Single metadata authority**: `buildMetadata()` in `src/lib/seo.ts` is the only way pages set `<title>`, description, canonical URL, Open Graph, and Twitter card metadata. Canonical URLs are always absolute with no trailing slash.
- **JSON-LD builders**, all in `seo.ts`, rendered via the shared `<JsonLd>` component:
  - `localBusinessSchema()` (`AutoRepair` type, site-wide, rendered once in the root layout, with `areaServed` cities and a `PropertyValue` describing the drop-off service model — address is deliberately omitted for a home-based, service-area business).
  - `websiteSchema()` (site-wide `WebSite` node).
  - `serviceSchema()` (per service detail page).
  - `faqSchema()` (per FAQ block, service pages and homepage).
  - `offerCatalogSchema()` (pricing page — every package × vehicle-size tier as an `Offer`).
  - `breadcrumbSchema()` (every nested route).
- **`sitemap.ts`** is an explicit allow-list (not an auto-crawl), which correctly **excludes `/thank-you`** — documented reasoning: listing a `noindex` URL in a sitemap sends contradictory signals to search engines. This was a fixed P1 finding (a prior version had `robots.ts` *disallowing* `/thank-you`, which would have prevented Google from ever crawling it far enough to see the `noindex` meta tag — a self-defeating combination now corrected).
- **`robots.ts`** allows all crawling and points at the sitemap; no accidental over-blocking.
- **Custom OG image** (`opengraph-image.tsx`) generated via `next/og`, using the same design tokens as the site (via `design-tokens.ts`) rather than a static exported image.
- **Local SEO strategy is documented separately** (`docs/seo/LOCAL-SEO.md`) covering on-site structure (service pages targeting one keyword + city modifier each), planned location pages, Google Business Profile setup guidance, backlink targets, and a measurement plan — this is unusually thorough for a project at this stage, though it is a planning document, not yet fully implemented (location pages don't exist yet).
- **404 handling**: custom `not-found.tsx` avoids a dead-end page by surfacing service links and the primary CTA — good for both UX and avoiding orphaned crawl paths.
- **Content honesty as an SEO/trust safeguard**: the "no-invention rule" (business claims must trace to `site.ts`) reduces the risk of E-E-A-T-damaging inconsistencies between marketing copy and reality.

**Gap**: no `/locations/[slug]` pages yet despite being the primary local-SEO lever described in `LOCAL-SEO.md` — this is the single largest missing SEO surface (see §19).

---

## 15. Security

- **Security headers** set globally in `next.config.ts`: `X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, `Referrer-Policy: strict-origin-when-cross-origin`, `X-DNS-Prefetch-Control: on`, and `poweredByHeader: false`. **No `Content-Security-Policy` header is configured** — given the site loads Vercel Analytics/Speed Insights scripts and (on the homepage) WebGL/canvas content, a CSP is feasible but not yet present.
- **Input validation**: all booking form input is validated server-side with Zod before use; nothing is trusted from the client beyond schema-checked fields.
- **Spam/bot defenses**: honeypot field + time-gate (3-second minimum) on the booking form, with detection outcomes deliberately never revealed to the client (bots see the same success redirect as legitimate submissions) — a sound anti-enumeration practice.
- **Server/client boundary enforcement**: `src/lib/crm.ts` imports the `server-only` package, which throws a build error if it's ever imported into client-bundled code — this is a real compile-time guarantee (not just convention) that the webhook URL and CRM logic can never leak into the browser bundle.
- **Secrets handling**: no secrets are committed; `.env*` is git-ignored (with `.env.example` explicitly re-included as a template); the production build **fails closed** if `NEXT_PUBLIC_SITE_URL` is missing, and the booking action **fails loud** (not silently) if `BOOKING_WEBHOOK_URL` is missing in production.
- **Outbound request hardening**: the CRM webhook call uses `AbortSignal.timeout(8000)` to bound worst-case latency, and only retries idempotent-safe failure classes (5xx/429/network) — reduces risk of a slow or malicious webhook endpoint tying up server resources indefinitely.
- **No authentication/authorization surface exists** — appropriate, since there is no user-facing account system, admin panel, or protected data.
- **Dependency posture**: dependencies are current-generation (Next 16, React 19, Zod 4, Tailwind 4) as of the repo's timeline; no automated dependency-vulnerability scanning (Dependabot/Snyk config) was found in the file listing.
- **Third-party MCP tooling** (`.mcp.json`, Unsplash) is explicitly scoped as a local authoring aid with no runtime/build/deploy dependency — a reasonable containment of a dev-only integration.

**Gaps**: no CSP; no automated dependency scanning; no rate-limiting on the Server Action beyond the time-gate (a determined attacker could still script many slow-drip submissions, though the webhook retry/backoff and honeypot reduce the practical impact).

---

## 16. Technical Debt

Debt is unusually well-tracked in this repo (`docs/maintenance/REVIEW-FINDINGS.md` shows a clean history of P1/P2 findings, all resolved as of the current `main`). Remaining/observed debt:

1. **No automated test suite of any kind.** No unit tests (Zod schema, `crm.ts` retry logic), no component tests, no E2E tests (booking flow, spam-gate behavior). Given the amount of carefully-reasoned edge-case logic in `submit-booking.ts` and `crm.ts` (timing spam detection, retry/backoff, fail-loud semantics), this logic is currently protected only by manual review and code comments, not regression tests.
2. **No CI pipeline.** `lint`/`typecheck`/`build` are documented as required pre-push gates in process docs (the `builder` skill), but nothing in the repository enforces this automatically on push or PR — it depends entirely on developer discipline.
3. **Manually-synchronized design tokens.** The palette exists in two files (`globals.css` `@theme` and `design-tokens.ts`) with a `MIRROR:` comment as the only enforcement — a linter rule or generation step could eliminate this drift risk entirely (explicitly flagged, not automated, per finding #7 in `REVIEW-FINDINGS.md`).
4. **Owner-blocking content debt**, tracked as explicit launch gates, not code debt: placeholder pricing (`pricing.ts`), unconfirmed contact email/production domain, unconfirmed stats figure, unreviewed legal copy (4 open gaps: retention period, cancellation/deposit policy, insurance wording, registered business name), and the requirement to set `BOOKING_WEBHOOK_URL` in production before go-live.
5. **All 12 site images are temporary licensed stock**, not the business's own work — tracked with unusual rigor (`IMAGE-CREDITS.md` documents exactly which files, source, and replacement procedure), but represents real content debt: the gallery in particular cannot be presented as portfolio proof of work until replaced.
6. **No bundle-size or Lighthouse CI gate**, despite the README asserting a "Lighthouse 95+" performance budget as a project value — currently unverified in an automated way.
7. **Hand-rolled focus trap** in `NavBar`'s mobile drawer works but duplicates logic a library (`focus-trap-react`, Radix, etc.) would otherwise centralize and test — an acceptable trade-off given the goal of minimal client JS, but worth flagging as bespoke code that a future contributor must maintain correctly by hand.
8. **`.mcp.json`** hardcodes an absolute macOS-style path (`/Users/clintonjayr/.claude/mcp-servers/...`) for the Unsplash MCP server — this is dev-tooling config, not app code, but it is not portable across contributor machines and would need per-developer local override (the README does note the install lives outside the repo, but the path itself is still user-specific).

---

## 17. Reusable Modules

The repository is explicitly engineered as a reusable framework (`docs/maintenance/FRAMEWORK.md`), with three declared "swap layers":

| Swap layer | Location | Effort to re-skin for a new client |
|---|---|---|
| **Theme** | `globals.css` `@theme` block + `design-tokens.ts` | Replace hex *values* only; token *names* (`bg-surface`, `text-accent`) are the stable contract components consume. |
| **Content** | `src/lib/content/*` + `src/types/content.ts` | Rewrite the data modules (services, pricing, process, gallery, FAQ, stats, site facts, navigation); pages/components are untouched. |
| **Fonts** | Two `next/font` imports in `layout.tsx` + `--font-*` tokens | Swap the imports; the serif/sans structural split is preserved. |

Beyond the swap layers, specific modules are called out in `FRAMEWORK.md` as reusable, business-agnostic primitives going forward:

- `ui/icons.tsx`, `ui/SectionHeading.tsx`
- `shared/MediaFrame.tsx`, `shared/BeforeAfterPair.tsx`
- `shared/StatsBand.tsx` + `shared/CountUp.tsx`
- `layout/StickyBookBar.tsx`
- The entire `lib/seo.ts` JSON-LD builder family and `buildMetadata()`
- The form → Server Action → `crm.ts` lead pipeline (honeypot, time-gate, retry, fail-loud contract) — described as portable to any lead-gen business by changing only the POST target
- **`components/cinema/`**, the scroll-driven 3D stage, is explicitly designed to be re-skinned for other automotive trades (PPF, tint, wrap, ceramic-coating specialists) by rewriting only `lib/content/cinema.ts` (the seven "acts": copy + camera pose + exposure + finish value) and the palette — the sequence component itself is asserted to contain no business-specific logic.

This reuse intent is a genuine architectural throughline, not just aspirational documentation — the type contracts in `src/types/` are what make it enforceable (a new client's content must conform to the same shapes, so the component layer cannot silently accrue business-specific assumptions).

---

## 18. Current Features

**Marketing / conversion:**
- Conversion-first homepage with a scroll-driven cinematic 3D "paint tester" hero (progressively enhanced, capability-gated), services overview, animated stat counters, drop-off process explainer, gallery preview, featured packages, customer experience section, FAQ, and CTA band.
- Four service detail pages (Interior, Exterior, Full Detail, Ceramic Coating), each with benefits, "what's included," per-vehicle-size exact pricing, cross-links to complementary services ("Pairs well with"), and page-specific FAQ.
- Pricing page: exact CAD pricing across 3 vehicle-size tiers × 4 packages, plus an add-ons list.
- Gallery page: before/after photo pairs (currently stock, pending real photography), each linking to its relevant service page.
- About page: brand story passages, "four things that happen every time" standards, "four things that never will" refusals, service-area statement, stats band.
- Privacy and Terms pages, driven by a shared `legal.ts` content module and `LegalContent` renderer.
- Custom "thank you" confirmation page (noindex) and custom 404 page, both designed to never dead-end a visitor.

**Lead capture:**
- Booking form (`/contact`) with name/email/phone/vehicle/service/vehicle-size/preferred-date/notes fields, full server-side Zod validation, per-field error echo, and a graceful failure path (fail-loud message + pre-filled `mailto:` fallback carrying the visitor's own answers).
- Honeypot + timing-based spam filtering that never reveals detection to the (possibly automated) submitter.
- Outbound CRM webhook delivery with retry/backoff and timeout; console-logged fallback in local/preview environments so no dev-time lead is lost or blocks local testing.
- Persistent mobile "Book a Detail" sticky bar and a "Book a Detail" CTA in the desktop nav — the primary CTA is reachable from every screen size at all times.

**Technical/SEO:**
- Full metadata + JSON-LD structured data (`AutoRepair`, `WebSite`, `Service`, `FAQPage`, `OfferCatalog`, `BreadcrumbList`) on every relevant route.
- Generated `sitemap.xml`, `robots.txt`, and dynamic Open Graph image.
- Skip-to-content link, focus-trapped mobile nav drawer, reduced-motion-safe animation throughout.
- Security response headers on every route.
- Vercel Analytics + Speed Insights wired in.

---

## 19. Missing Features

Directly cited in the repo's own roadmap/docs as **not yet built**:

1. **`/locations/[slug]` pages** (New Westminster, Burnaby, Coquitlam, Surrey, Vancouver) — the single largest planned local-SEO surface, per both the README roadmap (PR #4) and `docs/seo/LOCAL-SEO.md`. Footer/nav infrastructure for this does not yet exist.
2. **`/guides` education hub** — phase 2 SEO content-cluster blog, structure "reserved" but not started; no CMS or MDX pipeline exists to support it yet.
3. **Lighthouse CI performance budget gate** wired into GitHub Actions — explicitly deferred.
4. **Real photography** to replace all 12 stock images — a content task, not a code task (paths are stable per `IMAGE-CREDITS.md`, so this requires no code change, only asset replacement).
5. **Any CI/CD automation** — no GitHub Actions workflows exist for lint/typecheck/build/test on PRs; this is currently a fully manual gate.
6. **Automated testing at any level** (unit, integration, E2E, accessibility) — not on the roadmap in any doc reviewed, but a notable absence given the complexity of the booking/spam-detection logic.
7. **Content Security Policy header** — not present in `next.config.ts`'s header set.
8. **Business-facing polish not yet confirmed**: real pricing, confirmed contact email/phone/domain, lawyer-reviewed legal pages, confirmed stats figures — all explicitly tracked as pre-launch owner action items in `REVIEW-FINDINGS.md`.
9. **No booking/scheduling system** — by design (documented as "form-only, owner confirms each slot manually since there's a single bay"), but worth naming as a feature ceiling: there is no calendar, availability display, or double-booking prevention if the business ever needs one.
10. **No CMS/admin interface** — content changes require a code change and redeploy; appropriate for the current solo-operator scale, but a real constraint if non-technical content updates become frequent.

---

## 20. Recommended Next Milestones

Ordered by leverage and urgency, taking into account both the codebase's own documented priorities and gaps this review identified:

1. **Close the pre-launch business gate** (owner-actionable, blocks going live regardless of code quality): confirm real pricing, contact email/domain, stats figures, and get legal review of `/privacy` + `/terms`; set `BOOKING_WEBHOOK_URL` in the Vercel production environment. This is already tracked in `REVIEW-FINDINGS.md` — it needs execution, not new engineering.
2. **Stand up a minimal CI pipeline** (`lint` + `typecheck` + `build` on every PR via GitHub Actions) before the next feature PR lands. This is cheap, matches the process the `builder`/`reviewer` skills already assume, and converts today's honor-system pre-push gate into an enforced one.
3. **Add test coverage for the booking pipeline first**, not the whole app: unit tests for `bookingSchema` validation, `timingSpamReason`, and `sendToCrm`'s retry/backoff/timeout behavior (all pure, easily testable functions today with zero test coverage) — this is the highest-risk untested logic in the repo because it directly gates whether real leads are captured or lost.
4. **Build the `/locations/[slug]` pages** (PR #4 in the existing roadmap) — the largest single lever for the stated local-SEO goal, and the content/type-contract groundwork (`SERVICE_CITIES`, the swap-layer architecture) is already in place to support it cleanly.
5. **Replace stock photography with real photography** behind the existing `MediaFrame` paths — no code change required per `IMAGE-CREDITS.md`, but currently blocks using the gallery as genuine proof-of-work in marketing/GBP, which undercuts the trust-building goal stated in the README.
6. **Add a Content-Security-Policy header** to `next.config.ts`, scoped to the known script sources (Vercel Analytics/Speed Insights, self-hosted fonts, inline styles from Tailwind) — a relatively small, high-value security hardening step given headers are already centralized in one file.
7. **Automate the design-token mirror** between `globals.css` and `design-tokens.ts` (a small script or a single generated source file) to remove the last manually-synchronized piece of the theming system — low effort, removes a standing (if currently well-documented) drift risk.
8. **Wire up a Lighthouse CI budget gate**, as already promised in the README, once CI exists (#2) — turns the "Lighthouse 95+" claim from an aspiration into an enforced regression check, which matters most for a repo intended to be reused as a framework by future client sites.

Deliberately **not** recommended as near-term work: introducing a CMS, a global state library, or a scheduling/calendar system — none are justified by current scale, and each would work against the site's demonstrated design principle of minimal moving parts for a static, form-driven marketing site.
