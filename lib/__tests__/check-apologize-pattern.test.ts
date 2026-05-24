// Pin tests for scripts/check-apologize-pattern.mjs.
//
// Sister of check-brand-voice-locally-owned pins (v40.245). 3rd gate in
// the GLW marathon-port arc. fs-source-assertion pattern.
//
// Bug-class anchor: v18.105 (/terms-of-use never-apologize) + v18.705
// (MenuFallback iHJ-failure never-apologize). Bug recurs because it's
// how a copywriter without shop experience translates "we care" into
// prose. Doctrine: brand-voice doc "What we never do" — apologies for
// things that aren't our fault dilute the legal posture (apology =
// concession of fault) AND signal marketing-team voice instead of
// shop-owner voice.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-apologize-pattern.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-apologize-pattern.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-apologize-pattern — incident anchors preserved (v18.105 + v18.705)", () => {
  // The 2 incidents the gate locks in tell future readers the WHY.
  // Drift in comment cleanup that strips them = lose the doctrine.
  assert.match(GATE_SRC, /v18\.105/, "v18.105 (/terms-of-use) incident anchor");
  assert.match(
    GATE_SRC,
    /v18\.705/,
    "v18.705 (MenuFallback iHJ-failure) incident anchor",
  );
});

test("check-apologize-pattern — apology = concession-of-fault rationale pinned", () => {
  // The legal-posture rationale (apology = legal concession) is THE
  // load-bearing reason this gate ships strict. Pin so cleanup doesn't
  // demote it to a "voice nit".
  assert.ok(
    GATE_SRC.includes("apology = concession of fault") ||
      GATE_SRC.includes("concession of fault"),
    "apology = concession-of-fault rationale must persist in gate header",
  );
});

test("check-apologize-pattern — 4 canonical phrases substring-pinned", () => {
  // PATTERN regex is /\b(?:we apologize|We're sorry,|sorry for the|sorry about that)\b/gi
  // Pin each phrase via substring presence — drift in PATTERN that
  // drops one would surface here.
  assert.ok(GATE_SRC.includes("we apologize"), "we-apologize phrase pinned");
  assert.ok(GATE_SRC.includes("re sorry,"), "We're-sorry-comma phrase pinned");
  assert.ok(GATE_SRC.includes("sorry for the"), "sorry-for-the phrase pinned");
  assert.ok(
    GATE_SRC.includes("sorry about that"),
    "sorry-about-that phrase pinned",
  );
});

test("check-apologize-pattern — scan dirs are app + components + lib only", () => {
  // SCAN_DIRS = ["app", "components", "lib"] — customer-facing surfaces.
  // Adding scripts/ or __tests__/ would false-positive on this test file
  // (which discusses apology patterns).
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\[["']app["']\s*,\s*["']components["']\s*,\s*["']lib["']\]/,
    "SCAN_DIRS must be app + components + lib",
  );
});

test("check-apologize-pattern — EXEMPT_PREFIXES covers 3 documented exemptions", () => {
  // 3rd-party brand voice + scripts/ + lib/version.ts (changelog
  // describing rule retrospectively).
  assert.match(GATE_SRC, /app\/brands\/\[slug\]\/_brands\//);
  assert.match(GATE_SRC, /["']scripts\/["']/);
  assert.match(GATE_SRC, /lib\/version\.ts/);
});

test("check-apologize-pattern — strict by default, --warn opt-in", () => {
  // Default-strict (exit 1 on offender) — flag flip to default-warn
  // requires explicit doctrine change.
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

test("check-apologize-pattern — walk skips node_modules + .next + __tests__", () => {
  // __tests__ skip is critical — without it this very test file would
  // be scanned (it contains "we apologize" + "sorry for the" in pinning
  // the gate's patterns) and false-positive.
  assert.match(GATE_SRC, /name === "node_modules"/);
  assert.match(GATE_SRC, /name === "\.next"/);
  assert.match(GATE_SRC, /name === "__tests__"/);
});

test("check-apologize-pattern — stripComments helper removes // and /* */", () => {
  // Defensive comments ("// We apologize for the inconvenience is intentional
  // here per X") must NOT trip the gate after stripping. Pin presence of
  // the helper + the negated-newline signature for line-comment regex.
  assert.ok(
    GATE_SRC.includes("function stripComments"),
    "stripComments helper must exist",
  );
  assert.ok(
    GATE_SRC.includes("[\\s\\S]*?"),
    "block-comment lazy-match-anything signature must persist",
  );
  assert.ok(
    GATE_SRC.includes("[^\\n]*"),
    "line-comment negated-newline regex must persist",
  );
});
