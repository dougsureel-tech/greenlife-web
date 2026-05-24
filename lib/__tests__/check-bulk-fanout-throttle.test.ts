// Pin tests for scripts/check-bulk-fanout-throttle.mjs.
//
// 8th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: bulk fan-out via Promise.all*(recipients.map(async ... await
// send*)) generates new requests faster than external rate limits (Resend,
// Twilio). Without throttling, recipients drop silently. Jensine 2026-05-11
// welcome-email incident shipped 5 throttle fixes (v401.205/.245/.265/.285);
// this gate pins the bug class against re-introduction.
//
// IMPORTANT: this pin file CONTAINS the forbidden pattern as strings (in
// the regex assertions). The gate's IGNORE_MARKER (`arc-guard:
// bulk-fanout-throttle:ignore`) is the escape hatch — and __tests__/
// isn't explicitly skipped at the walk layer. Pin the marker presence
// so this test file can safely use it if needed.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-bulk-fanout-throttle.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-bulk-fanout-throttle.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-bulk-fanout-throttle — Jensine 2026-05-11 incident anchors preserved", () => {
  // 5 v401.X05 ship references — pin at least the v401 series + the
  // Jensine name so future cleanup keeps the WHY load-bearing.
  assert.match(GATE_SRC, /Jensine/, "Jensine 2026-05-11 incident anchor");
  assert.match(GATE_SRC, /v401\.205/, "v401.205 (bulkReissueSetupLinks) anchor");
  assert.match(GATE_SRC, /v401\.265/, "v401.265 (cron crons) anchor");
  assert.match(GATE_SRC, /v401\.285/, "v401.285 (sms sendBatch) anchor");
});

test("check-bulk-fanout-throttle — PROMISE_ALL_RE detects both .all + .allSettled + map", () => {
  // The detection regex matches Promise.(all|allSettled)(...map( shape.
  // Drift to .all-only would miss .allSettled bulk fan-outs.
  assert.ok(
    GATE_SRC.includes("Promise\\.(?:all|allSettled)"),
    "PROMISE_ALL_RE must match both .all + .allSettled",
  );
  assert.ok(
    GATE_SRC.includes("\\.map\\s*\\("),
    "PROMISE_ALL_RE must look for .map( chain",
  );
});

test("check-bulk-fanout-throttle — SEND_CALL_RE detects 3 send-shape signals", () => {
  // The send-call detector must catch: (1) `await send*(`, (2)
  // `await resend.emails.send`, (3) `await fetch("https://api.resend.com`.
  // Drift in any reduces coverage.
  assert.ok(
    GATE_SRC.includes("send[A-Z]\\w*"),
    "send* function-name pattern pinned",
  );
  assert.ok(
    GATE_SRC.includes("resend\\.emails\\.send"),
    "resend.emails.send pattern pinned",
  );
  assert.ok(
    GATE_SRC.includes("api\\.resend\\.com"),
    "api.resend.com fetch pattern pinned",
  );
});

test("check-bulk-fanout-throttle — THROTTLE_RE detects 5 explicit-throttle signals", () => {
  // The throttle-presence detector suppresses the finding when ANY of
  // setTimeout/sleep/throttle/SEND_THROTTLE_MS/delay shows up in the
  // window. Pin all 5 so a future tightening that drops one doesn't
  // start false-positiving on already-throttled code.
  for (const signal of ["setTimeout", "sleep", "throttle", "SEND_THROTTLE_MS", "delay"]) {
    assert.ok(
      GATE_SRC.includes(signal),
      `THROTTLE_RE must include ${signal} signal`,
    );
  }
});

test("check-bulk-fanout-throttle — 800-char window for callback-body inspection", () => {
  // The window-size constant is load-bearing — too small misses larger
  // map callbacks; too large false-positives on adjacent unrelated
  // code. Pin the 800 so a refactor that bumps to 8000 doesn't
  // silently flip the false-positive rate.
  assert.match(
    GATE_SRC,
    /match\.index\s*\+\s*800/,
    "800-char inspection window pinned",
  );
});

test("check-bulk-fanout-throttle — IGNORE_MARKER escape hatch is `arc-guard: bulk-fanout-throttle:ignore`", () => {
  // The opt-out marker shape — pin the literal string so the marker
  // stays stable across refactors (an opt-out marker that changes
  // breaks every existing escape in the codebase).
  assert.match(
    GATE_SRC,
    /arc-guard:\s*bulk-fanout-throttle:ignore/,
    "IGNORE_MARKER literal must remain stable",
  );
});

test("check-bulk-fanout-throttle — anchored via import.meta.url (per arc-guard memory pin)", () => {
  assert.ok(
    GATE_SRC.includes("import.meta.url") &&
      GATE_SRC.includes("fileURLToPath"),
    "REPO_ROOT must anchor via import.meta.url + fileURLToPath",
  );
});

test("check-bulk-fanout-throttle — SCAN_DIRS = app + lib + components", () => {
  // Customer-facing surfaces + cron-touching libs. NOT scripts/ — the
  // gate doesn't scan itself + cron scripts live in app/api/cron/.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\[["']app["']\s*,\s*["']lib["']\s*,\s*["']components["']\]/,
    "SCAN_DIRS must be app + lib + components",
  );
});
