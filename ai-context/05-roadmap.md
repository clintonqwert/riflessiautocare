# Riflessi roadmap

## Launch gate

1. Confirm real pricing, contact details, stats, legal copy, and production booking webhook configuration.
2. Replace temporary stock imagery with the business's own photography before presenting the gallery as proof of work.

## Already in place

`.github/workflows/ci.yml` runs lint, typecheck, unit tests, and build on every pull request.

## Engineering protection

1. Add focused tests around booking validation, spam detection, and webhook retry behavior. Vitest is set up; `src/lib/booking-mailto.test.ts` shows the pattern.
2. Add a `lighthouserc.json` and a Lighthouse step to CI so the documented budget is enforced rather than described. Driftpilot's config is the reference.
3. Add a scoped Content-Security-Policy — the 3D stage and the analytics scripts determine what it can allow.
4. Alert on a failed booking: post the whole lead to Slack, as Driftpilot's `src/lib/alert.ts` does, so it reaches someone before the runtime log expires. Today it reaches nobody unless the visitor sends the pre-filled email. Then add error monitoring with alerting for the rest of the site.

## Growth

1. Build local SEO location pages.
2. Add a guides/content hub only once a sustainable content workflow exists.

## Deferred intentionally

No CMS or scheduling system until operational demand justifies it.
