// Pin tests for scripts/check-loyalty-math-drift.mjs.
//
// 26th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// Doctrine (Doug 2026-05-07 spec, docs/brand-voice.md):
//   Earn rate: 0.5pt/$1 if opted-in to SMS or email, 0.25pt/$1 if
//              NEITHER. NOT 1pt/$1 universal.
//   Redemption: SLIDING LADDER, not linear $1/100pt:
//     50pt→5% · 100pt→10% · 200pt→20% · 250pt→25% ·
//     300pt→30% (basket <$75) · 400pt→30% (basket $75+)
//
// 6 sweep ships: v17.405 + v17.505 + v18.205 + v26.205 + v26.305 + v26.905
// across /deals + /faq + welcome-email.
//
// KNOWN-DIVERGENCE exempts: lib/portal.ts (deployed dollarValue math —
// Doug-decision, needs POS-register parity) + components/LoyaltyCard.tsx
// (displays portal.ts dollarValue, must stay consistent).
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-loyalty-math-drift.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-loyalty-math-drift.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-loyalty-math-drift — Doug 2026-05-07 spec + docs/brand-voice.md anchors preserved", () => {
  // The authoritative source — Doug's spec date + brand-voice.md.
  assert.match(GATE_SRC, /Doug\s+2026-05-07/, "Doug 2026-05-07 spec anchor");
  assert.match(
    GATE_SRC,
    /docs\/brand-voice\.md/,
    "brand-voice.md source citation",
  );
});

test("check-loyalty-math-drift — 6 sweep ship anchors preserved (v17 + v18 + v26 series)", () => {
  // 6 sweeps document recurrence — pin all 6.
  for (const v of ["v17.405", "v17.505", "v18.205", "v26.205", "v26.305", "v26.905"]) {
    assert.ok(
      GATE_SRC.includes(v),
      `sweep anchor ${v} must persist`,
    );
  }
});

test("check-loyalty-math-drift — canonical earn-rate doctrine preserved (0.5 + 0.25 NOT 1)", () => {
  // The CANONICAL math. Drift = wrong customer-facing copy.
  assert.match(
    GATE_SRC,
    /0\.5\s*pt\/\$1/i,
    "0.5pt/$1 opted-in rate pinned",
  );
  assert.match(
    GATE_SRC,
    /0\.25\s*pt\/\$1/i,
    "0.25pt/$1 not-opted-in rate pinned",
  );
  assert.match(
    GATE_SRC,
    /NOT\s+1\s*pt/i,
    "explicit NOT-1pt anchor preserved",
  );
});

test("check-loyalty-math-drift — sliding-ladder redemption canon (all 6 tiers)", () => {
  // All 6 tier rows must be present in the doctrine prose.
  for (const tier of [
    /50pt\s*→\s*5%/,
    /100pt\s*→\s*10%/,
    /200pt\s*→\s*20%/,
    /250pt\s*→\s*25%/,
    /300pt\s*→\s*30%/,
    /400pt\s*→\s*30%/,
  ]) {
    assert.match(
      GATE_SRC,
      tier,
      `sliding-ladder tier ${tier} must persist`,
    );
  }
  assert.match(
    GATE_SRC,
    /SLIDING\s+LADDER/i,
    "SLIDING LADDER doctrine label pinned",
  );
});

test("check-loyalty-math-drift — KNOWN-DIVERGENCE exempts documented (portal.ts + LoyaltyCard.tsx)", () => {
  // Both implementation-side exempts must be pinned with rationale.
  assert.match(GATE_SRC, /lib\/portal\.ts/, "lib/portal.ts exempt pinned");
  assert.match(
    GATE_SRC,
    /POINTS_PER_DOLLAR\s*=\s*100/,
    "POINTS_PER_DOLLAR=100 deployed math anchor",
  );
  assert.match(
    GATE_SRC,
    /components\/LoyaltyCard\.tsx/,
    "components/LoyaltyCard.tsx exempt pinned",
  );
  assert.match(
    GATE_SRC,
    /POS-register\s+parity/i,
    "POS-register parity Doug-decision rationale",
  );
});

test("check-loyalty-math-drift — 3 detection patterns pinned (linear-earn + 100pt=$1 + $1-off-per-100)", () => {
  // The 3 drift patterns to flag.
  assert.ok(
    GATE_SRC.includes("1\\s+(?:point|pt)\\s+per\\s+\\$1"),
    "linear earn rate '1pt per $1' regex pinned",
  );
  assert.ok(
    GATE_SRC.includes("100\\s*(?:points?|pts)\\s*=\\s*\\$1"),
    "linear redemption '100pt=$1' regex pinned",
  );
  assert.ok(
    GATE_SRC.includes(
      "\\$1\\s*off\\s+(?:per|every)\\s+100\\s*(?:points?|pts)",
    ),
    "'$1 off per/every 100pt' regex pinned",
  );
});

test("check-loyalty-math-drift — 4 EXEMPT_PREFIXES (portal + LoyaltyCard + scripts + version.ts)", () => {
  for (const p of [
    "lib/portal.ts",
    "components/LoyaltyCard.tsx",
    "scripts/",
    "lib/version.ts",
  ]) {
    assert.ok(
      GATE_SRC.includes(`"${p}"`),
      `EXEMPT_PREFIXES must include "${p}"`,
    );
  }
});

test("check-loyalty-math-drift — SCAN_DIRS + EXTENSIONS canonical", () => {
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\["app",\s*"components",\s*"lib"\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
  assert.match(
    GATE_SRC,
    /EXTENSIONS\s*=\s*new Set\(\[["']\.ts["'],\s*["']\.tsx["']\]\)/,
    "EXTENSIONS canonical",
  );
});

test("check-loyalty-math-drift — walker skips __tests__ + node_modules + .next (self-trip defense)", () => {
  // Pin file contains patterns; walker must skip.
  assert.match(GATE_SRC, /name === "__tests__"/, "__tests__ skip pinned");
  assert.match(GATE_SRC, /name === "node_modules"/, "node_modules skip pinned");
  assert.match(GATE_SRC, /name === "\.next"/, ".next skip pinned");
});

test("check-loyalty-math-drift — strict by default, --warn opt-in", () => {
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
