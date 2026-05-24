// Pin tests for scripts/check-breadcrumb-ld-id.mjs.
//
// 10th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: sibling JSON-LD nodes (Article, SpecialAnnouncement,
// CollectionPage, LocalBusiness/Store) reference the breadcrumb via
// `@id` to form a linked entity graph. Pre-T91 every BreadcrumbList
// on glw was a dangling node — sibling nodes couldn't link to it.
// `lib/breadcrumb-jsonld.ts` is the SoT helper; this gate fails the
// build when the @id field is dropped from the function's return.
//
// Sister of GW T101 v2.97.O0 + GW `check-breadcrumb-ld-id.mjs`.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-breadcrumb-ld-id.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-breadcrumb-ld-id.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-breadcrumb-ld-id — T91 + GW T101 doctrine anchors preserved", () => {
  // The WHY of the gate. Without the entity-graph rationale, future
  // cleanup could demote it to "stylistic nit" instead of "load-bearing
  // SEO architecture".
  assert.match(GATE_SRC, /T91/, "T91 anchor (pre-fix dangling-node state)");
  assert.match(GATE_SRC, /entity[\s-]?graph/i, "entity-graph rationale prose");
  assert.match(GATE_SRC, /dangling\s+node/i, "dangling-node failure-mode prose");
});

test("check-breadcrumb-ld-id — sister gates documented (GW + glw lockstep)", () => {
  // Two-stack lockstep: GW + glw both pin this. If one drifts the
  // other's gate becomes the only enforcement.
  assert.match(GATE_SRC, /[Ss]ister\s+of\s+GW/, "sister-stack GW anchor");
  assert.match(GATE_SRC, /check-breadcrumb-ld-id/, "self-referential sister name");
});

test("check-breadcrumb-ld-id — SoT helper path is lib/breadcrumb-jsonld.ts", () => {
  // The single-source-of-truth file. A move/rename without updating
  // this path silently disables the gate.
  assert.match(
    GATE_SRC,
    /SEO_FILE\s*=\s*join\(process\.cwd\(\),\s*["']lib\/breadcrumb-jsonld\.ts["']\)/,
    "SoT file path pinned to lib/breadcrumb-jsonld.ts",
  );
});

test("check-breadcrumb-ld-id — function-name target is breadcrumbJsonLd", () => {
  // The function the gate scans. If renamed, both the gate's FN_NAME
  // const + this pin must update in lockstep.
  assert.match(
    GATE_SRC,
    /FN_NAME\s*=\s*["']breadcrumbJsonLd["']/,
    "FN_NAME constant pinned",
  );
});

test("check-breadcrumb-ld-id — brace-depth body extraction (not naive line slice)", () => {
  // Load-bearing: the function body has nested objects (crumb items),
  // so a naive line-by-line slice would misidentify the body bounds.
  // Pin the brace-depth tracking shape.
  assert.ok(
    GATE_SRC.includes("depth += 1") && GATE_SRC.includes("depth -= 1"),
    "brace-depth increment/decrement pinned",
  );
  assert.ok(
    GATE_SRC.includes("return\\\\s*\\\\{"),
    "return-brace anchor in fnStartRe pinned",
  );
});

test("check-breadcrumb-ld-id — @id presence regex tolerates single or double quotes", () => {
  // The key-presence regex must catch `"@id":` AND `'@id':` since both
  // are valid TS. A double-quote-only regex would false-pass on a
  // single-quoted variant.
  assert.match(
    GATE_SRC,
    /\(\["'\]\)@id\\1\\s\*:/,
    "@id regex pinned with quote-flexibility",
  );
});

test("check-breadcrumb-ld-id — exit codes: 1 (missing @id) + 2 (file unreadable)", () => {
  // Differentiated exit codes let the build-runner distinguish
  // "regression" (1) from "config-drift" (2 = SoT file moved/missing).
  assert.ok(GATE_SRC.includes("process.exit(1)"), "exit 1 for missing @id pinned");
  assert.ok(GATE_SRC.includes("process.exit(2)"), "exit 2 for unreadable file pinned");
});

test("check-breadcrumb-ld-id — failure message points at #breadcrumb fragment shape", () => {
  // The error message documents the canonical @id shape — load-bearing
  // for the next dev hitting the gate (they get a copy-pasteable target).
  assert.match(GATE_SRC, /#breadcrumb/, "#breadcrumb fragment in error guidance");
  assert.match(GATE_SRC, /STORE\.website/, "STORE.website pattern in error guidance");
});
