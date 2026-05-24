// Pin tests for scripts/check-env-example-unique.mjs.
//
// 20th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: duplicate column-0 env-var declarations in .env.example
// carry silent drift risk — when one block updates and another doesn't,
// the example diverges from itself. Cross-stack port from cannagent
// v3.159 + VRG v9.6.94 + GW v2.97.D1 + sureel.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-env-example-unique.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-env-example-unique.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-env-example-unique — 4 cross-stack origin anchors preserved", () => {
  // Multi-stack provenance — cannagent + VRG + GW + sureel. Pin all 4
  // so future cleanup keeps the breadth context.
  assert.match(GATE_SRC, /cannagent\s+v3\.159/, "cannagent v3.159 origin");
  assert.match(GATE_SRC, /VRG\s+v9\.6\.94/, "VRG v9.6.94 origin");
  assert.match(GATE_SRC, /GW\s+v2\.97\.D1/, "GW v2.97.D1 origin");
  assert.match(GATE_SRC, /sureel/i, "sureel origin");
});

test("check-env-example-unique — silent-drift-risk rationale preserved", () => {
  // The WHY: silent drift between duplicate blocks. Without this anchor,
  // future cleanup could demote to "lint nit".
  assert.match(
    GATE_SRC,
    /silent\s+drift\s+risk/i,
    "silent-drift-risk rationale preserved",
  );
});

test("check-env-example-unique — ENV_EXAMPLE = .env.example (exact filename)", () => {
  // Filename pin — drift to .env.local.example or similar would silently
  // skip the actual target.
  assert.match(
    GATE_SRC,
    /ENV_EXAMPLE\s*=\s*join\(REPO_ROOT,\s*["']\.env\.example["']\)/,
    ".env.example filename pinned",
  );
});

test("check-env-example-unique — ENV_LINE_RE shape: uppercase first char + [A-Z0-9_]* + =", () => {
  // The detection regex. Drift to lowercase-first or missing-= breaks
  // the catch.
  assert.match(
    GATE_SRC,
    /ENV_LINE_RE\s*=\s*\/\^\(\[A-Z\]\[A-Z0-9_\]\*\)=\//,
    "ENV_LINE_RE shape pinned exact",
  );
});

test("check-env-example-unique — /gm flags (global + multiline)", () => {
  // Global = catch ALL declarations not just first; multiline = `^`
  // matches line-start. Both load-bearing.
  assert.match(
    GATE_SRC,
    /ENV_LINE_RE\s*=\s*\/\^.+\/gm/,
    "/gm flags on ENV_LINE_RE pinned",
  );
});

test("check-env-example-unique — Map-based dedup tracker with line-number arrays", () => {
  // The seen-name → lines-array shape. Pin so future refactor doesn't
  // drop the line-number context that makes the error actionable.
  assert.match(
    GATE_SRC,
    /new Map\(\)/,
    "Map-based tracker pinned",
  );
  assert.match(
    GATE_SRC,
    /lines\.length\s*>\s*1/,
    "duplicate-detect lines.length>1 pinned",
  );
});

test("check-env-example-unique — error msg reports all lines (not just first)", () => {
  // Critical UX: dev needs to see ALL duplicate sites, not just one.
  // Pin the joined-lines output shape.
  assert.match(
    GATE_SRC,
    /lines\.join\(",\s*"\)/,
    "lines.join(', ') multi-site output pinned",
  );
});

test("check-env-example-unique — total-count output on success", () => {
  // Self-documenting OK output — tells the next dev how many decls
  // were scanned (useful for noticing drift over time).
  assert.match(
    GATE_SRC,
    /totalDeclarations.*env-var declarations scanned/,
    "totalDeclarations in success message pinned",
  );
});
