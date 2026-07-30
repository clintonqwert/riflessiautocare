# Riflessi deployment constraints

- Production is deployed on Vercel; verify meaningful changes against a preview deployment.
- Keep secrets and production values in Vercel, never in the repository.
- `NEXT_PUBLIC_SITE_URL` supports canonical and metadata output.
- `BOOKING_WEBHOOK_URL` is required for production booking delivery.
- Do not change booking delivery, legal pages, security headers, analytics, or route redirects without owner approval and end-to-end verification.
