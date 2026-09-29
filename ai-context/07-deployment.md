# Riflessi deployment constraints

- Production is deployed on Vercel at `https://riflessiautocare.ca`, the one canonical address: `www` redirects to it with a 308, and `NEXT_PUBLIC_SITE_URL` in production must match it exactly. Verify meaningful changes against a preview deployment.
- `.github/workflows/ci.yml` gates every pull request on lint, typecheck, unit tests, and build. Node comes from `.nvmrc`, so CI and both dev machines resolve the same version.
- Keep secrets and production values in Vercel, never in the repository.
- `NEXT_PUBLIC_SITE_URL` supports canonical and metadata output. The production build throws without it, so CI supplies a placeholder origin for the build step only — production still reads the real value from Vercel.
- `BOOKING_WEBHOOK_URL` and `CONTACT_WEBHOOK_URL` (Formspree form endpoints) are required for production delivery of the booking and contact forms. Without them, production fails loud. Vercel previews and local dev log the lead instead, so testing never emails the owner unless a preview is given the variables on purpose.
- Do not change booking delivery, legal pages, security headers, analytics, or route redirects without owner approval and end-to-end verification.
