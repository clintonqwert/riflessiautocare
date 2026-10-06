# Riflessi Auto Care

**A private, appointment-only auto detailing service for Metro Vancouver. One vehicle at a time, drop-off only.**

This repository is the site at [riflessiautocare.ca](https://riflessiautocare.ca), built with Next.js 16, TypeScript, and Tailwind CSS v4 and deployed on Vercel. It is also **version 1 of a reusable Automotive Service Website Framework**: the next detailing or service business is a token and content swap, not a rebuild. The architecture is ported from the [Driftpilot](https://github.com/clintonqwert/driftpilot-site) codebase and hardened here.

**Status:** 1.0.0, live since 2026-09-29. See the [release notes](ai-context/11-release-notes.md). The legal pages and some imagery still wait on the owner; [Known gaps](#known-gaps) lists them.

---

## Overview

Riflessi is a solo operation run from a home-based setup, one detailing bay and a small garage, and the site turns that size into the pitch: no queue, no rotating crew, no volume targets. A booking reserves the whole bay for the whole visit, and the person you meet at drop-off details your car and walks you around it at pickup.

The site has five jobs: generate detailing bookings, explain what a proper detail involves, build trust, support local SEO across Metro Vancouver, and set Riflessi apart from mobile and volume competitors. Every page leads to one conversion path, **Book a Detail**.

Honesty is a hard constraint in the code. The copy never calls the operation a "studio" or an indoor facility, and every business claim traces to a published fact in `src/lib/content/site.ts`. The owner confirmed every price and stat before 1.0.0.

## Features

**Site**

- Design language **"Nero Lucido"**: obsidian black with a champagne-bronze accent, Fraunces display serif over Figtree.
- A homepage built around a scroll-driven 3D stage: a car on a plinth, re-framed across five acts as you scroll. Phones and reduced-motion visitors get the static page instead.
- Services overview, a page for each of the four services, pricing by vehicle size with add-ons, a gallery (film hero, before/after slider), about, contact, privacy, terms, thank-you, and a custom 404.
- Two forms on `/contact`: **Book a Detail**, and **Questions first?** for visitors not ready to book. Each delivers server-side to its own Formspree endpoint, which emails the business inbox.
- Leads are never lost behind a "thanks". A failed delivery shows the visitor an error and an email link pre-filled with their answers. A submission the timing check can't vouch for (JavaScript off, or sent before the page loaded) arrives flagged `[No timing check]` instead of being dropped.
- SEO from one authority, `src/lib/seo.ts`: per-page metadata, `AutoRepair`, `Service`, `FAQPage`, `OfferCatalog` and `BreadcrumbList` JSON-LD, a sitemap, robots, and an Open Graph image.
- Mobile-first throughout, with a persistent **Book a Detail** bar on small screens.

**Engineering**

- Every route prerendered at build time. No runtime database.
- The 3D model went from 19 MB to 2 MB through `scripts/prepare-car-model.mjs` (meshopt compression, hidden geometry dropped). It is served from `/models/` with an immutable cache header, and a new model gets a new filename.
- Owner photography goes through `npm run optimise-assets`, which crops, resizes, blurs declared licence plates, and strips all metadata. Phone EXIF carries GPS, and these photos are taken at a home address the site keeps private until a booking is confirmed.
- Vitest unit tests over the lead pipeline: schemas, the timing gate, payload shaping, no retry on a 4xx, and the fallback email link.
- CI on every pull request: lint, typecheck (`next typegen` + `tsc --noEmit`), tests, and build.
- Routes compose, components render, and content lives behind typed accessors. `src/types/` holds the contracts every layer builds against.
- `server-only` keeps the webhook URLs out of client bundles.

## Technology stack

| Layer | Choice |
|---|---|
| Framework | [Next.js 16](https://nextjs.org) (App Router, React Server Components) |
| Language | TypeScript (strict) |
| UI | React 19, Tailwind CSS v4, semantic design tokens |
| Type | Fraunces (display) and Figtree (body) through `next/font` |
| 3D and motion | React Three Fiber, Three.js, drei, GSAP, Lenis; capability-gated progressive enhancement |
| Validation | Zod 4 |
| Forms | React Server Actions → Formspree, with retries and an email fallback |
| Booking | Form only. The owner confirms each slot by hand (one bay, no live scheduler). |
| Tests | Vitest |
| Analytics | Vercel Web Analytics and Speed Insights |
| Hosting | Vercel (static prerender, preview deployments) |
| Tooling | ESLint 9, PostCSS, `clsx` + `tailwind-merge`, `sharp` and glTF Transform for asset scripts |

## Architecture

The core design decision is a **swappable content layer**. Pages never hardcode business facts. They call accessor functions in `src/lib/content/`, and components receive typed props and never fetch. That boundary makes the repo a reusable framework: re-theming is a token swap, re-branding is a content swap, and neither touches a component.

```
src/
├── app/            # Routes only; pages compose components and fetch via accessors
├── components/     # Presentation only, never fetches
│   ├── layout/  home/  forms/  shared/  ui/  services/
│   └── cinema/     # The scroll-driven 3D stage and its capability checks
├── lib/
│   ├── content/    # The "database": typed modules behind accessors
│   ├── actions/    # Server Actions: submit-booking, submit-contact
│   ├── form-schemas.ts  # Zod schemas for both forms
│   ├── leads.ts    # Spam gate, payload shaping, delivery (all Formspree specifics live here)
│   ├── crm.ts      # Webhook client: 3 attempts, backoff, timeout, no retry on 4xx
│   ├── mailto.ts   # The pre-filled fallback email link
│   ├── seo.ts      # buildMetadata and JSON-LD builders
│   └── design-tokens.ts  # Palette for raw-hex consumers (OG image, 3D stage)
└── types/          # Domain contracts every layer builds against
```

The three swap layers, documented in [`docs/maintenance/FRAMEWORK.md`](docs/maintenance/FRAMEWORK.md):

1. **Theme**: token values in `globals.css @theme` and `design-tokens.ts`. Components consume semantic names (`bg-surface`, `text-accent`) only.
2. **Content**: rewrite the `src/lib/content/*` modules against the fixed `src/types/` shapes. Pages and components don't change.
3. **Fonts**: swap two `next/font` imports and the `--font-*` tokens.

More in [`docs/`](docs/): the 3D model's provenance and licence ([`STAGE-MODEL.md`](docs/maintenance/STAGE-MODEL.md)), tuning the stage ([`STAGE-TUNING.md`](docs/maintenance/STAGE-TUNING.md)), image credits, and the local-SEO plan. Project context for AI-assisted work is in [`ai-context/`](ai-context/).

### Local development

```bash
nvm use                      # Node 22, pinned in .nvmrc
npm install
cp .env.example .env.local   # set NEXT_PUBLIC_SITE_URL; webhooks optional in dev
npm run dev                  # http://localhost:3000
```

```bash
npm run lint             # ESLint
npm run typecheck        # next typegen + tsc --noEmit
npm test                 # Vitest
npm run build            # production build, all routes static
npm run optimise-assets  # prepare owner photography for the web
npm run brand-icons      # rebuild the favicon set from the traced mark
```

Without `BOOKING_WEBHOOK_URL` and `CONTACT_WEBHOOK_URL`, local dev and Vercel previews log each lead to the server console and show the success state, so testing never emails the owner. Only the live site fails loud when a webhook is missing.

In development, a panel bottom-right lets you tune the 3D stage live. [`STAGE-TUNING.md`](docs/maintenance/STAGE-TUNING.md) explains it.

### Stock photography (optional)

[`.mcp.json`](.mcp.json) registers an Unsplash MCP server, started through `npx`, for sourcing placeholder imagery behind the `MediaFrame` components. It is a local authoring aid: no application code imports it, and nothing in the build or deploy path depends on it. It needs an access key from [unsplash.com/developers](https://unsplash.com/developers) in your shell:

```bash
export UNSPLASH_ACCESS_KEY="your_key"   # add to your shell profile
```

If the server crashes on startup with an MCP SDK capability assertion, the cause is upstream: `@drumnation/unsplash-smart-mcp-server` depends on `fastmcp@1.x`, which `@modelcontextprotocol/sdk` 1.22.0 and later reject. Pin the SDK to 1.21.2 in an install outside this repo.

## Deployment

- `main` auto-deploys to production on Vercel at `riflessiautocare.ca`. `www` redirects to the bare domain with a 308.
- Every pull request gets a preview URL and must pass CI. Previews are staging; there is no staging branch.
- `NEXT_PUBLIC_SITE_URL` is required for production builds: `src/lib/seo.ts` throws without it, so a deploy can never ship broken canonical URLs. `BOOKING_WEBHOOK_URL` and `CONTACT_WEBHOOK_URL` are required on the live site. Secrets live in Vercel project settings, never in the repo. [.env.example](.env.example) lists every variable.
- **Rollback:** Vercel dashboard → Deployments → ⋯ on a previous deployment → *Promote to Production*. No redeploy or git revert required.

## Known gaps

From the [1.0.0 release notes](ai-context/11-release-notes.md) and the [roadmap](ai-context/05-roadmap.md):

- The legal pages are plain-language drafts awaiting a lawyer's review, with `TODO(owner)` gaps.
- Imagery isn't settled. `/about` still shows stock frames of another bay, and the owner hasn't ruled on the showcase photos. Until then, nothing on the site should be read as proof of this bay's work.
- No failed-booking alert yet. Today a failed lead reaches someone only if the visitor sends the pre-filled email. Driftpilot's Slack alert is the model.
- No Lighthouse CI budget and no Content-Security-Policy yet.
- The `crm.ts` tests don't yet cover 5xx retry, backoff, or the request timeout.
- `/locations/[slug]` pages for New Westminster, Burnaby, Coquitlam, Surrey, and Vancouver are next on the growth list. The off-site plan (Google Business Profile, backlinks) is in [`docs/seo/LOCAL-SEO.md`](docs/seo/LOCAL-SEO.md).

## Version 1 of a reusable framework

Riflessi is the first build on an **Automotive Service Website Framework**: a fast, SEO-ready, conversion-first foundation for local service businesses. The components, SEO builders, and lead pipeline are brand-agnostic, and everything specific to a detailing business lives in the content and token layers. The next service site starts from this repo, swaps the palette and the content modules, and inherits the accessibility and structured-data work done here.

---

## Book a detail

**[riflessiautocare.ca/contact](https://riflessiautocare.ca/contact)**. One vehicle at a time, by appointment, serving Metro Vancouver.
