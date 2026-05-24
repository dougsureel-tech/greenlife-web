// Pin tests for scripts/check-usesyncexternalstore-cache.mjs.
//
// 47th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (React #185 — "Maximum update depth exceeded"): React's
// `useSyncExternalStore` compares snapshots via Object.is. getSnapshot
// returning FRESH array/object reference per call → Object.is always
// "different" → re-render schedules → infinite loop. Error bubbles
// ABOVE root layout so app/error.tsx doesn't catch — global-error.tsx
// takes over showing "This page couldn't load."
//
// Real incident: seattle-cannabis-web/lib/stash.ts 2026-05-01
// (commit b16ec1b). Memory pin
// `feedback_use_sync_external_store_caching`.
//
// Fix pattern: module-level `cachedRaw` + `cachedIds` + identity-check
// `if (raw === cachedRaw) return cachedIds`.
//
// Escape marker: `// @use-sync-external-store-no-cache` (for primitive
// snapshots where Object.is works without reference identity).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-usesyncexternalstore-cache.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-usesyncexternalstore-cache.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-usesyncexternalstore-cache — React #185 + 'Maximum update depth' anchors preserved", () => {
  assert.match(GATE_SRC, /React\s+#185/, "React #185 error-code anchor");
  assert.match(
    GATE_SRC,
    /Maximum\s+update\s+depth/i,
    "Maximum-update-depth literal error string",
  );
  assert.match(
    GATE_SRC,
    /infinite\s+(?:loop|re-render)/i,
    "infinite-loop failure-mode prose",
  );
});

test("check-usesyncexternalstore-cache — memory pin reference preserved", () => {
  assert.match(
    GATE_SRC,
    /feedback_use_sync_external_store_caching/,
    "memory pin reference preserved",
  );
});

test("check-usesyncexternalstore-cache — real incident anchor (scc lib/stash.ts 2026-05-01 commit b16ec1b)", () => {
  assert.match(
    GATE_SRC,
    /lib\/stash\.ts/,
    "lib/stash.ts incident file pinned",
  );
  assert.match(GATE_SRC, /2026-05-01/, "2026-05-01 incident date");
  assert.match(GATE_SRC, /b16ec1b/, "b16ec1b commit hash anchor");
});

test("check-usesyncexternalstore-cache — Object.is + global-error.tsx mechanism documented", () => {
  // The 2 load-bearing technical anchors: Object.is reference-compare +
  // error bubbles ABOVE root layout (global-error catches).
  assert.match(GATE_SRC, /Object\.is/, "Object.is reference-compare mechanism");
  assert.match(
    GATE_SRC,
    /global-error\.tsx/,
    "global-error.tsx error-bubble destination",
  );
  assert.match(
    GATE_SRC,
    /bubbles\s+(?:above|ABOVE)/i,
    "above-root-layout bubble mechanism",
  );
});

test("check-usesyncexternalstore-cache — canonical fix-pattern code documented", () => {
  // The actual fix-recipe code IS in the gate header as JSDoc — pin so
  // it stays copy-pasteable.
  assert.match(GATE_SRC, /cachedRaw/, "cachedRaw var name pinned");
  assert.match(GATE_SRC, /cachedIds/, "cachedIds var name pinned");
  assert.match(
    GATE_SRC,
    /raw\s*===\s*cachedRaw/,
    "identity-check fix-recipe pinned",
  );
});

test("check-usesyncexternalstore-cache — useSyncExternalStore detection (substring)", () => {
  assert.match(
    GATE_SRC,
    /useSyncExternalStore/,
    "useSyncExternalStore hook name in detection",
  );
});

test("check-usesyncexternalstore-cache — cache-pattern regex (let|const|var cachedX)", () => {
  // The fix-presence detector. Allows cachedRaw / cachedIds /
  // cachedSnapshot / cachedItems. Drift = different fix-shape contract.
  assert.match(
    GATE_SRC,
    /\\b\(let\|const\|var\)\\s\+cached\[A-Za-z_\]\+/,
    "cache-pattern regex shape pinned exact",
  );
});

test("check-usesyncexternalstore-cache — ESCAPE_MARKER = `@use-sync-external-store-no-cache`", () => {
  // Per-file opt-out for primitive snapshots.
  assert.match(
    GATE_SRC,
    /@use-sync-external-store-no-cache/,
    "ESCAPE_MARKER literal pinned",
  );
});

test("check-usesyncexternalstore-cache — EXEMPT app/global-error.tsx (React-error-overlay itself)", () => {
  // global-error itself doesn't subscribe to custom stores.
  assert.match(
    GATE_SRC,
    /"app\/global-error\.tsx"/,
    "app/global-error.tsx EXEMPT pinned",
  );
});

test("check-usesyncexternalstore-cache — stripComments before detection (avoids changelog false-pos)", () => {
  // Pin comment-strip mechanism — changelog mentions of the hook in
  // version.ts must not trip the gate.
  assert.match(
    GATE_SRC,
    /stripped\s*=\s*src\.replace/,
    "comment-strip pre-scan pinned",
  );
});

test("check-usesyncexternalstore-cache — SCAN_DIRS + strict-by-default + --warn", () => {
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
  assert.match(
    GATE_SRC,
    /WARN_ONLY\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
  assert.match(
    GATE_SRC,
    /process\.exit\(WARN_ONLY \? 0 : 1\)/,
    "default-strict exit policy pinned",
  );
});
