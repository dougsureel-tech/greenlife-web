// Pin tests for scripts/check-no-store-isr-poison.mjs.
//
// 29th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: Server Components calling `fetch(..., { cache: "no-store" })`
// silently opt the ENTIRE page out of ISR — even if the page exports
// `revalidate = 60`. Bit glw 3 times (homepage + /visit + /menu) — each
// was ~30 min "is my page caching at the edge?" investigation tracing
// to a single internal fetch.
//
// 3-ship arc: v20.405 + v20.605 + v18.805. Sister class:
// prewarmDutchieMenu() in /menu (no-store for fire-and-forget Jane CDN
// warming — same poison-the-tree pattern).
//
// Memory pin: `feedback_isr_killed_by_no_store_fetch`. One allowed
// exception: lib/closure-status.ts (defaults to no-store but accepts
// `revalidate` option callers MUST pass for ISR participation).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-no-store-isr-poison.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-no-store-isr-poison.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-no-store-isr-poison — 3-ship fix arc anchors preserved (v20.405 + v20.605 + v18.805)", () => {
  assert.match(GATE_SRC, /v20\.405/, "v20.405 fix ship");
  assert.match(GATE_SRC, /v20\.605/, "v20.605 fix ship");
  assert.match(GATE_SRC, /v18\.805/, "v18.805 fix ship");
});

test("check-no-store-isr-poison — ISR-poison mechanism documented (silent opt-out)", () => {
  // THE load-bearing insight: no-store SILENTLY opts the entire page
  // out — even with revalidate=N set. Pin so it stays anchored.
  assert.match(
    GATE_SRC,
    /silently\s+opt/i,
    "silently-opt-out mechanism prose",
  );
  assert.match(GATE_SRC, /ENTIRE\s+page/, "entire-page poison scope");
});

test("check-no-store-isr-poison — 3-page incident count + 30-min cost preserved", () => {
  // Concrete recurrence + investigation cost. Pin so future cleanup
  // keeps the WHY load-bearing.
  assert.match(
    GATE_SRC,
    /3\s+times/i,
    "3-page recurrence count preserved",
  );
  assert.match(
    GATE_SRC,
    /homepage \+ \/visit \+ \/menu/i,
    "specific pages affected preserved",
  );
  assert.match(GATE_SRC, /~?30\s*min/i, "30-min recovery cost");
});

test("check-no-store-isr-poison — memory pin reference preserved", () => {
  assert.match(
    GATE_SRC,
    /feedback_isr_killed_by_no_store_fetch/,
    "memory pin reference preserved",
  );
});

test("check-no-store-isr-poison — prewarmDutchieMenu sister-class documented", () => {
  // The Jane CDN warming sister-bug. Pin so the cross-pattern context
  // stays visible.
  assert.match(
    GATE_SRC,
    /prewarmDutchieMenu/,
    "prewarmDutchieMenu sister-class anchor",
  );
  assert.match(
    GATE_SRC,
    /Jane\s+CDN/,
    "Jane CDN warming context",
  );
});

test("check-no-store-isr-poison — EXEMPT_FILES = lib/closure-status.ts only", () => {
  // The single approved exception, with rationale.
  assert.match(
    GATE_SRC,
    /"lib\/closure-status\.ts"/,
    "lib/closure-status.ts exempt pinned",
  );
  assert.match(
    GATE_SRC,
    /callers\s+(?:opt|MUST)\s+(?:into|pass)\s+revalidate/i,
    "callers-opt-in rationale documented",
  );
});

test("check-no-store-isr-poison — detection regex matches both quote shapes", () => {
  // `cache: "no-store"` AND `cache: 'no-store'`.
  assert.ok(
    GATE_SRC.includes("cache\\s*:\\s*[\"']no-store[\"']"),
    "cache:no-store quote-flex regex pinned",
  );
});

test("check-no-store-isr-poison — SCAN_DIRS = app + lib (no components)", () => {
  // Server-Component-relevant scope only. components/ rarely calls
  // fetch directly — keeps scan focused.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"lib"\]/,
    "SCAN_DIRS = app + lib only",
  );
});

test("check-no-store-isr-poison — stripComments before scan (block + line)", () => {
  // Avoids flagging discussion text in JSDoc.
  assert.match(GATE_SRC, /stripComments/, "stripComments helper invoked");
});

test("check-no-store-isr-poison — fix-recipe + EXEMPT-doc guidance", () => {
  // Self-documenting fix recipe — point at `next: { revalidate: N }`.
  // Pin so it stays copy-pasteable.
  assert.match(
    GATE_SRC,
    /next:\s*\{\s*revalidate:\s*N\s*\}/,
    "fix recipe: next:{revalidate:N}",
  );
  assert.match(
    GATE_SRC,
    /EXEMPT_FILES/,
    "EXEMPT_FILES escape-hatch in fix-guidance",
  );
});

test("check-no-store-isr-poison — strict by default, --warn opt-in", () => {
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
