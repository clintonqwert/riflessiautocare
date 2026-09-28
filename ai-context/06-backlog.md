# Riflessi backlog

## Launch readiness

- Confirm real service pricing, contact details, business figures, legal content, and the production webhook.
- Replace all temporary stock photos with legitimate Riflessi photography.

## Engineering protection

- Add focused booking pipeline tests: validation, spam gate, and webhook retry/timeout behavior — Vitest is set up; `src/lib/booking-mailto.test.ts` shows the pattern.
- Add a `lighthouserc.json` and wire a Lighthouse step into CI; Driftpilot's config is the reference.
- Add a scoped Content-Security-Policy.

## Growth

- Build location pages for the existing Metro Vancouver local-SEO strategy.
- Establish a sustainable content process before adding the planned guides hub.
