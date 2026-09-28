# Riflessi backlog

## Launch readiness

- Confirm real service pricing, contact details, business figures, legal content, and the production webhook.
- Replace all temporary stock photos with legitimate Riflessi photography.

## Engineering protection

- Add focused booking pipeline tests: validation, spam gate, and webhook retry/timeout behavior — Vitest is set up; `src/lib/mailto.test.ts` shows the pattern.
- Add a `lighthouserc.json` and wire a Lighthouse step into CI; Driftpilot's config is the reference.
- Add a scoped Content-Security-Policy.
- Alert on a failed booking: post the whole lead to Slack, as Driftpilot's `src/lib/alert.ts` does. Then add error monitoring with alerting for the rest of the site.

## Growth

- Build location pages for the existing Metro Vancouver local-SEO strategy.
- Establish a sustainable content process before adding the planned guides hub.
