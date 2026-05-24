// Pin tests for scripts/check-customer-cta-order-href.mjs.
//
// 16th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (DOUG STANDING RULE — memory pin
// `feedback_glw_scc_customer_cta_menu_only`): customer CTAs on the
// cannabis sites MUST point at `/menu`, never `/order`. proxy.ts
// 307-redirects /order → /menu — every customer-facing /order link
// eats a hop AND drops query params (iHJ Boost doesn't honor
// ?vibe=… deep-links post-redirect — params lost forever).
//
// Retraction sweeps: v15.905 + v16.705 + v22.505. Bug-class re-surfaces
// because each new customer copy ship can re-introduce it. This gate
// ENFORCES the rule.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-customer-cta-order-href.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(
  process.cwd(),
  "scripts/check-customer-cta-order-href.mjs",
);
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-customer-cta-order-href — Doug standing-rule memory pin preserved", () => {
  // The cross-doctrine memory pin reference. Without this link, future
  // cleanup could lose the rule's provenance.
  assert.match(
    GATE_SRC,
    /feedback_glw_scc_customer_cta_menu_only/,
    "memory pin reference preserved",
  );
});

test("check-customer-cta-order-href — 3 retraction sweep anchors preserved", () => {
  // 3 sweeps document the bug-class recurrence. Pin all 3 so future
  // cleanup keeps the recurrence history.
  assert.match(GATE_SRC, /v15\.905/, "v15.905 retraction sweep");
  assert.match(GATE_SRC, /v16\.705/, "v16.705 retraction sweep");
  assert.match(GATE_SRC, /v22\.505/, "v22.505 retraction sweep");
});

test("check-customer-cta-order-href — proxy.ts redirect + query-drop mechanism documented", () => {
  // The MECHANISM. Without this anchor, future devs might think
  // /order is fine because "it redirects anyway" — missing the
  // query-param drop that destroys iHJ Boost deep-links.
  assert.match(GATE_SRC, /proxy\.ts/, "proxy.ts reference");
  assert.match(GATE_SRC, /307/, "307-redirect status code");
  assert.match(GATE_SRC, /[Qq]uery\s+params/i, "query-param drop mechanism");
  assert.match(GATE_SRC, /iHJ\s+Boost/i, "iHJ Boost no-deep-link constraint");
});

test("check-customer-cta-order-href — 5 detection patterns pinned (JSX literal + template + ${} + redirect)", () => {
  // The PATTERNS array — drift in any reduces detection.
  assert.ok(
    GATE_SRC.includes('/href\\s*=\\s*["\']\\/order'),
    "JSX-literal href pattern pinned",
  );
  assert.ok(
    GATE_SRC.includes("href\\s*=\\s*\\{\\s*`\\/order"),
    "template-literal href pattern pinned",
  );
  assert.ok(
    GATE_SRC.includes("\\$\\{[^}]+\\}\\/order"),
    "full-URL template (${...}/order) pattern pinned",
  );
  assert.ok(
    GATE_SRC.includes("(redirect|push|replace)"),
    "imperative-navigation pattern pinned (redirect/push/replace)",
  );
});

test("check-customer-cta-order-href — function-wrapped template caught (v24.405 find-your-strain leak)", () => {
  // Specific past-leak: `href={withAttr(\`/order...\`)}` — function
  // wraps the template literal. Pin the v24.405 anchor + pattern.
  assert.match(GATE_SRC, /v24\.405/, "v24.405 own-code-audit miss anchor");
  assert.ok(
    GATE_SRC.includes("href\\s*=\\s*\\{[^}]*?`\\/order"),
    "function-wrapped template pattern pinned",
  );
});

test("check-customer-cta-order-href — 4 EXEMPT_PREFIXES pinned (app/order + dev + proxy + scripts)", () => {
  // The legitimate exempts. Drift drops false-positives back in.
  for (const p of ["app/order/", "app/dev/", "proxy.ts", "scripts/"]) {
    assert.ok(
      GATE_SRC.includes(`"${p}"`),
      `EXEMPT_PREFIXES must include "${p}"`,
    );
  }
});

test("check-customer-cta-order-href — SKIP_LINE_MARKERS = HIDE_ON + canonical:", () => {
  // HIDE_ON = defensive arrays (banner won't render if user is on /order).
  // canonical: = self-canonical declaration in app/order/page.tsx itself.
  // Drift would re-introduce false-positives.
  assert.match(
    GATE_SRC,
    /SKIP_LINE_MARKERS\s*=\s*\["HIDE_ON",\s*"canonical:"\]/,
    "SKIP_LINE_MARKERS pinned exact",
  );
});

test("check-customer-cta-order-href — SCAN_DIRS + EXTENSIONS canonical", () => {
  // app + components + lib (no scripts — gate is exempt anyway).
  // .ts + .tsx only.
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical",
  );
  assert.match(
    GATE_SRC,
    /EXTENSIONS\s*=\s*new Set\(\[["']\.ts["'],\s*["']\.tsx["']\]\)/,
    "EXTENSIONS canonical",
  );
});

test("check-customer-cta-order-href — walk skips __tests__/.next/node_modules (self-trip defense)", () => {
  // Critical: this pin file CONTAINS forbidden /order strings (in
  // pattern assertions). Walk MUST skip __tests__/ or gate self-trips.
  assert.match(
    GATE_SRC,
    /name === "__tests__"/,
    "__tests__ skip (self-trip defense) pinned",
  );
  assert.match(GATE_SRC, /name === "node_modules"/, "node_modules skip");
  assert.match(GATE_SRC, /name === "\.next"/, "build-output skip");
});

test("check-customer-cta-order-href — strict by default, --warn opt-in", () => {
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
