# Riflessi decision log

## 2026-10-06 — Releases are tagged on `main`

**Decision:** Cut numbered releases the same way as Driftpilot. Each release is an annotated `vX.Y.Z` tag on the merge commit of its release PR, with a GitHub release whose notes come from that version's section of `11-release-notes.md`. `package.json` carries the latest release's version. The first is `v1.0.0`, tagged on the merge of #20 (`d07bc5f`) once the owner confirmed on 2026-10-06 that one real submission from each form had reached the inbox.

**Reason:** A tag gives each production state a name to point to in a rollback, a bug report or a conversation with the owner. Tagging the release PR's merge commit, not whatever `main` is at the time, keeps the tag on exactly the state the release notes describe. #21 merged before `v1.0.0` was tagged, so it is not part of that release.

**Consequence:**

- Versioning follows SemVer as it applies to a website: a patch for fixes, copy and docs; a minor for new capability, such as the `/locations` pages or a failed-booking alert; a major for a change of phase.
- The version bump and its release notes go through a normal PR. The tag and the GitHub release are created only after the owner merges it.
- Merged work that has not been released is listed under "Unreleased" in `11-release-notes.md` until the next release PR moves it under a version.

## 2026-09-29 — Release 1.0.0: launch content confirmed

**Decision:** Tag the live site as 1.0.0. The owner confirmed every price in `src/lib/content/pricing.ts` and the "6h+" Signature Full Detail figure in `stats.ts` as real, so they are no longer placeholders.

**Reason:** The site is public on its own domain, and both forms are wired to deliver to the business inbox through Formspree. The prices and the hours figure are no longer placeholders. A tag gives the launch a fixed point to compare against or roll back to, so it is cut only after one real submission from each form on the live site has reached the inbox (not Formspree's spam tab).

**Consequence:** Prices and stats change only with the owner's sign-off. The sign-off does not cover imagery, and these stay open after launch:

- `/about` still shows stock bay and craftsman frames beside copy about the bay (`docs/maintenance/IMAGE-CREDITS.md`: "not this bay or this owner").
- The owner hasn't ruled on the showcase photos presented as "Il Portfolio" on the home page and `/gallery`. Their multi-bay shop setting may contradict the outdoor-bay copy.
- `IMAGE-CREDITS.md` still calls all 12 credited images stock, though some are now the owner's own.
- A lawyer's review of the legal pages and their `TODO(owner)` gaps, and whether to publish a phone number.

Until those are settled, no role should present the gallery or `/about` imagery as proof of this bay's work.

## 2026-09-28 — riflessiautocare.ca (no www) is the canonical address

**Decision:** Serve the site at `https://riflessiautocare.ca`. `www.riflessiautocare.ca` redirects to it with a permanent 308.

**Reason:** The canonical links, sitemap, `robots.txt`, JSON-LD, and email domain already use the bare domain. Redirecting the other way would leave every canonical URL pointing at a redirect, and Google would get conflicting signals about the site's address.

**Consequence:** `NEXT_PUBLIC_SITE_URL` in Vercel production and the fallback in `src/lib/seo.ts` stay `https://riflessiautocare.ca`. Any domain change updates the Vercel redirect and that variable together.

**Status:** when this was decided, Vercel still redirected the bare domain to `www`. The owner flipped it on 2026-09-29; `www` now returns 308 to the bare domain, and the check in `ai-context/07-deployment.md` passes.

## 2026-09-28 — Formspree delivers booking and contact leads

**Decision:** Deliver both forms through the owner's Formspree form endpoints, one per form, set as `BOOKING_WEBHOOK_URL` and `CONTACT_WEBHOOK_URL`. The Server Actions post to them server-side. Add a "Questions first?" contact form below the booking form on `/contact`.

**Reason:** Formspree emails each submission to the business inbox with no backend to run. Posting from the Server Action keeps Zod validation, the spam gate, retries, and the fail-loud mailto fallback in one place. Formspree's `email` field becomes the Reply-To and `subject` the subject line, so the owner can reply straight from the inbox.

**Consequence:** A missing endpoint in production makes that form fail loud rather than lose leads. Formspree's own plan limits and spam filtering now apply to every lead. Moving to a CRM later means changing the webhook URL and `toWebhookPayload` in `src/lib/leads.ts`, not the forms. The privacy policy names Formspree and its US storage.

Owner choices made with it (2026-09-28):

- **Spam filter:** Formspree can flag a real lead as spam. The visitor then sees a success message and no email is sent, and the API can't tell us. The owner checks the Formspree spam tab weekly until there is a track record, rather than paying for the plan that allows "Relaxed" filtering.
- **Free-text limit:** the contact message and booking notes are capped at 2,000 characters.
- **Previews:** without the webhook variables, Vercel previews log the lead and show success, like local dev. Only the live site (`VERCEL_ENV=production`) fails loud.
- **Timing check** (added after the post-merge review): the page reports how long it had been open when the form was sent, measured on its own clock from page load, so no two clocks are ever compared. A submission without that time (JavaScript off, or sent before the page's scripts load) is delivered with a `[No timing check]` subject and a neutral note, never discarded. Only the honeypot and a reported time under 3 s are discarded.
- **Cost of that:** bots that skip JavaScript and the honeypot now reach Formspree and count against the monthly quota, which both forms share (50 on the free plan). Once it runs out, Formspree refuses posts and every lead falls back to the email link until the month resets. That is loud, not silent. The owner watches Formspree's 50/75/90% usage emails and how many `[No timing check]` emails arrive, and hardens the gate only if unchecked spam actually shows up.

## 2026-09-28 — Vitest for unit tests; CI gates lint, typecheck, test, and build

**Decision:** Adopt Vitest for unit tests of pure logic, and run `npm test` in CI between typecheck and build. This supersedes the "lint, typecheck, and build only" gate below. Its first suite covers the booking form's fallback mailto link (`src/lib/mailto.test.ts`).

**Reason:** The fallback link's encoding had already regressed once (spaces written as "+"), and the fix depends on details a later cleanup could quietly undo. Vitest is the runner the Next.js docs set up. Vite 8 resolves the `@/*` alias from `tsconfig.json` itself, so the setup needs one dev dependency and a five-line config.

**Consequence:** Tests live next to the code as `src/**/*.test.ts` and run in Node. Component, E2E, and accessibility tests would need jsdom or Playwright, which have not been added. `@types/node` moved to `^22` to match `.nvmrc` and Vitest's peer range.

## 2026-07-30 — CI gates lint, typecheck, and build only

**Decision:** Adopt Driftpilot's CI workflow without its Lighthouse stage.

**Reason:** The three cheap gates catch the regressions that actually occur and run in a couple of minutes. A performance gate needs thresholds this repository has not measured yet — a budget guessed at rather than measured either fails constantly or asserts nothing, and both teach the team to ignore the check.

**Consequence:** Performance regressions still reach production undetected until a `lighthouserc.json` exists. That work stays on the backlog, and the numbers must come from measuring this site, not from copying Driftpilot's.

## 2026-07-30 — Establish AI context baseline

**Decision:** Introduce a concise `ai-context/` layer grounded in the repository and `docs/project-analysis.md`.

**Reason:** Enable consistent Claude Code collaboration without replacing code, project analysis, or owner approval as sources of truth.

**Consequence:** Update this log and the relevant context document when an accepted decision changes architecture, conversion, brand, or delivery behavior.
