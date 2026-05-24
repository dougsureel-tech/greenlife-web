// Pin tests for scripts/check-no-unsafe-redirect.mjs.
//
// 30th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (HIGH-STAKES — open-redirect / phishing-via-legitimate-auth):
// `searchParams.get("returnTo"|"redirect"|...)` reads that flow into
// router.push() / router.replace() / redirect() without a leading-slash
// guard allow off-origin navigation. Attacker phishing link with
// `?returnTo=https://evil.com` performs the redirect AFTER a legitimate
// auth. Next.js router.push accepts external URLs.
//
// Sister port of inv `apps/staff/scripts/check-no-unsafe-redirect.mjs`
// (inv v397.485). Incident references: inv v396.645 (staff /login) +
// v397.445 (customer-PWA /account/login). Memory pin
// `feedback_open_redirect_safe_redirect_path`.
//
// Cannabis-web has 0 offenders today — gate is PREVENTIVE.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-no-unsafe-redirect.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-no-unsafe-redirect.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-no-unsafe-redirect — memory pin reference preserved", () => {
  assert.match(
    GATE_SRC,
    /feedback_open_redirect_safe_redirect_path/,
    "memory pin reference preserved",
  );
});

test("check-no-unsafe-redirect — inv v396.645 + v397.445 + v397.485 incident anchors", () => {
  // 3 inv incident/ship anchors. Pin all 3 so the cross-stack provenance
  // stays load-bearing.
  assert.match(GATE_SRC, /v396\.645/, "inv v396.645 (staff /login) anchor");
  assert.match(
    GATE_SRC,
    /v397\.445/,
    "inv v397.445 (customer-PWA /account/login) anchor",
  );
  assert.match(GATE_SRC, /v397\.485/, "inv v397.485 (sister gate-land) anchor");
});

test("check-no-unsafe-redirect — open-redirect-via-legit-auth mechanism documented", () => {
  // THE phishing mechanism — auth succeeds, then redirect goes off-origin.
  // Pin so it doesn't get demoted.
  assert.match(
    GATE_SRC,
    /off-origin\s+navigation/i,
    "off-origin navigation mechanism",
  );
  assert.match(
    GATE_SRC,
    /phishing\s+link/i,
    "phishing-link attack-vector reference",
  );
});

test("check-no-unsafe-redirect — REDIRECT_PARAM_RE = 9 canonical redirect param names", () => {
  // Conservative list — only names commonly used for post-action
  // redirects. Pin all 9 so drift catches every variant.
  for (const param of [
    "returnTo",
    "return_to",
    "redirect",
    "redirect_to",
    "callback",
    "callback_url",
    "continue",
    "continueTo",
    "next_url",
  ]) {
    assert.ok(
      GATE_SRC.includes(param),
      `REDIRECT_PARAM_RE must include "${param}"`,
    );
  }
});

test("check-no-unsafe-redirect — safeRedirectPath() suppressor name pinned", () => {
  // The escape — if `safeRedirectPath(` appears within ±20 lines, skip.
  // Pin the literal so it stays in lockstep with `lib/safe-redirect.ts`.
  assert.match(
    GATE_SRC,
    /safeRedirectPath\(/,
    "safeRedirectPath() suppressor name pinned",
  );
});

test("check-no-unsafe-redirect — ±20-line window for safeRedirectPath suppression", () => {
  // Window scope — load-bearing. Too small misses multi-line guard
  // refactors; too large false-suppresses unrelated downstream.
  assert.match(
    GATE_SRC,
    /lineIdx\s*\+\s*20/,
    "20-line forward window pinned",
  );
});

test("check-no-unsafe-redirect — KNOWN_OFFENDERS_BASELINE = 0 (preventive lock)", () => {
  // Baseline-0 = preventive guard. Anchors the "lock at 0" intent.
  assert.match(
    GATE_SRC,
    /KNOWN_OFFENDERS_BASELINE\s*=\s*0/,
    "baseline 0 (preventive) pinned",
  );
});

test("check-no-unsafe-redirect — SCAN_DIRS = app + lib + components", () => {
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"lib",\s*"components"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-no-unsafe-redirect — fix-recipe 4 steps documented (helper + import + guard + push)", () => {
  // Self-documenting fix recipe. Pin so it stays copy-pasteable.
  assert.match(
    GATE_SRC,
    /lib\/safe-redirect\.ts/,
    "fix step 1: helper file path pinned",
  );
  assert.match(
    GATE_SRC,
    /safeRedirectPath\(searchParams\.get/,
    "fix step 3: guarded read pinned",
  );
  assert.match(
    GATE_SRC,
    /<=\s*512\s*chars/,
    "fix step 1 validation: 512-char cap pinned",
  );
});

test("check-no-unsafe-redirect — comment-strip avoids false-positives in docs", () => {
  // Fix-docs may quote the bad pattern verbatim — strip comments
  // to prevent self-trip.
  assert.match(
    GATE_SRC,
    /noComments/,
    "comment-strip applied to source pre-scan",
  );
});

test("check-no-unsafe-redirect — strict by default, --warn opt-in", () => {
  assert.match(
    GATE_SRC,
    /warnOnly\s*=\s*process\.argv\.includes\("--warn"\)/,
    "--warn flag binding pinned",
  );
});
