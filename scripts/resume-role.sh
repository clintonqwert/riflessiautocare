#!/bin/zsh
# resume-role.sh — re-kick a Claude Code role session after a usage-limit reset.
#
# Usage: scripts/resume-role.sh [worktree-dir]
#   worktree-dir   Directory whose most recent Claude session should resume.
#                  Defaults to the current directory. `claude --continue`
#                  resumes the most recent session *per directory*, so run
#                  this from (or point it at) the role's own worktree. If
#                  several roles share one directory, resume interactively
#                  with `claude --resume` and pick the session instead.
#
# Retries every 15 minutes until the usage window resets and a turn
# completes, then exits. Caps at 24 attempts (~6h) so a genuinely broken
# session doesn't loop forever.
#
# Headless runs can't answer permission prompts. Pre-approve the role's
# common tools in .claude/settings.json (see /fewer-permission-prompts),
# or pass extra flags via CLAUDE_RESUME_ARGS, e.g.:
#   CLAUDE_RESUME_ARGS="--permission-mode acceptEdits" scripts/resume-role.sh

set -u

dir="${1:-$PWD}"
cd "$dir" || { echo "[resume-role] cannot cd to ${dir}" >&2; exit 1 }

prompt="You were interrupted (usage limit or session restart). If a HANDOFF.md exists in this directory, read it and continue from its exact next step. Otherwise continue your in-progress role task. Checkpoint per your role skill before ending the turn."

max_attempts=24
attempt=1
until claude --continue ${=CLAUDE_RESUME_ARGS:-} -p "$prompt"; do
  if (( attempt >= max_attempts )); then
    echo "[resume-role] giving up after ${max_attempts} attempts in ${dir}" >&2
    exit 1
  fi
  echo "[resume-role] attempt ${attempt} failed (likely still rate-limited); retrying in 15m — $(date '+%Y-%m-%d %H:%M')"
  attempt=$(( attempt + 1 ))
  sleep 900
done

echo "[resume-role] session resumed and turn completed in ${dir}"
