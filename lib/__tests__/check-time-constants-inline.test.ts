// Pin tests for scripts/check-time-constants-inline.mjs.
//
// 44th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: `lib/time-constants.ts` exports SECOND_MS / MINUTE_MS /
// HOUR_MS / DAY_MS / WEEK_MS. Every inlined `N * (60|60*24|60*60) * 1000`
// or decimal-literal (86400000 / 3600000 / 60000) should use the SSoT.
// Drift fragments time semantics across the codebase.
//
// Sister of inv check-time-constants-inline.mjs (closes v173.465-845
// sweep arc = 33 files / 43 inlines lifted). v23.605 + v23.905 own-code
// audit caught additional decimal-literal sites + 60_000 redefined in
// lib/rate-limit.ts.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-time-constants-inline.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-time-constants-inline.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-time-constants-inline — inv v173.465-845 + v23.505 + v23.605 + v23.905 anchors", () => {
  // Inv sweep arc + glw lock-in versions.
  assert.match(GATE_SRC, /v173\.465/, "inv v173.465 sweep-arc start anchor");
  assert.match(GATE_SRC, /v173\.\d+-845/, "inv v173.X-845 sweep-arc range anchor");
  assert.match(GATE_SRC, /v23\.505/, "glw v23.505 AgeGate lock-in anchor");
  assert.match(GATE_SRC, /v23\.605/, "v23.605 decimal-literal audit anchor");
  assert.match(GATE_SRC, /v23\.905/, "v23.905 60_000-redef audit anchor");
});

test("check-time-constants-inline — 33-files / 43-inlines sweep magnitude preserved", () => {
  assert.match(GATE_SRC, /33\s+files/, "33-files sweep magnitude");
  assert.match(GATE_SRC, /43\s+inlines/, "43-inlines sweep magnitude");
});

test("check-time-constants-inline — 6 PATTERN regexes (3 multiplication + 3 decimal-literal)", () => {
  // 3 multiplication forms (DAY_MS / HOUR_MS / MINUTE_MS) + 3 decimal
  // forms with optional `_` separator. Drift drops one = miss.
  for (const re of [
    "24\\s*\\*\\s*60\\s*\\*\\s*60\\s*\\*\\s*1000",
    "60\\s*\\*\\s*60\\s*\\*\\s*1000",
    "60\\s*\\*\\s*1000",
    "86_?400_?000",
    "3_?600_?000",
    "60_?000",
  ]) {
    assert.ok(
      GATE_SRC.includes(re),
      `PATTERN regex must include ${re}`,
    );
  }
});

test("check-time-constants-inline — most-specific-first ordering (DAY before HOUR before MINUTE)", () => {
  // CRITICAL: regex ordering matters for the `matchedRanges` overlap
  // suppression. 24*60*60*1000 must be matched as DAY_MS, not HOUR_MS.
  // Pin the comment doctrine + the overlap-suppression mechanism.
  assert.match(
    GATE_SRC,
    /most-specific\s+first/i,
    "most-specific-first ordering rationale documented",
  );
  assert.match(
    GATE_SRC,
    /overlaps/,
    "overlap suppression via matchedRanges pinned",
  );
});

test("check-time-constants-inline — decimal-literal numeric-separator tolerance (`_`)", () => {
  // 60_000 + 86_400_000 + 3_600_000 — TypeScript numeric separator
  // tolerance. Drift to bare regex misses one form.
  assert.match(
    GATE_SRC,
    /86_\?400_\?000/,
    "DAY_MS decimal-literal with optional `_` separator pinned",
  );
});

test("check-time-constants-inline — EXEMPT_FILES = SSoT + version.ts (changelog)", () => {
  // The 2 file-level exempts. SSoT itself ALWAYS contains the
  // expressions; changelog references them historically.
  assert.match(
    GATE_SRC,
    /"lib\/time-constants\.ts"/,
    "lib/time-constants.ts SSoT exempt",
  );
  assert.match(
    GATE_SRC,
    /"lib\/version\.ts"/,
    "lib/version.ts (changelog) exempt",
  );
});

test("check-time-constants-inline — EXEMPT_PREFIXES = app/order/ (dead code)", () => {
  // app/order/ is dead code (redirects to /menu via proxy.ts). Pin so
  // dead-code exempt rationale stays anchored.
  assert.match(
    GATE_SRC,
    /"app\/order\/"/,
    "app/order/ dead-code exempt prefix",
  );
  assert.match(
    GATE_SRC,
    /dead\s+code/i,
    "dead-code rationale prose",
  );
});

test("check-time-constants-inline — walker skips __tests__/node_modules/.next", () => {
  // 3 standard walk-skips.
  assert.match(GATE_SRC, /entry === "node_modules"/, "node_modules skip");
  assert.match(GATE_SRC, /entry === "\.next"/, ".next skip");
  assert.match(GATE_SRC, /entry === "__tests__"/, "__tests__ skip");
});

test("check-time-constants-inline — fix-recipe: import from @/lib/time-constants", () => {
  // Self-documenting — both per-match hint + footer recipe.
  assert.match(
    GATE_SRC,
    /@\/lib\/time-constants/,
    "@/lib/time-constants import path in fix guidance",
  );
});

test("check-time-constants-inline — --warn opt-in + --strict default", () => {
  // Soft adoption: default to warn for migration, strict for pre-push.
  assert.match(
    GATE_SRC,
    /STRICT\s*=\s*process\.argv\.includes\("--strict"\)\s*\|\|\s*!process\.argv\.includes\("--warn"\)/,
    "STRICT default + --warn opt-out shape pinned",
  );
});
