# Riflessi architecture

- Next.js App Router, React, TypeScript strict mode, Tailwind CSS v4, and Vercel.
- Typed content accessors in `src/lib/content/` separate business content from presentational components.
- Metadata and structured data are centralized in `src/lib/seo.ts`.
- The booking and contact forms on `/contact` use React Server Actions, Zod validation, and honeypot and timing spam controls (`src/lib/leads.ts`). Each delivers to its own Formspree endpoint through a retrying webhook client, and fails loud with a pre-filled mailto if delivery fails.
- Homepage cinema uses React Three Fiber and related motion tooling as capability-gated progressive enhancement.

Before touching Next.js APIs, consult the relevant documentation bundled with the installed version.
