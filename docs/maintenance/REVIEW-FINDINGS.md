# Open Review Findings

Findings from the Senior Staff review of PR #1 (`feat/site-foundation`). None
block merge to the feature line. They are scheduled to be fixed **as the site
is built** — each is mapped to the PR that naturally touches that code. The
three P1s and the owner TODOs are **launch-gating**: close them before the real
domain is promoted to production.

Status legend: ⬜ open · 🔜 scheduled · ✅ done

| # | Pri | Finding | Fix in | Status |
|---|-----|---------|--------|--------|
| 1 | P1 | **Lead silently lost on webhook failure/misconfig.** `submit-booking.ts` shows `/thank-you` even when `BOOKING_WEBHOOK_URL` is unset or `sendToCrm` returns `false` — lead exists only in server logs. | PR #3 — action now fails loud: the form keeps the visitor's answers and offers a pre-filled `mailto` fallback. Unset webhook fails loud in production, stays permissive in dev. | ✅ PR #3 |
| 2 | P1 | **Nav points at 4 routes that 404** (`/services`, `/pricing`, `/gallery`, `/about`). Fine on a preview; harmful if the real domain is promoted standalone (nav → 404 during first indexing). | PR #3 — `/about` + `/gallery` land, plus `/privacy` + `/terms`. Verified by crawling every internal link on a production build: 16/16 resolve 200. | ✅ PR #3 |
| 3 | P1 | **`/thank-you` `noindex` neutralized by `robots.ts` disallow** — a disallowed URL is never crawled, so Google never sees the `noindex`. Drop the disallow, keep `noindex`. | PR #2 (already editing `robots.ts`/`sitemap.ts` for new routes) | ✅ PR #2 |
| 4 | P2 | **Time-gate no-ops on empty `startedAt`** (pre-hydration / no-JS): `Number("")===0` passes the finite check. Treat missing/zero as spam. | PR #3 — missing/zero/negative stamps are spam. Safe here because the form only submits through the hydrated action (no `$ACTION_ID` is rendered, so there is no no-JS path); noted in code should that ever change. | ✅ PR #3 |
| 5 | P2 | **CRM retry loop retries un-retryable 4xx with no backoff.** Only retry 5xx/network; add a short delay. | PR #3 — retries only 5xx/429/network, exponential backoff (400ms → 800ms), plus an 8s per-request timeout so a hung webhook can't stall the action. | ✅ PR #3 |
| 6 | P2 | **Display labels duplicated ×3** — `SIZE_LABELS`/`SERVICE_LABELS` in `BookingForm.tsx` restate `VEHICLE_SIZE_LABELS` (`types/content.ts`) and service `name`s. Import canonical maps. | PR #2 — `SERVICE_LABELS` canonical in `types/content.ts`; services.ts, navigation.ts, BookingForm all derive | ✅ PR #2 |
| 7 | P2 | **Palette hex mirrored** between `globals.css @theme` and `design-tokens.ts NERO` with nothing enforcing sync. Document the mirror in both files (or generate one). | PR #2 — MIRROR note in both files | ✅ PR #2 |
| 8 | P2 | **`getFeaturedPackages()` uses `.find()!`** — opaque throw if a slug is renamed. Guard explicitly / select by typed constant. | PR #2 — `requirePackage()` throws descriptive error at build | ✅ PR #2 |
| 9 | — | **Dead-until-PR#2 exports** (`offerCatalogSchema`, `getPricingPackages`, `getAddOns`, footer column partials). Intentional early contract; resolves on use. | PR #2–3 — all consumed; `EXPLORE_COLUMN` and `LEGAL_LINKS` now resolve to live pages. | ✅ PR #3 |

## Owner TODOs — confirm before public launch (business, not code)

- ⬜ **Pricing figures** in `pricing.ts` are placeholders (`TODO(owner)`) — publishing placeholder prices is a business/legal risk.
- ⬜ **`CONTACT_EMAIL`** (`hello@riflessiautocare.ca`) and the **production domain / `SITE_URL`** are unconfirmed — they feed canonicals, OG, sitemap, schema, and the footer `mailto`.
- ⬜ **Stats hours figure** in `stats.ts` needs owner confirmation.
- ⬜ **Legal review of `/privacy` and `/terms`.** `legal.ts` holds plain-language drafts written to match what the code actually does — not lawyer-reviewed. Inline `TODO(owner)` markers flag the four open gaps: data retention period, cancellation/deposit policy, insurance wording, and the registered business name.
- ⬜ **`BOOKING_WEBHOOK_URL` must be set in the production environment.** Since PR #3 the form fails loud without it — visitors are told the request did not send, rather than being shown a false confirmation.

## Pre-launch gate (do not promote the real domain until all checked)

- ✅ #1 lead-loss path closed — fail-loud + pre-filled `mailto` fallback (PR #3)
- ✅ #2 all nav routes resolve — 16/16 internal links verified on a production build (PR #3)
- ✅ #3 thank-you SEO contradiction fixed (PR #2)
- ⬜ Owner TODOs confirmed (pricing, email, domain, stats, legal review, webhook env var)
