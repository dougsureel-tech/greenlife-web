// Pin tests for scripts/check-duplicate-brand-title.mjs.
//
// 18th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: layout sets `title.template = '%s | Green Life Cannabis'`.
// If a page-level metadata.title body BAKES in the brand, the renderer
// concatenates → `Apply | Green Life Cannabis | Green Life Cannabis`.
// Brand appears TWICE in SERP titles. Sites: GW v2.93.90 telehealth (T5)
// · GW v2.94.60 /about + /get-started (T24) · glw v14.705 + scc v13.2305
// /apply (T25). Gate added v14.905 (T27).
//
// Sub-block titles (openGraph.title, twitter.title) are INTENTIONAL —
// brand-in-title is harmless there. Brace-depth reverse-walk skips them.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-duplicate-brand-title.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-duplicate-brand-title.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-duplicate-brand-title — T5 + T24 + T25 + T27 ship-arc anchors preserved", () => {
  // 4-step arc: T5 first fix, T24 sweep extension, T25 cross-stack
  // sister, T27 this gate add. All 4 must persist.
  assert.match(GATE_SRC, /T5\b/, "T5 (GW telehealth) anchor");
  assert.match(GATE_SRC, /T24/, "T24 (GW /about + /get-started) anchor");
  assert.match(GATE_SRC, /T25/, "T25 (glw + scc /apply) anchor");
  assert.match(GATE_SRC, /T27/, "T27 (this gate-add) anchor");
});

test("check-duplicate-brand-title — version anchors preserved (v2.93.90 + v2.94.60 + v14.705 + v13.2305)", () => {
  // Per-stack incident versions — preserves cross-stack reproducibility.
  assert.match(GATE_SRC, /v2\.93\.90/, "GW v2.93.90 (telehealth)");
  assert.match(GATE_SRC, /v2\.94\.60/, "GW v2.94.60 (/about + /get-started)");
  assert.match(GATE_SRC, /v14\.705/, "glw v14.705 (/apply)");
  assert.match(GATE_SRC, /v13\.2305/, "scc v13.2305 (/apply)");
});

test("check-duplicate-brand-title — BRAND_NAME sourced from lib/store.ts (cross-stack portability)", () => {
  // Gate copies cleanly between glw + scc because BRAND_NAME comes from
  // each repo's own STORE.name. Hardcoded fallback is just for repo
  // independence — the dynamic read is load-bearing.
  assert.match(
    GATE_SRC,
    /lib\/store\.ts/,
    "lib/store.ts as BRAND_NAME source",
  );
  assert.match(
    GATE_SRC,
    /name:\\s\*\["']\(\[\^"']\+\)\["']/,
    "STORE.name regex extraction pinned",
  );
});

test("check-duplicate-brand-title — sub-block skip (openGraph + twitter + 5 more)", () => {
  // The 7 known sub-block fields that legitimately mention brand in
  // their own .title. Drift drops false-positives back in.
  for (const sub of [
    "openGraph",
    "twitter",
    "verification",
    "other",
    "appleWebApp",
    "icons",
    "alternates",
    "robots",
  ]) {
    assert.ok(
      GATE_SRC.includes(sub),
      `sub-block ${sub} must be in skip-list`,
    );
  }
});

test("check-duplicate-brand-title — title:{absolute} object-literal bypass skipped", () => {
  // Intentional bypass for legit absolute titles. Pin the early-continue
  // on `title: {` shape.
  assert.match(
    GATE_SRC,
    /stripped\[valStart\] === "\{"/,
    "object-literal title:{ skip pinned",
  );
});

test("check-duplicate-brand-title — STORE.name template-substitution caught", () => {
  // The runtime variant: `title: \`${STORE.name} | About\`` would also
  // produce a duplicate. Pin the runtime-substitution detection.
  assert.match(
    GATE_SRC,
    /\\\$\\\{\\s\*STORE\\\.name\\s\*\\\}/,
    "${STORE.name} template-substitution regex pinned",
  );
});

test("check-duplicate-brand-title — EXEMPT app/layout.tsx (template source)", () => {
  // The ONE intentional exemption — the layout itself sets the template
  // and legitimately mentions brand.
  assert.match(
    GATE_SRC,
    /"app\/layout\.tsx"/,
    "app/layout.tsx exempt pinned",
  );
  assert.match(
    GATE_SRC,
    /SOURCE\s+of\s+title\.template/i,
    "exempt rationale documented",
  );
});

test("check-duplicate-brand-title — SCAN_DIRS = app (only) — lib + scripts excluded", () => {
  // lib/ + scripts/ aren't title-template-aware. Scan only app/.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app"\]/,
    "SCAN_DIRS scoped to app/ only",
  );
});

test("check-duplicate-brand-title — fix-guidance lists 2 shapes (drop brand · use absolute)", () => {
  // Self-documenting fix. Pin so it doesn't get truncated.
  assert.match(
    GATE_SRC,
    /Drop\s+brand\s+from\s+title\s+body/i,
    "fix shape 1: drop brand",
  );
  assert.match(
    GATE_SRC,
    /title:\s*\{\s*absolute/,
    "fix shape 2: title.absolute escape hatch",
  );
});

test("check-duplicate-brand-title — strict by default, --warn opt-in", () => {
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
