# Riflessi deployment constraints

- Production is deployed on Vercel; verify meaningful changes against a preview deployment.
- `.github/workflows/ci.yml` gates every pull request on lint, typecheck, and build. Node comes from `.nvmrc`, so CI and both dev machines resolve the same version.
- Keep secrets and production values in Vercel, never in the repository.
- `NEXT_PUBLIC_SITE_URL` supports canonical and metadata output. The production build throws without it, so CI supplies a placeholder origin for the build step only — production still reads the real value from Vercel.
- `BOOKING_WEBHOOK_URL` is required for production booking delivery.
- Do not change booking delivery, legal pages, security headers, analytics, or route redirects without owner approval and end-to-end verification.
