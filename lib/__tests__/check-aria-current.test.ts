// Pin tests for scripts/check-aria-current.mjs.
//
// 4th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: when a Nav/Link computes "is this the current page" via
// usePathname() for visual treatment, it must ALSO pass aria-current="page"
// so screen-reader + voice-control users get the same signal. Cross-stack
// port from cannagent v6.4205.
//
// Heuristic the gate enforces:
//   IF file imports usePathname AND renders <Link
//   AND no `// aria-current:ignore-file` opt-out
//   THEN must contain at least one `aria-current=` attribute
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-aria-current.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-aria-current.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-aria-current — cross-stack port origin (cannagent v6.4205) anchor preserved", () => {
  // Knowing the cross-stack origin matters when investigating drift —
  // if cannagent's gate evolves, this stack's pin tests need to follow.
  assert.match(GATE_SRC, /cannagent v6\.4205/, "cannagent v6.4205 origin anchor");
});

test("check-aria-current — scan dirs are app + components only (NOT lib)", () => {
  // SCAN_DIRS deliberately excludes lib/ — lib helpers don't render Link.
  // Drift to include lib/ = false-positives on every utility module that
  // happens to import usePathname for a pure helper.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\[["']app["']\s*,\s*["']components["']\]/,
    "SCAN_DIRS must be app + components (NOT lib, NOT scripts)",
  );
});

test("check-aria-current — extensions limited to .tsx (NOT .ts)", () => {
  // .ts files don't render JSX → no <Link → no Nav-active concern.
  // Pin so a future widening to .ts surfaces here.
  assert.match(
    GATE_SRC,
    /EXTENSIONS\s*=\s*new\s+Set\(\s*\[["']\.tsx["']\]\s*\)/,
    "EXTENSIONS must be .tsx-only",
  );
});

test("check-aria-current — 3 detection signals pinned (usePathname + Link + ignore-file opt-out)", () => {
  // The 3 building blocks of the heuristic. Drift in any one =
  // either false-positives or silent misses.
  assert.match(
    GATE_SRC,
    /USE_PATHNAME_RE\s*=\s*\/.*usePathname/,
    "USE_PATHNAME_RE regex literal pinned",
  );
  assert.ok(
    GATE_SRC.includes("aria-current:ignore-file"),
    "ignore-file opt-out marker pinned (escape hatch for legit nav components that handle a11y elsewhere)",
  );
  assert.ok(
    GATE_SRC.includes("<Link"),
    "<Link substring pinned (the a11y-relevant render shape)",
  );
});

test("check-aria-current — aria-current=  attribute is what gets matched (not just 'aria-current' string)", () => {
  // The regex requires `aria-current=` with the equals sign — drift to
  // bare-word match would false-pass on a file that just has the string
  // in a comment / template-literal without actually setting the attribute.
  assert.ok(
    GATE_SRC.includes("aria-current\\s*=") ||
      GATE_SRC.includes('aria-current\\\\s*='),
    "aria-current= equals-anchored regex pinned",
  );
});

test("check-aria-current — ignore-file check is scoped to FIRST 600 chars only", () => {
  // The opt-out marker must be near the top of the file (in the
  // file-header comment) — pin the 600-char window so a stale marker
  // buried deep in the file doesn't accidentally disable the gate.
  assert.ok(
    GATE_SRC.includes("slice(0, 600)") ||
      GATE_SRC.includes("slice(0,600)"),
    "ignore-file marker scoped to first 600 chars (top-of-file header only)",
  );
});

test("check-aria-current — strict by default, --warn opt-in", () => {
  assert.match(
    GATE_SRC,
    /WARN_ONLY\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
});

test("check-aria-current — walk skips node_modules + .next + __tests__", () => {
  assert.match(GATE_SRC, /name === "node_modules"/);
  assert.match(GATE_SRC, /name === "\.next"/);
  assert.match(GATE_SRC, /name === "__tests__"/);
});
