# Riflessi decision log

## 2026-07-30 — CI gates lint, typecheck, and build only

**Decision:** Adopt Driftpilot's CI workflow without its Lighthouse stage.

**Reason:** The three cheap gates catch the regressions that actually occur and run in a couple of minutes. A performance gate needs thresholds this repository has not measured yet — a budget guessed at rather than measured either fails constantly or asserts nothing, and both teach the team to ignore the check.

**Consequence:** Performance regressions still reach production undetected until a `lighthouserc.json` exists. That work stays on the backlog, and the numbers must come from measuring this site, not from copying Driftpilot's.

## 2026-07-30 — Establish AI context baseline

**Decision:** Introduce a concise `ai-context/` layer grounded in the repository and `docs/project-analysis.md`.

**Reason:** Enable consistent Claude Code collaboration without replacing code, project analysis, or owner approval as sources of truth.

**Consequence:** Update this log and the relevant context document when an accepted decision changes architecture, conversion, brand, or delivery behavior.
