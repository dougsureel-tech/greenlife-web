// Pin tests for scripts/check-inline-form-action-tuple-discard.mjs.
//
// 25th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (HIGH-STAKES — silent-UX-dead-end + audit-trail gap):
//   <form action={async (fd) => { await someServerAction(fd); }}>
// The inner await returns `{ok: false, error: '...'}` on validation
// failure, but the inline closure SWALLOWS it. User clicks Submit →
// action rejects → UI shows nothing changed + no error message.
//
// Memory pin `feedback_inline_form_action_discards_tuple`. Sister of
// GW + cannagent v6.0365 + inv v397.085. glw/scc historically clean —
// pure-defense ship; pattern not used today.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-inline-form-action-tuple-discard.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-inline-form-action-tuple-discard.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-inline-form-action-tuple-discard — memory pin reference preserved", () => {
  // Cross-doctrine link.
  assert.match(
    GATE_SRC,
    /feedback_inline_form_action_discards_tuple/,
    "memory pin reference preserved",
  );
});

test("check-inline-form-action-tuple-discard — sister-stack origins (GW + cannagent + inv)", () => {
  assert.match(GATE_SRC, /cannagent\s+v6\.0365/, "cannagent v6.0365 sister");
  assert.match(GATE_SRC, /inv\s+v397\.085/, "inv v397.085 sister");
  assert.match(GATE_SRC, /\bGW\b/, "GW sister anchor");
});

test("check-inline-form-action-tuple-discard — silent-dead-end + audit-trail-gap rationale preserved", () => {
  // The HIGH-STAKES rationale: silent UX + audit-trail gap on /admin.
  // Pin so future cleanup doesn't demote to "stylistic".
  assert.match(
    GATE_SRC,
    /silent\s+rejection/i,
    "silent-rejection failure-mode prose",
  );
  assert.match(
    GATE_SRC,
    /audit-trail[\s\S]+?gap/i,
    "audit-trail-gap rationale preserved",
  );
  assert.match(
    GATE_SRC,
    /\/admin/i,
    "/admin-surface context preserved",
  );
});

test("check-inline-form-action-tuple-discard — RBAC + cookie patterns documented (glw/scc surface)", () => {
  // Most common stack-specific risk surfaces. Pin so the gate's relevance
  // to this stack stays anchored.
  assert.match(GATE_SRC, /RBAC/, "RBAC role-change risk surface");
  assert.match(GATE_SRC, /setup-link\s+reissue/i, "setup-link reissue example");
});

test("check-inline-form-action-tuple-discard — PATTERN regex: <form action={ async (", () => {
  // The detection regex shape. Drift = miss.
  assert.match(
    GATE_SRC,
    /PATTERN\s*=\s*\/<form\\s\+action=\\\{\\s\*async\\s\*\\\(\//,
    "PATTERN regex shape pinned exact",
  );
});

test("check-inline-form-action-tuple-discard — SCAN_DIRS = app + components", () => {
  // Forms render in app/ + components/ — no lib scanning needed.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components"\]/,
    "SCAN_DIRS app + components pinned",
  );
});

test("check-inline-form-action-tuple-discard — JSX-file filter (.tsx + .jsx)", () => {
  // Forms only render in JSX — pin extension filter.
  assert.match(
    GATE_SRC,
    /p\.endsWith\(["']\.tsx["']\)\s*\|\|\s*p\.endsWith\(["']\.jsx["']\)/,
    ".tsx + .jsx filter pinned",
  );
});

test("check-inline-form-action-tuple-discard — eslint-disable bypass mechanism", () => {
  // Per-line escape — `// eslint-disable-line` opts out. Pin so the
  // mechanism stays stable for verified void-return cases.
  assert.match(
    GATE_SRC,
    /eslint-disable/,
    "eslint-disable bypass marker pinned",
  );
});

test("check-inline-form-action-tuple-discard — walker skips __tests__ + node_modules + dot-files", () => {
  // Standard self-trip defense — pin file may contain pattern in strings.
  assert.match(GATE_SRC, /name === "__tests__"/, "__tests__ skip pinned");
  assert.match(
    GATE_SRC,
    /name === "node_modules"/,
    "node_modules skip pinned",
  );
  assert.match(
    GATE_SRC,
    /name\.startsWith\("\."\)/,
    "dot-file skip pinned",
  );
});

test("check-inline-form-action-tuple-discard — comment-line skip (// or *)", () => {
  // Commented-out examples don't false-positive.
  assert.match(
    GATE_SRC,
    /trimmed\.startsWith\("\/\/"\)\s*\|\|\s*trimmed\.startsWith\("\*"\)/,
    "// + * comment-line skip pinned",
  );
});

test("check-inline-form-action-tuple-discard — fail-loud exit 1 (no warn-only opt-out)", () => {
  // No `--warn` mode — failure ALWAYS halts the push. HIGH-STAKES gate.
  assert.match(
    GATE_SRC,
    /process\.exit\(1\)/,
    "fail-loud exit 1 pinned (no warn-only mode)",
  );
  assert.ok(
    !GATE_SRC.includes("--warn"),
    "no --warn opt-out flag (HIGH-STAKES gate)",
  );
});
