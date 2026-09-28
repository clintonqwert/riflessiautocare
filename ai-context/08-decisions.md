# Riflessi decision log

## 2026-09-28 — Vitest for unit tests; CI gates lint, typecheck, test, and build

**Decision:** Adopt Vitest for unit tests of pure logic, and run `npm test` in CI between typecheck and build. This supersedes the "lint, typecheck, and build only" gate below. Its first suite covers the booking form's fallback mailto link (`src/lib/booking-mailto.test.ts`).

**Reason:** The fallback link's encoding had already regressed once (spaces written as "+"), and the fix depends on details a later cleanup could quietly undo. Vitest is the runner the Next.js docs set up. Vite 8 resolves the `@/*` alias from `tsconfig.json` itself, so the setup needs one dev dependency and a five-line config.

**Consequence:** Tests live next to the code as `src/**/*.test.ts` and run in Node. Component, E2E, and accessibility tests would need jsdom or Playwright, which have not been added. `@types/node` moved to `^22` to match `.nvmrc` and Vitest's peer range.

## 2026-07-30 — CI gates lint, typecheck, and build only

**Decision:** Adopt Driftpilot's CI workflow without its Lighthouse stage.

**Reason:** The three cheap gates catch the regressions that actually occur and run in a couple of minutes. A performance gate needs thresholds this repository has not measured yet — a budget guessed at rather than measured either fails constantly or asserts nothing, and both teach the team to ignore the check.

**Consequence:** Performance regressions still reach production undetected until a `lighthouserc.json` exists. That work stays on the backlog, and the numbers must come from measuring this site, not from copying Driftpilot's.

## 2026-07-30 — Establish AI context baseline

**Decision:** Introduce a concise `ai-context/` layer grounded in the repository and `docs/project-analysis.md`.

**Reason:** Enable consistent Claude Code collaboration without replacing code, project analysis, or owner approval as sources of truth.

**Consequence:** Update this log and the relevant context document when an accepted decision changes architecture, conversion, brand, or delivery behavior.
