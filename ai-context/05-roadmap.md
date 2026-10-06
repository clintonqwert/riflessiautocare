# Riflessi roadmap

## Launch gate

1. Have a lawyer review the legal pages and fill their `TODO(owner)` gaps (retention period, registered business name, cancellation terms, insurance). Decide whether to publish a phone number.
   Done: domain live and contact email receiving (2026-09-28); pricing and the stats figures owner-confirmed, and 1.0.0 released (2026-09-29); one real submission from each form confirmed in the inbox, and `v1.0.0` tagged (2026-10-06).
2. Replace temporary stock imagery with the business's own photography before presenting the gallery as proof of work.

## Already in place

`.github/workflows/ci.yml` runs lint, typecheck, unit tests, and build on every pull request.

## Engineering protection

1. Finish the booking pipeline tests. Validation, the timing gate, payload shaping and no-retry-on-4xx are covered (`src/lib/*.test.ts`). The 5xx retry/backoff and the request timeout in `src/lib/crm.ts` are not.
2. Add a `lighthouserc.json` and a Lighthouse step to CI so the documented budget is enforced rather than described. Driftpilot's config is the reference.
3. Add a scoped Content-Security-Policy — the 3D stage and the analytics scripts determine what it can allow.
4. Alert on a failed booking: post the whole lead to Slack, as Driftpilot's `src/lib/alert.ts` does, so it reaches someone before the runtime log expires. Today it reaches nobody unless the visitor sends the pre-filled email. Then add error monitoring with alerting for the rest of the site.

## Growth

1. Build local SEO location pages.
2. Add a guides/content hub only once a sustainable content workflow exists.

## Deferred intentionally

No CMS or scheduling system until operational demand justifies it.
