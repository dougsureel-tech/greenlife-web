// Pin tests for scripts/check-no-module-init-rotatable-env.mjs.
//
// 28th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine: `const X = process.env.Y` at module scope (where Y is an
// admin-rotatable key — API tokens / FROM addresses / auth secrets)
// freezes Y's value for the Fluid Compute instance lifetime (~15-30
// min). When admin rotates via `vercel env rm + add`, stale FC instances
// keep using OLD value until cycled. Fix: replace const with
// `function getX() { return process.env.Y }`. Zero perf cost.
//
// Triggering arc: 2026-05-11 Jensine welcome-email — fixes shipped on
// inv (v401.505/.545/.565/.685) + cannagent (v6.4625). Cross-stack port
// from inv v401.705. cannagent v6.4845 self-audit caught TS-type
// annotation regex bypass — fix lifted into this version.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-no-module-init-rotatable-env.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-no-module-init-rotatable-env.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-no-module-init-rotatable-env — Fluid-Compute freeze-window doctrine preserved", () => {
  // THE load-bearing insight: FC freezes module-init vars for instance
  // lifetime (~15-30 min). Drift removes the mechanism rationale.
  assert.match(GATE_SRC, /Fluid\s+Compute/i, "Fluid Compute reference");
  assert.match(GATE_SRC, /15-30\s*min/i, "15-30 min instance lifetime");
  assert.match(GATE_SRC, /frozen|freezes/i, "freeze mechanism prose");
});

test("check-no-module-init-rotatable-env — Jensine 2026-05-11 incident anchor preserved", () => {
  // Cross-stack triggering arc. Pin so future cleanup keeps WHY.
  assert.match(GATE_SRC, /Jensine/, "Jensine origin anchor");
  assert.match(GATE_SRC, /2026-05-11/, "2026-05-11 arc date");
  assert.match(
    GATE_SRC,
    /v401\.(?:505|545|565|685|705)/,
    "v401.X incident ship anchor",
  );
});

test("check-no-module-init-rotatable-env — cannagent v6.4845 TS-type regex-bypass self-audit preserved", () => {
  // The regex-evolution history — pre-fix missed TS-type-annotated
  // module-init env captures. Pin so future regex tightening
  // remembers this trap class.
  assert.match(GATE_SRC, /v6\.4845/, "cannagent v6.4845 self-audit anchor");
  assert.match(
    GATE_SRC,
    /TS-type[\s-]?annotation/i,
    "TS-type annotation regex-trap documented",
  );
});

test("check-no-module-init-rotatable-env — ROTATABLE_ENV_VARS = canonical 13-key set", () => {
  // Pin all 13 guarded env-var names. Drift drops one = silent bypass
  // for that key class.
  for (const env of [
    // Email
    "RESEND_API_KEY",
    "RESEND_FROM",
    "RESEND_REPLY_TO",
    // SMS
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
    "TWILIO_FROM_NUMBER",
    // Auth
    "DASHBOARD_SESSION_SECRET",
    "PUSH_SEND_TOKEN",
    // VAPID
    "VAPID_PUBLIC_KEY",
    "VAPID_PRIVATE_KEY",
    "VAPID_EMAIL",
    // Quiz nurture
    "QUIZ_NURTURE_API_KEY",
    // Turnstile
    "TURNSTILE_SECRET_KEY",
  ]) {
    assert.ok(
      GATE_SRC.includes(`"${env}"`),
      `ROTATABLE_ENV_VARS must include "${env}"`,
    );
  }
});

test("check-no-module-init-rotatable-env — MODULE_INIT_ENV_RE tolerates TS-type annotation + multiline", () => {
  // Post-v6.4845 regex shape. Pin both fixes: (1) `(?:\s*:\s*[^=]+)?`
  // for type annotation tolerance, (2) `[^;]*?` non-greedy for
  // multiline ||-spanning expressions.
  assert.ok(
    GATE_SRC.includes("(?:\\s*:\\s*[^=]+)?"),
    "TS-type annotation tolerance pinned",
  );
  assert.ok(
    GATE_SRC.includes("[^;]*?process\\.env"),
    "non-greedy multiline tolerance pinned",
  );
});

test("check-no-module-init-rotatable-env — IGNORE_MARKER = `arc-guard: module-init-env-ok`", () => {
  // Per-line escape hatch shape — pin literal so it stays stable.
  assert.match(
    GATE_SRC,
    /arc-guard:\s*module-init-env-ok/,
    "IGNORE_MARKER literal pinned",
  );
});

test("check-no-module-init-rotatable-env — IGNORE_MARKER scope = previous 5 lines", () => {
  // Marker must be ON THE LINE BEFORE the const. Scope is last 5 lines
  // — narrow enough to avoid stale-marker false-positive defense.
  assert.match(
    GATE_SRC,
    /slice\(-5\)/,
    "5-line marker-scope window pinned",
  );
});

test("check-no-module-init-rotatable-env — anchored via import.meta.url (per arc-guard memory pin)", () => {
  // Cross-stack memory pin: gates MUST anchor via import.meta.url so
  // they don't depend on cwd.
  assert.ok(
    GATE_SRC.includes("import.meta.url") &&
      GATE_SRC.includes("fileURLToPath"),
    "REPO_ROOT must anchor via import.meta.url + fileURLToPath",
  );
});

test("check-no-module-init-rotatable-env — SCAN_DIRS = app + lib + components", () => {
  // 3 canonical surfaces for module-init env captures.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"lib",\s*"components"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
});

test("check-no-module-init-rotatable-env — fix-recipe: replace const with getX() function (zero perf cost)", () => {
  // Self-documenting fix recipe. Pin so it stays copy-pasteable.
  assert.match(
    GATE_SRC,
    /function\s+getX\(\)/,
    "function getX() recipe pinned",
  );
  assert.match(
    GATE_SRC,
    /[Zz]ero\s+perf\s+cost/,
    "zero-perf-cost callout pinned",
  );
});

test("check-no-module-init-rotatable-env — strict by default, --warn opt-in", () => {
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
