# Riflessi AI guidelines

1. Read this directory, `CLAUDE.md`, `docs/project-analysis.md`, and relevant source before proposing work.
2. Code and deployed behavior are technical truth; business facts must trace to the content modules or owner direction.
3. Preserve the static-first architecture, booking conversion path, and progressive-enhancement model for cinema.
4. Work through the roles in `.claude/skills/`, not ad-hoc: `builder` is the only role that edits code; `reviewer`, `tester`, `auditor`, and `content-strategist` report independently and never write files. Every non-trivial PR gets `reviewer`; booking-path, public-claim, and performance changes also get `tester` and `auditor`. Technical SEO belongs to `auditor` and content SEO to `content-strategist` — do not add a separate SEO role.
5. Ask before modifying public claims, pricing, legal copy, production configuration, booking delivery, or image provenance.
6. Record accepted decisions in `08-decisions.md` and completed milestones in `11-release-notes.md`.
