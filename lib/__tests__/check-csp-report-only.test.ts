// Pin tests for scripts/check-csp-report-only.mjs.
//
// 15th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: CSP-RO observation infrastructure is part of Doug-action #2
// enforce-mode prep. Pre-T108 glw + scc were the lone CSP outliers
// across the 6-site stack. T108 v20.005 added permissive CSP-RO to start
// observing what would break under enforce mode; T109 v20.105 added
// report-uri /api/csp-report + endpoint so violations get logged
// centrally to Vercel Runtime Logs (not per-user DevTools Console).
//
// 4 invariants: CSP_REPORT_ONLY const · header registration · report-uri
// directive · endpoint route file. Drift on ANY = observability hole.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-csp-report-only.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-csp-report-only.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-csp-report-only — T108 v20.005 + T109 v20.105 ship-anchors preserved", () => {
  // 2 ship-anchors — T108 = CSP-RO baseline, T109 = report-uri + endpoint.
  // Drift on either loses the historical link to the recipe.
  assert.match(GATE_SRC, /T108/, "T108 anchor (CSP-RO baseline)");
  assert.match(GATE_SRC, /v20\.005/, "v20.005 ship version (T108)");
  assert.match(GATE_SRC, /T109/, "T109 anchor (report-uri + endpoint)");
  assert.match(GATE_SRC, /v20\.105/, "v20.105 ship version (T109)");
});

test("check-csp-report-only — pre-T108 lone-CSP-outlier doctrine preserved", () => {
  // The WHY for adding the gate at all — glw + scc were the only sites
  // without CSP. Cross-stack context anchor.
  assert.match(GATE_SRC, /lone\s+CSP\s+outlier/i, "lone CSP outlier framing");
  assert.match(GATE_SRC, /6-site\s+stack/i, "6-site stack reference");
});

test("check-csp-report-only — Doug-action #2 enforce-mode prep anchor", () => {
  // Cross-doctrine: this gate's purpose is upstream of enforce-mode
  // migration. Pin so future cleanup doesn't sever the prep link.
  assert.match(
    GATE_SRC,
    /Doug-action\s+#2/,
    "Doug-action #2 enforce-mode anchor",
  );
  assert.match(
    GATE_SRC,
    /enforce-mode\s+prep/i,
    "enforce-mode prep rationale",
  );
});

test("check-csp-report-only — 4-invariant set pinned (const + header + directive + endpoint)", () => {
  // Drift on any of the 4 = observability hole. Pin all 4 explicitly.
  assert.match(GATE_SRC, /CSP_REPORT_ONLY/, "const-name invariant");
  assert.match(
    GATE_SRC,
    /Content-Security-Policy-Report-Only/,
    "header-name invariant",
  );
  assert.ok(
    GATE_SRC.includes("report-uri\\s+\\/api\\/csp-report"),
    "report-uri directive invariant (escaped form)",
  );
  assert.match(
    GATE_SRC,
    /app\/api\/csp-report\/route\.ts/,
    "endpoint file path invariant",
  );
});

test("check-csp-report-only — CONFIG_FILE = next.config.ts (NOT next.config.js)", () => {
  // glw uses .ts (vercel.ts era). Pin the .ts extension so a future
  // downgrade-to-.js silently doesn't break the scan.
  assert.match(
    GATE_SRC,
    /CONFIG_FILE\s*=\s*join\(process\.cwd\(\),\s*["']next\.config\.ts["']\)/,
    "CONFIG_FILE pinned to next.config.ts",
  );
});

test("check-csp-report-only — endpoint file existence checked via statSync (not regex parse)", () => {
  // Filesystem stat is the ONLY reliable way to verify route file
  // exists. A regex scan of config file wouldn't catch a deleted
  // endpoint that the config still references.
  assert.match(
    GATE_SRC,
    /statSync\(ENDPOINT_FILE\)/,
    "statSync existence check pinned",
  );
});

test("check-csp-report-only — differentiated exit codes (1=missing-piece / 2=unreadable-config)", () => {
  // Exit 2 = config-drift / repo-shape change. Exit 1 = regression.
  // Different signals for different responses.
  assert.ok(GATE_SRC.includes("process.exit(1)"), "exit 1 (missing piece) pinned");
  assert.ok(GATE_SRC.includes("process.exit(2)"), "exit 2 (unreadable config) pinned");
});

test("check-csp-report-only — error message references T108 + T109 changelog", () => {
  // Self-documenting: the FAIL message tells the next dev WHERE to look
  // (changelog T108/T109). Pin so the link doesn't get stripped.
  assert.match(GATE_SRC, /T108[\s\S]*T109/, "T108 + T109 ordered in error guidance");
});
