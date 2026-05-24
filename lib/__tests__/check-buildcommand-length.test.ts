// Pin tests for scripts/check-buildcommand-length.mjs.
//
// 11th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: Vercel rejects `buildCommand` strings >256 chars with
// "buildCommand should NOT be longer than 256 characters". Error
// surfaces ONLY in deployment metadata `readyStateReason` — never in
// build logs, dashboard, or `vercel inspect`. Silent-reject failure
// mode. Inv 2026-05-03 incident: 5 inline build-gates chained blew the
// budget; 30+ commits stuck before manual metadata inspection found it.
//
// Cross-stack: ported from VRG + cannagent + inv.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-buildcommand-length.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-buildcommand-length.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-buildcommand-length — Vercel silent-reject doctrine preserved", () => {
  // The WHY: Vercel rejects >256 chars silently (only in readyStateReason).
  // Without this anchor, future cleanup could demote the gate to "stylistic".
  assert.match(
    GATE_SRC,
    /readyStateReason/,
    "readyStateReason silent-reject mechanism documented",
  );
  assert.match(
    GATE_SRC,
    /silently\s+reject/i,
    "silent-reject failure-mode language preserved",
  );
});

test("check-buildcommand-length — inv 2026-05-03 incident anchor preserved", () => {
  // The triggering incident — 30+ commits stuck before manual metadata
  // inspection. Future cleanup must keep the incident reference.
  assert.match(GATE_SRC, /2026-05-03/, "incident date anchor");
  assert.match(GATE_SRC, /5\s+build-gates/i, "5-build-gates inline-chain incident detail");
});

test("check-buildcommand-length — HARD_LIMIT=256 + WARN_THRESHOLD=230 pinned", () => {
  // These are the load-bearing numbers. HARD=256 = Vercel's actual
  // limit; WARN=230 = ~90% for 26-char headroom. Drift on either
  // would change the rejection profile.
  assert.match(
    GATE_SRC,
    /HARD_LIMIT\s*=\s*256/,
    "HARD_LIMIT=256 (Vercel schema) pinned",
  );
  assert.match(
    GATE_SRC,
    /WARN_THRESHOLD\s*=\s*230/,
    "WARN_THRESHOLD=230 (~90% headroom) pinned",
  );
});

test("check-buildcommand-length — fix-guidance points to wrapper-script pattern", () => {
  // Self-documenting fix: move inline chain to scripts/build-gates.mjs.
  // Pin so the recipe doesn't get edited away.
  assert.match(
    GATE_SRC,
    /scripts\/build-gates\.mjs/,
    "wrapper-script recipe pinned",
  );
  assert.match(
    GATE_SRC,
    /node scripts\/build-gates\.mjs && next build/,
    "wrapper-script invocation example pinned",
  );
});

test("check-buildcommand-length — memory pin reference preserved", () => {
  // Cross-doctrine link to the deeper recipe.
  assert.match(
    GATE_SRC,
    /feedback_vercel_buildcommand_silently_rejects_long_strings/,
    "memory pin reference preserved",
  );
});

test("check-buildcommand-length — missing-vercel.json early exit (warn) is OK behavior", () => {
  // The gate is preventive for SCC where no vercel.json exists yet.
  // Pin the early-exit-on-missing-file behavior so it's not tightened
  // into a hard failure that would break stacks without vercel.json.
  assert.match(
    GATE_SRC,
    /Could not read\/parse vercel\.json/,
    "graceful-degrade message pinned",
  );
  assert.ok(
    GATE_SRC.includes("process.exit(0)"),
    "exit 0 on file-missing pinned",
  );
});

test("check-buildcommand-length — non-string buildCommand triggers OK exit", () => {
  // Many vercel.json files omit buildCommand entirely (use package.json
  // build script). Pin the typeof !== 'string' early-exit so the gate
  // doesn't tighten into a 'requires buildCommand' check.
  assert.match(
    GATE_SRC,
    /typeof cmd !== "string"/,
    "typeof string guard pinned",
  );
  assert.match(
    GATE_SRC,
    /no buildCommand declared/,
    "no-buildCommand OK message pinned",
  );
});

test("check-buildcommand-length — --warn flag binding pinned", () => {
  // Strict by default; --warn opt-in for migrations. Pin the binding.
  assert.match(
    GATE_SRC,
    /warnOnly\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
});
