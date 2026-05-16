#!/usr/bin/env bash
# Vercel ignoreCommand — skip the build when the only files changed since
# the previous deploy are docs (.md / .txt / LICENSE / .gitignore).
#
# Convention: exit 0 = SKIP build, exit 1 = RUN build.
#
# Background: Doug 2026-05-14 surfaced the GW Vercel bill — 92% of infra
# spend was Build CPU Minutes ($298.68/mo) from marathon push-per-commit
# /loop cadence. ~30-40% of recent commits were doc-only (changelog typos,
# plan docs, audit notes) — all triggered full ~3-5 min builds for zero
# behavior change. This gate skips those.
#
# Carve-out: any non-doc file flips exit→1. `lib/version.ts` is .ts so it
# always rebuilds (version-string changes are load-bearing — they show in
# /api/health output + the in-app VersionBadge). package.json, vercel.json,
# next.config.*, and any code/schema file all force rebuild.
#
# Cross-stack port from GW v2.97.V2 — sister glw v36.605 + scc v27.885.

set -euo pipefail

CHANGED=$(git diff HEAD~1 --name-only 2>/dev/null || echo "")

# Strip lines matching the doc-only pattern. Anything that remains is a
# code/config file → triggers a build.
CODE_CHANGED=$(echo "$CHANGED" | grep -v -E '^[^/]*\.(md|txt)$|/[^/]+\.md$|^LICENSE$|^\.gitignore$' || true)

if [ -z "$CODE_CHANGED" ]; then
  COUNT=$(echo "$CHANGED" | grep -c . || echo 0)
  echo "Skipping deploy: doc-only diff ($COUNT files, all .md/.txt/LICENSE/.gitignore)"
  exit 0
else
  COUNT=$(echo "$CODE_CHANGED" | grep -c . || echo 0)
  echo "Building: $COUNT code file(s) changed"
  exit 1
fi
