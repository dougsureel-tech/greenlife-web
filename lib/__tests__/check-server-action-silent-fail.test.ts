// Pin tests for scripts/check-server-action-silent-fail.mjs.
//
// 40th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (HIGH-STAKES — silent-UX-dead-end): Next 16 prod silently
// swallows server-action `throw` AND silent `return;` bails leave the
// UI with NO signal. User clicks Save/Mark Done → form does nothing
// visible.
//
// Canonical fix: redirect with `?surface_err=code` OR return
// ActionResult tuple `{ ok: false, error: "<reason>" }`.
//
// Cross-stack port from cannagent v6.3805 + GW v2.97.D6. Memory pin:
// `feedback_server_action_throw_masked_in_prod`.
//
// NEXT_REDIRECT lookback: throws that re-throw a NEXT_REDIRECT error
// are LEGIT (Next uses error-throw for redirect mechanism). Lookback
// 3 lines for the redirect-rethrow guard.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-server-action-silent-fail.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-server-action-silent-fail.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-server-action-silent-fail — cross-stack origin anchors (cannagent v6.3805 + GW v2.97.D6)", () => {
  assert.match(
    GATE_SRC,
    /cannagent\s+v6\.3805/,
    "cannagent v6.3805 origin anchor",
  );
  assert.match(
    GATE_SRC,
    /GW\s+v2\.97\.D6/,
    "GW v2.97.D6 sister anchor",
  );
});

test("check-server-action-silent-fail — Next 16 silent-swallow mechanism documented", () => {
  // THE load-bearing insight: Next 16 SILENTLY swallows in prod.
  assert.match(
    GATE_SRC,
    /silently\s+swallows?/i,
    "silently-swallow mechanism prose",
  );
  assert.match(
    GATE_SRC,
    /UI\s+with\s+no\s+signal/i,
    "UI-no-signal failure-mode prose",
  );
});

test("check-server-action-silent-fail — memory pin reference preserved", () => {
  assert.match(
    GATE_SRC,
    /feedback_server_action_throw_masked_in_prod/,
    "memory pin reference preserved",
  );
});

test("check-server-action-silent-fail — 3 detection regexes pinned (bare-return + throw new Error + NEXT_REDIRECT rethrow)", () => {
  // All 3 form the detection contract.
  assert.match(
    GATE_SRC,
    /BARE_RETURN_RE\s*=\s*\/.+return\\s\*;.+\//,
    "BARE_RETURN_RE: bare `return;` pinned",
  );
  assert.match(
    GATE_SRC,
    /THROW_NEW_ERROR_RE\s*=\s*\/.+throw\\s\+new\\s\+Error/,
    "THROW_NEW_ERROR_RE pinned",
  );
  assert.match(
    GATE_SRC,
    /NEXT_REDIRECT_RETHROW_RE/,
    "NEXT_REDIRECT_RETHROW_RE legit-redirect guard pinned",
  );
});

test("check-server-action-silent-fail — `use server` directive detector pinned", () => {
  // The gate only scans files with `use server` directive at top.
  assert.match(
    GATE_SRC,
    /hasUseServerDirective/,
    "hasUseServerDirective scope helper",
  );
  assert.ok(
    GATE_SRC.includes('^["\']use server["\'];?$'),
    "use-server directive regex pinned",
  );
});

test("check-server-action-silent-fail — block-comment-aware header parser (use-server detection)", () => {
  // Critical: `use server` directive must be FIRST non-comment line.
  // Block-comment-aware parser handles JSDoc above directive.
  assert.match(
    GATE_SRC,
    /inBlockComment/,
    "block-comment state machine in directive detector",
  );
});

test("check-server-action-silent-fail — 2-tier opt-out (per-line + per-file)", () => {
  // Both opt-out shapes documented + pinned.
  assert.match(
    GATE_SRC,
    /silent-fail-ok:/,
    "per-line opt-out marker pinned",
  );
  assert.match(
    GATE_SRC,
    /silent-fail-ok-file:/,
    "per-file opt-out marker pinned",
  );
});

test("check-server-action-silent-fail — per-file opt-out scope = first 50 lines (stale-marker defense)", () => {
  // Pin the scope window — narrow enough that stale markers don't
  // accumulate at file-bottom.
  assert.match(
    GATE_SRC,
    /slice\(0,\s*50\)/,
    "50-line per-file opt-out scope pinned",
  );
});

test("check-server-action-silent-fail — NEXT_REDIRECT lookback = 3 lines (Next redirect mechanism)", () => {
  // Next.js uses throw for redirect mechanism. Lookback 3 lines for
  // `if (err.message === 'NEXT_REDIRECT')` guard means the throw is
  // LEGIT (re-throwing redirect). Pin the lookback width.
  assert.match(
    GATE_SRC,
    /slice\(Math\.max\(0,\s*i\s*-\s*3\)/,
    "3-line NEXT_REDIRECT lookback pinned",
  );
});

test("check-server-action-silent-fail — SCAN_ROOTS = app + lib", () => {
  // Server actions live in app/ + lib/. components/ runs client-side.
  assert.match(
    GATE_SRC,
    /SCAN_ROOTS\s*=\s*\["app",\s*"lib"\]/,
    "SCAN_ROOTS = app + lib only",
  );
});

test("check-server-action-silent-fail — fix-recipe lists 2 shapes (surface_err redirect + ActionResult tuple)", () => {
  assert.match(
    GATE_SRC,
    /surface_err/,
    "fix shape 1: surface_err redirect param",
  );
  assert.match(
    GATE_SRC,
    /ActionResult\s+tuple/i,
    "fix shape 2: ActionResult tuple",
  );
});

test("check-server-action-silent-fail — --warn mode + strict-by-default", () => {
  // Has --warn opt-in for migrations BUT strict by default.
  assert.match(
    GATE_SRC,
    /warnOnly\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
  assert.match(
    GATE_SRC,
    /if \(warnOnly\) process\.exit\(0\)/,
    "warn-mode exit-0 pinned",
  );
});
