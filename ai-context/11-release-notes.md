# Riflessi release notes

Each release is tagged `vX.Y.Z` on `main` and published as a GitHub release. Milestones are listed under the release that shipped them, newest first.

## Unreleased

### 2026-10-02 — Homepage car re-framed (#21)

- Five of the seven acts in the homepage's scroll sequence are re-framed from the owner's own Stage Tuner session. The opening act now shows the whole front of the car instead of cropping the nose at the screen edge, and the reveal, finishes and invitation acts sit the car further into the right half, clear of the copy.
- The camera path was checked against the car's real mesh: it never comes closer than 2.05 scene units.
- Desktop only, since phones and reduced-motion never load the 3D stage. No change to content, routes, booking, or bundle size.

## v1.0.0 — 2026-09-29

Riflessi Auto Care is live at https://riflessiautocare.ca (`www` redirects to it).

Tagged on 2026-10-06 at the merge of #20 (`d07bc5f`), once the owner confirmed that a real booking and a real question from the live site had both reached the inbox.

**What's live**

- Home with the scroll-driven cinematic stage (progressive enhancement: phones and reduced-motion get the static page), services and a page for each of the four services, pricing, gallery (film hero, before/after slider), about, contact, privacy, terms, and thank-you.
- Booking and "Questions first?" contact forms on `/contact`. Each delivers server-side to its own Formspree endpoint, which emails `hello@riflessiautocare.ca`. Server-side validation; honeypot and page-timing spam checks; retries; a fail-loud fallback that pre-fills an email if delivery fails. A lead the timing check can't vouch for (JavaScript off, or sent before the page loaded) is delivered flagged `[No timing check]`, never dropped.
- The Riflessi "R" mark in the header and footer; SVG favicon, `favicon.ico`, Apple touch icon, and a JSON-LD logo, all built from one traced path.
- SEO: canonical URLs, sitemap, robots, Open Graph image, and `AutoRepair` / `Service` JSON-LD for the five Metro Vancouver cities.
- Vercel Analytics and Speed Insights.

**Security**

- Next.js 16.2.7 → 16.3.6. This fixes a critical advisory (including a denial of service through Server Actions, which both forms use) and clears the `postcss` and `sharp` advisories. `npm audit` reports 0 vulnerabilities.
- HTTPS with HSTS, `nosniff`, `SAMEORIGIN` framing, and a strict referrer policy.

**Quality gates**

- CI runs lint, typecheck, Vitest (33 tests), and build on every pull request.

**Known gaps (not blocking launch)**

- The legal pages are plain-language drafts awaiting a lawyer's review, with `TODO(owner)` gaps.
- Imagery isn't settled. `/about` still shows stock frames of another bay and craftsman beside copy about this bay. The owner hasn't ruled on whether the showcase photos ("Il Portfolio" on the home page and `/gallery`) fit the outdoor-bay copy. `docs/maintenance/IMAGE-CREDITS.md` still lists all 12 credited images as stock, though some are now the owner's own.
- No Content-Security-Policy, Lighthouse CI gate, or failed-booking alert yet (see the roadmap).
- `/locations/[slug]` pages for the five cities are still to come.

### 2026-07-30 — Continuous integration

- Added `.github/workflows/ci.yml`: lint, typecheck, and build on every pull request and on `main`.
- Closes the first item under "Engineering protection"; tests and the Lighthouse gate remain open.

### 2026-07-30 — AI context baseline

- Added project context, working rules, roadmap, and a Claude Code entrypoint grounded in the repository analysis.
- No production behavior, public content, dependency, or deployment configuration changed.
