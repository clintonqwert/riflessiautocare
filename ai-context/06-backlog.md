# Riflessi backlog

## Launch readiness

- Have the legal pages reviewed and fill their `TODO(owner)` gaps, and decide whether to publish a phone number. Confirm one real submission from each form on the live site reaches the inbox.
- Replace all temporary stock photos with legitimate Riflessi photography.

## Engineering protection

- Test `sendToCrm`'s 5xx retry/backoff and request timeout. Validation, the timing gate, payload shaping and no-retry-on-4xx are already covered.
- Add a `lighthouserc.json` and wire a Lighthouse step into CI; Driftpilot's config is the reference.
- Add a scoped Content-Security-Policy.
- Alert on a failed booking: post the whole lead to Slack, as Driftpilot's `src/lib/alert.ts` does. Then add error monitoring with alerting for the rest of the site.

## Growth

- Build location pages for the existing Metro Vancouver local-SEO strategy.
- Establish a sustainable content process before adding the planned guides hub.
