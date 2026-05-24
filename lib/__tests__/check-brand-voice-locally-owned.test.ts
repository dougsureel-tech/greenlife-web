// Pin tests for scripts/check-brand-voice-locally-owned.mjs.
//
// fs-source-assertion pattern. Locks the gate's load-bearing doctrine
// (Doug 2026-05-02 directive: NO "locally owned" framing in customer-facing
// copy because ownership change is coming + journalists / AI engines
// indexing the site would quote stale framing).
//
// Bug-class anchor: v25.305 + v25.505 + v17.105 + v17.805 + v17.905 +
// v18.005 + v26.805 + v26.905 cross-store sweeps. Bug survives in pieces
// between sweeps — defensive comments justifying exemptions ARE the trap
// (v17.805 catch was hidden by a comment saying "Locally owned framing
// stays here per the SCC positioning").
//
// Sister gate ports the inv-App build-gate marathon convention to GLW.
// 2nd of the GLW marathon-port arc (after check-after-wrap-external-send
// v40.225 / SCC v31.525). Sister-port to SCC pending.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-brand-voice-locally-owned.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-brand-voice-locally-owned.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-brand-voice-locally-owned — Doug 2026-05-02 directive anchor preserved", () => {
  // The WHY of the gate — ownership change coming + AI engines indexing
  // stale framing. Pin the date + 'ownership change' rationale so a
  // future comment-cleanup that strips WHY doesn't lose the directive.
  assert.match(
    GATE_SRC,
    /Doug 2026-05-02/,
    "Doug 2026-05-02 directive anchor must persist",
  );
});

test("check-brand-voice-locally-owned — scan dirs are app + components + lib only", () => {
  // SCAN_DIRS = ["app", "components", "lib"] — these are the customer-
  // facing surfaces. Drift to add `scripts/` or `__tests__/` would false-
  // positive on this very test file (which discusses "locally owned").
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\[["']app["']\s*,\s*["']components["']\s*,\s*["']lib["']\]/,
    "SCAN_DIRS must be app + components + lib (no scripts, no __tests__)",
  );
});

test("check-brand-voice-locally-owned — 6 canonical regex patterns pinned", () => {
  // The 6 patterns capture the actual Doug-flagged framings. Drift =
  // missed catches. Pin each one explicitly via substring presence
  // (avoids double-escape complexity of asserting regex source).
  assert.ok(GATE_SRC.includes("locally[\\s-]owned"), "locally-owned pattern");
  assert.ok(
    GATE_SRC.includes("independently[\\s-]owned"),
    "independently-owned pattern",
  );
  assert.ok(GATE_SRC.includes("family[\\s-]owned"), "family-owned pattern");
  assert.ok(
    GATE_SRC.includes("Wenatchee") && GATE_SRC.includes("favorite\\s+shop"),
    "Wenatchee's-favorite-shop pattern",
  );
  assert.ok(GATE_SRC.includes("Seattle"), "Seattle's-favorite-shop pattern");
  assert.ok(
    GATE_SRC.includes("Rainier\\s+Valley"),
    "Rainier-Valley's-favorite-shop pattern",
  );
});

test("check-brand-voice-locally-owned — EXEMPT_PREFIXES covers the 4 documented exemptions", () => {
  // Drift in EXEMPT_PREFIXES = false-positives on legitimate 3rd-party
  // brand pages (Agro Couture IS family-owned + that fact belongs on
  // their brand page) OR on the changelog itself describing the rule
  // retrospectively. Pin the 4 canonical exemptions.
  assert.match(
    GATE_SRC,
    /app\/brands\/\[slug\]\/_brands\//,
    "brand pages exempt (legit 3rd-party ownership)",
  );
  assert.match(GATE_SRC, /lib\/brand-copy\.ts/, "brand-copy SSoT exempt");
  assert.match(GATE_SRC, /["']scripts\/["']/, "scripts/ exempt (this guard + sisters)");
  assert.match(
    GATE_SRC,
    /lib\/version\.ts/,
    "lib/version.ts exempt (changelog describes rule retrospectively)",
  );
});

test("check-brand-voice-locally-owned — comments are stripped before pattern matching", () => {
  // The stripComments() pass removes // and /* */ — without this, a
  // defensive comment saying "Locally owned framing stays here" would
  // trip the gate. v17.805 was hidden by exactly such a defensive
  // comment. Stripping ALSO means the gate can't read its own comments
  // (which contain "locally owned" in the rule description) — good.
  assert.ok(
    GATE_SRC.includes("function stripComments"),
    "stripComments helper must exist",
  );
  // Block-comment regex `/\/\*[\s\S]*?\*\//g` — pin via the unique
  // substring of the regex body.
  assert.ok(
    GATE_SRC.includes("[\\s\\S]*?"),
    "block-comment lazy-match-anything must persist (signature of stripComments)",
  );
  // Line-comment regex `/\/\/[^\n]*/g` — pin via the negated-newline
  // character class.
  assert.ok(
    GATE_SRC.includes("[^\\n]*"),
    "line-comment negated-newline regex must persist",
  );
});

test("check-brand-voice-locally-owned — strict by default, --warn opt-in", () => {
  // Defensive: gate ships strict (exit 1 on offender). --warn flag is
  // an explicit opt-in (used during sweep-cleanup windows). Pin the
  // default-strict semantics so a flip to default-warn requires explicit
  // doctrine change.
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

test("check-brand-voice-locally-owned — walk skips node_modules + .next + __tests__", () => {
  // Walk filters out infra noise. Without __tests__ skip, this very
  // test file would be scanned (it contains "locally owned" in
  // describing what the gate catches) and false-positive.
  assert.match(GATE_SRC, /name === "node_modules"/);
  assert.match(GATE_SRC, /name === "\.next"/);
  assert.match(GATE_SRC, /name === "__tests__"/);
});
