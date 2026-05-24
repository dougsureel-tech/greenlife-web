// Pin tests for scripts/check-after-wrap-external-send.mjs.
//
// fs-source-assertion pattern (same as ambassador-briefs.test.ts). Locks
// the gate's load-bearing doctrine (scan scope, allowed patterns,
// forbidden pattern, anchoring) so a future refactor that drops one of
// the documented invariants surfaces here BEFORE the gate goes silent
// (or worse, false-negative).
//
// Bug-class anchor: Jensine 2026-05-11 — `sendWelcomeEmail(...).catch(...)`
// fire-and-forget returned ok:true before Vercel Fluid Compute could
// deliver the call. Sister bug same day on /admin/reviewer-feedback SMS
// notify (v400.945). Gate is the regression-prevention surface.
//
// Cross-stack: GLW + SCC + Sureel + cannagent + inv-App all carry the
// same gate (or an equivalent). This pin file ports the inv-App marathon
// convention to GLW. Sister-port targets: SCC + Sureel + (future) any
// other stack that wires this gate.
//
// Run:
//   node --import tsx --test lib/__tests__/check-after-wrap-external-send.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-after-wrap-external-send.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-after-wrap-external-send — scan scope is src/app/ only (not src/lib/)", () => {
  // Per file-header doctrine: lib/ helpers are LEGIT fire-and-forget
  // surfaces (consumed by both server actions + standalone Node scripts
  // that can't use after()). Only app/ callers must wrap.
  // Pin BOTH directions so a future widening to lib/ requires explicit
  // doctrine change.
  assert.match(
    GATE_SRC,
    /src\/app/,
    "gate must scan src/app/ per file-header doctrine",
  );
  assert.ok(
    !/\bSCAN.*src\/lib\b/.test(GATE_SRC),
    "gate must NOT scan src/lib/ (legit fire-and-forget surface per doctrine)",
  );
});

test("check-after-wrap-external-send — documents the 3 ALLOWED patterns in comments", () => {
  // The 3 documented escape hatches keep the doctrine load-bearing —
  // a future "tightening" that drops one would break a legit ship path.
  assert.match(
    GATE_SRC,
    /await\s+sendEmail/,
    "ALLOWED: synchronous await pattern documented",
  );
  assert.match(
    GATE_SRC,
    /after\(async/,
    "ALLOWED: Next.js 16 after() wrap pattern documented",
  );
  assert.match(
    GATE_SRC,
    /Promise\.all/,
    "ALLOWED: parallel-fetch w/ fallback pattern documented",
  );
});

test("check-after-wrap-external-send — anchors via import.meta.url (per arc-guard memory pin)", () => {
  // Per `feedback_arc_guard_cwd_relative_path_trap` — gates that use
  // cwd-relative paths break when invoked from outside the repo root
  // (pre-push hooks fire with cwd = .git/hooks/ for example). The
  // import.meta.url anchor is the canonical fix. Pin so refactor drops
  // surface here.
  assert.ok(
    GATE_SRC.includes("import.meta.url"),
    "gate must anchor paths via import.meta.url per arc-guard memory pin",
  );
});

test("check-after-wrap-external-send — incident anchors preserved (Jensine + SMS notify)", () => {
  // The file-header doctrine ties the gate to TWO real incidents:
  //   - Jensine 2026-05-11 Reissue Setup Link silent skip (v400.945-ish)
  //   - /admin/reviewer-feedback SMS notify same-day sister
  // Anchors let the gate's purpose survive a comment cleanup that
  // strips "WHY this gate exists" rationale.
  assert.match(
    GATE_SRC,
    /Jensine/,
    "incident anchor (Jensine 2026-05-11) must persist in gate header",
  );
});

test("check-after-wrap-external-send — strict baseline (0 offenders) doctrine", () => {
  // The gate ships strict on a 0-offender baseline — preventive.
  // Pin so a future "soften to warn" change requires explicit doctrine update.
  assert.match(
    GATE_SRC,
    /strict|baseline 0|0 current offenders|exit\(1\)/,
    "gate must enforce strict baseline per file-header doctrine",
  );
});

test("check-after-wrap-external-send — Next.js 16 after() pattern explicitly named", () => {
  // The fix path (use Next.js's after() from "next/server") must be
  // documented in the gate's own help text so a tripped operator knows
  // the canonical resolution.
  assert.match(
    GATE_SRC,
    /next\/server/,
    "gate must reference Next.js after() origin (next/server) in help text",
  );
});
