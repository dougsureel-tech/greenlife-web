// Pin tests for scripts/check-metadata-exclusive.mjs.
//
// 27th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: Next.js App Router rule — a page/layout module can export
// ONE of `export const metadata` (static) OR `export async function
// generateMetadata` (dynamic). NOT BOTH. Both causes build error:
//   "You are exporting both metadata and generateMetadata from <route>.
//    Use one or the other."
// vitest passes; tsc passes; failure only surfaces when Next's build
// pass loads the module. By then deploy is stuck.
//
// Originating incident: VRG v9.6.27 (~30 min recovery). Cross-stack
// port from VRG v9.6.91 + cannagent + GW v2.97.C6 + sureel.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-metadata-exclusive.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-metadata-exclusive.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-metadata-exclusive — Next.js literal error message preserved", () => {
  // The literal error string Next emits. Pin so future devs Googling
  // it land on this gate's header.
  assert.match(
    GATE_SRC,
    /exporting both metadata and generateMetadata/i,
    "Next.js literal error string pinned",
  );
});

test("check-metadata-exclusive — typecheck-CLEAN trap doctrine preserved", () => {
  // THE load-bearing insight: vitest + tsc pass; only Next build catches.
  assert.match(GATE_SRC, /[Vv]itest\s+passes/, "vitest-passes trap documented");
  assert.match(GATE_SRC, /tsc\s+passes/, "tsc-passes trap documented");
  assert.match(GATE_SRC, /build\s+(?:pass|fails?)/i, "build-time-only catch mechanism");
});

test("check-metadata-exclusive — VRG v9.6.27 incident anchor + 30-min recovery", () => {
  // Triggering incident details — concrete recovery cost.
  assert.match(GATE_SRC, /VRG\s+v9\.6\.27/, "VRG v9.6.27 originating incident");
  assert.match(GATE_SRC, /~?30\s*min(?:utes?)?/i, "30-min recovery cost");
});

test("check-metadata-exclusive — 4 cross-stack origins (VRG + cannagent + GW + sureel)", () => {
  for (const stack of ["VRG\\s+v9\\.6\\.91", "cannagent", "GW\\s+v2\\.97\\.C6", "sureel"]) {
    assert.match(
      GATE_SRC,
      new RegExp(stack),
      `cross-stack origin ${stack} pinned`,
    );
  }
});

test("check-metadata-exclusive — 4 export detection regexes pinned (const/let/var + named-export × 2)", () => {
  // The detection contract — 4 shapes. Drift drops one = false-negative.
  assert.ok(
    GATE_SRC.includes("export\\s+(?:const|let|var)\\s+metadata"),
    "METADATA_RE (const/let/var) pinned",
  );
  assert.ok(
    GATE_SRC.includes("export\\s+(?:async\\s+)?function\\s+generateMetadata"),
    "GENERATE_RE (async function) pinned",
  );
  assert.match(
    GATE_SRC,
    /METADATA_NAMED_EXPORT_RE/,
    "named-export metadata regex pinned",
  );
  assert.match(
    GATE_SRC,
    /GENERATE_NAMED_EXPORT_RE/,
    "named-export generateMetadata regex pinned",
  );
});

test("check-metadata-exclusive — only page.tsx + layout.tsx scanned (not route.ts/loading/error)", () => {
  // Only these 2 file types use metadata. Drift would noise the report.
  assert.match(
    GATE_SRC,
    /entry === "page\.tsx" \|\| entry === "layout\.tsx"/,
    "page.tsx + layout.tsx walker filter pinned",
  );
});

test("check-metadata-exclusive — APP_DIR scoping (app/ only)", () => {
  // Scope: app/. Metadata only matters in App Router pages.
  assert.match(
    GATE_SRC,
    /APP_DIR\s*=\s*join\(REPO_ROOT,\s*["']app["']\)/,
    "APP_DIR scope pinned",
  );
});

test("check-metadata-exclusive — both-set detection (hasMetadata AND hasGenerate)", () => {
  // The flagging logic. Both must be true to count as violation.
  assert.match(
    GATE_SRC,
    /hasMetadata\s*&&\s*hasGenerate/,
    "hasMetadata && hasGenerate flag condition pinned",
  );
});

test("check-metadata-exclusive — multiline /m flags on detection regexes (export-on-own-line)", () => {
  // `^` anchored at line-start via /m — load-bearing for "export at
  // module top-level" semantics.
  for (const regex of ["METADATA_RE", "GENERATE_RE", "METADATA_NAMED_EXPORT_RE", "GENERATE_NAMED_EXPORT_RE"]) {
    const match = GATE_SRC.match(new RegExp(`${regex}\\s*=\\s*\\/.+?\\/m`));
    assert.ok(match, `${regex} must end with /m flag`);
  }
});
