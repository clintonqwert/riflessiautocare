# Riflessi Auto Care

**A private, appointment-only auto detailing service for Metro Vancouver — one vehicle at a time, drop-off only.**

This repository contains the production site for Riflessi Auto Care — built with Next.js 16, TypeScript, and Tailwind CSS v4, deployed on Vercel. It is also **Version 1 of a reusable Automotive Service Website Framework**: a brand-agnostic foundation where the next detailing or service business is a token-and-content swap, not a rebuild. The architecture is ported from and hardened against the [Driftpilot](https://driftpilot.ca) codebase, built to the same performance budget (static output, minimal client JS, Lighthouse 95+).

**Status:** In active development — the foundation (theme, layout, lead pipeline, homepage) is built and in review; services, pricing, gallery, about, and location pages follow in sequenced pull requests.

---

## Overview

Riflessi is a solo operation run from a home-based setup — one detailing bay and a small garage — that turns its size into the pitch: no queue, no rotating crew, no volume targets. A booking reserves the whole bay for the whole visit, and the person you meet at drop-off is the person who details your car and walks you around it at pickup.

The site exists to do five things: generate detailing bookings, educate customers on what a proper detail actually involves, build trust, support local SEO across Metro Vancouver, and differentiate from mobile and volume competitors. Every page is built around a single conversion path — **Book a Detail** — with the booking form wired to a lead pipeline from day one.

Honesty is a hard constraint in the codebase: the operation is never described as a "studio" or an indoor/controlled facility, and no claim ships that can't be traced to a published business fact (`src/lib/content/site.ts`). Placeholder prices and contact details are marked `TODO(owner)` until confirmed.

## Features

**Site**

- Design language **"Nero Lucido"** — obsidian black with a champagne-bronze accent, Fraunces display serif over Figtree, and a signature bronze "riflesso" hairline motif
- A conversion-first homepage prerendered at build time: hero, services overview, differentiators with animated stat counters, drop-off process, gallery preview, featured packages, customer experience, FAQ, and CTA band
- Booking form backed by a React Server Action, validated with Zod, delivered to a lead webhook with retry logic; honeypot + time-to-submit spam checks that never reveal detection, and error-echo so a failed submit never loses what the visitor typed
- SEO as a first-class concern: per-page metadata via a shared `buildMetadata` helper, JSON-LD from shared builders (`AutoRepair` / `Service` / `FAQPage` / `OfferCatalog` / `BreadcrumbList`), navigation and footer rendered from a single source of truth, generated `sitemap.xml` and `robots.txt`
- Custom 404 and thank-you pages so no conversion path dead-ends
- Mobile-first throughout, with a persistent bottom **Book a Detail** bar on small screens

**Engineering**

- Fully static output — every route prerendered at build time, no runtime database, minimal client JS (only the nav, booking form, and the two motion islands ship JavaScript)
- Strict separation of concerns: routes fetch, components render, content lives behind typed accessor functions
- Server-only boundaries enforced with the `server-only` package; the webhook target never reaches a client component
- TypeScript strict mode with domain contracts (`src/types/`) shared across every layer
- Reduced-motion and no-JS safety baked into the motion layer (scroll reveals, count-up counters) — content is always visible, animation only ever enhances
- Honesty enforced in code: business claims trace to published facts in `src/lib/content/site.ts`, with a vocabulary rule keeping the copy true to a home-based bay
- CI-friendly scripts: `lint`, `typecheck` (`next typegen` + `tsc --noEmit`), `build`

## Technology stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS v4, semantic design tokens |
| Type | Fraunces (display) + Figtree (body) via `next/font` |
| Motion | CSS scroll reveals + count-up counters (reduced-motion safe, no library) |
| Validation | Zod 4 |
| Forms | React Server Actions → lead webhook, retry with graceful degradation |
| Booking | Form-only — owner confirms each slot manually (single bay, no live scheduler) |
| Analytics | Vercel Web Analytics + Speed Insights — cookieless, privacy-friendly, zero-config |
| Hosting | Vercel (static prerender, preview deployments) |
| Tooling | ESLint 9, PostCSS, `clsx` + `tailwind-merge` |

## Architecture

The core design decision is a **swappable content layer**. Pages never hardcode business facts — they call accessor functions in `src/lib/content/`, and components receive typed props and never fetch. That boundary is what makes this repo a reusable framework: re-theming is a token swap, re-branding is a content swap, and neither touches a component.

```
src/
├── app/          # Routes only — pages compose components and fetch via accessors
├── components/   # Presentation only, never fetches
│   ├── layout/   home/   forms/   shared/   ui/
├── lib/
│   ├── content/  # The "database": typed TS modules behind accessors
│   │             # (services, pricing, process, gallery, faq, stats,
│   │             #  navigation, site facts)
│   ├── actions/  # Server Actions (booking → lead webhook)
│   ├── crm.ts    # Webhook client with retry
│   ├── seo.ts    # buildMetadata + JSON-LD builders (single SEO authority)
│   ├── design-tokens.ts  # Palette for raw-hex consumers only (OG image)
│   └── utils.ts
└── types/        # Domain contracts every layer builds against
```

The three swap layers (documented in [`docs/maintenance/FRAMEWORK.md`](docs/maintenance/FRAMEWORK.md)):

1. **Theme** — token *values* in `globals.css @theme` + `design-tokens.ts`. Components consume semantic names (`bg-surface`, `text-accent`) only; token names never change.
2. **Content** — rewrite the `src/lib/content/*` modules against the fixed `src/types/` shapes. Pages and components don't change.
3. **Fonts** — swap two `next/font` imports and the `--font-*` tokens.

`src/types/` is the contract that makes this hold: content shapes, form schemas, and component variants are defined once and consumed everywhere. The framework reuse contract and the local-SEO playbook are documented in [`docs/`](docs/).

### Local development

```bash
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL; webhook optional in dev
npm run dev                  # http://localhost:3000
```

```bash
npm run lint        # ESLint
npm run typecheck   # next typegen + tsc --noEmit
npm run build       # production build — all routes static
```

Without `BOOKING_WEBHOOK_URL` set, booking submissions are logged to the server console instead of delivered — so no lead is lost in development.

### Stock photography (optional)

[.mcp.json](.mcp.json) registers an Unsplash MCP server for sourcing placeholder imagery behind the `MediaFrame` components until real photography is shot. It is a local authoring aid — no application code imports it, and nothing in the build or deploy path depends on it.

It needs two things that do not travel with the repo. Set an access key from [unsplash.com/developers](https://unsplash.com/developers):

```bash
export UNSPLASH_ACCESS_KEY="your_key"   # add to your shell profile
```

Then install the server at the path `.mcp.json` points to, pinning the MCP SDK — `@drumnation/unsplash-smart-mcp-server` depends on `fastmcp@1.x`, which registers a `completion/complete` handler without declaring the matching capability, and SDK 1.22.0 added an assertion that makes that combination crash on startup:

```bash
mkdir -p ~/.claude/mcp-servers/unsplash-smart && cd $_ && npm init -y
npm pkg set 'overrides.@modelcontextprotocol/sdk=1.21.2'
npm install @drumnation/unsplash-smart-mcp-server
```

The install lives outside the repo so its dependency tree stays out of this project's. Skip all of this if you are not sourcing images — the rest of the site is unaffected.

## Deployment

- `main` auto-deploys to production on Vercel.
- Every pull request gets a preview URL. Previews are staging — there is no staging branch.
- `NEXT_PUBLIC_SITE_URL` is required for production builds — `src/lib/seo.ts` throws without it so a deploy can never ship broken canonical URLs. Secrets live in Vercel project settings (encrypted), never in the repo. See [.env.example](.env.example) for the full variable inventory.
- **Rollback:** Vercel dashboard → Deployments → ⋯ on a previous deployment → *Promote to Production*. No redeploy or git revert required.

## Roadmap

The site ships in sequenced pull requests — one PR at a time, merged after review. Shared foundation (layout, theme, SEO authority) lands first so later branches don't collide.

| PR | Scope | Status |
|---|---|---|
| **1 — Foundation** | Theme, layout, navigation, lead pipeline, homepage, contact/thank-you, SEO + docs | ✅ Built |
| **2 — Services & Pricing** | Services overview, four service detail pages, pricing by vehicle size + add-ons | Planned |
| **3 — About, Gallery, Legal** | The Riflessi story, before/after gallery, privacy + terms | Planned |
| **4 — Location pages** | `/locations/[slug]` for New Westminster, Burnaby, Coquitlam, Surrey, Vancouver | Planned |

Deferred (structure reserved): a `/guides` education hub for SEO topic clusters, real photography swapped in behind the existing `MediaFrame` placeholders (a content change, not a layout one), and the framework's Lighthouse CI budget gate wired into GitHub Actions. Off-site local SEO (Google Business Profile, backlinks) is documented in [`docs/seo/LOCAL-SEO.md`](docs/seo/LOCAL-SEO.md).

## Version 1 of a reusable framework

Riflessi is the first build on an **Automotive Service Website Framework** — a fast, SEO-ready, conversion-first foundation for local service businesses. The components, SEO builders, and lead pipeline are brand-agnostic; everything specific to a detailing business lives in the content and token layers. The next client site starts from this repo, swaps the palette and the content modules, and inherits the performance, accessibility, and structured-data work already done here.

---

## Working with Riflessi Auto Care

Book a drop-off detail: **[/contact](https://riflessiautocare.vercel.app/contact)** — one vehicle at a time, by appointment, serving Metro Vancouver.
