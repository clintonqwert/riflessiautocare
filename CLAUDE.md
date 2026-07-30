# Riflessi Auto Care — Claude Code instructions

Read `ai-context/` and `docs/project-analysis.md` before planning material work. The repository is the technical source of truth; `ai-context/` records agreed product and engineering context.

## Working rules

- Preserve the static-first Next.js App Router architecture and typed content-accessor layering.
- Do not invent business claims, pricing, business details, or proof-of-work imagery.
- Keep the primary booking conversion path reliable, accessible, and mobile-first.
- Reuse the existing token, content, SEO, and component systems before adding alternatives.
- Treat cinematic 3D as progressive enhancement; the page must remain useful without it.
- Ask before changing production configuration, legal content, booking delivery, or public business claims.
- Update `ai-context/08-decisions.md` when a significant decision is accepted.

## Roles

Use the existing `.claude/skills/` roles: `builder` implements; `reviewer`, `tester`, `auditor` (CTO/SEO/performance/a11y), and `content-strategist` provide independent report-only review.
