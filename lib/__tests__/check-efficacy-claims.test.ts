// Pin tests for scripts/check-efficacy-claims.mjs.
//
// 9th gate in the GLW marathon-port arc. fs-source-assertion pattern.
//
// DOCTRINE (HIGH-STAKES — WSLCB COMPLIANCE): WAC 314-55-155 forbids
// tying a cannabis compound/category to a predictable therapeutic
// effect. Preference framing ("people pick this for body-heavy sessions")
// is allowed; causation framing ("myrcene tends toward sedating") is
// NOT. This gate pins the strongest patterns; communications-expert
// reviews handle subtler hedge cases.
//
// Incident anchors: 8 cross-store sweeps (v17.305/.505/.605 + v26.105/
// .305/.405 + v18.305 + v27.005) stripped predictable-effect-attribution
// from /learn + /faq + /blog × 3 + quiz-nurture-email.
//
// IMPORTANT self-trip defense: this pin test file CONTAINS the
// forbidden patterns as regex substrings (in the assertions). __tests__/
// must be skipped at the walk layer for this file to not self-trip the
// gate it's pinning. Pinned explicitly.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-efficacy-claims.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const GATE_PATH = join(process.cwd(), "scripts/check-efficacy-claims.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

test("check-efficacy-claims — WAC 314-55-155 doctrine anchor preserved", () => {
  // The WHY of the gate. Without the WAC reference, future cleanup
  // could demote it to "voice nit" instead of "regulatory compliance".
  assert.match(
    GATE_SRC,
    /WAC\s+314-55-155/,
    "WAC 314-55-155 reference must persist in gate header",
  );
});

test("check-efficacy-claims — preference-vs-causation distinction documented", () => {
  // The load-bearing doctrine — preference framing OK, causation NOT.
  // Pin the doctrine prose so it survives comment cleanup.
  assert.match(
    GATE_SRC,
    /[Pp]reference\s+framing/,
    "preference framing doctrine must persist",
  );
  assert.match(
    GATE_SRC,
    /[Cc]ausation\s+framing/,
    "causation framing doctrine must persist",
  );
});

test("check-efficacy-claims — sweep incident anchors preserved (v17.X05 + v26.X05 series)", () => {
  // 8 cross-store sweeps — pin at least 4 representative ones so the
  // recurrence history stays readable.
  assert.match(GATE_SRC, /v17\.305/, "v17.305 sweep anchor");
  assert.match(GATE_SRC, /v17\.605/, "v17.605 sweep anchor");
  assert.match(GATE_SRC, /v26\.105/, "v26.105 sweep anchor");
  assert.match(GATE_SRC, /v18\.305/, "v18.305 sweep anchor");
});

test("check-efficacy-claims — causation-verb patterns pinned (tends toward + often)", () => {
  // The 2 highest-signal causation patterns. Drift in either =
  // missed WSLCB violations.
  assert.ok(
    GATE_SRC.includes("tends?\\s+(?:toward|to\\s+feel)"),
    "'tends toward / tends to feel' pattern pinned",
  );
  assert.ok(
    GATE_SRC.includes("often\\s+(?:sedating|uplifting|calming|relaxing)"),
    "'often sedating/uplifting/calming/relaxing' pattern pinned",
  );
});

test("check-efficacy-claims — associative + copula patterns pinned (LLM-feed catchers)", () => {
  // v19.905 + v20.005 caught these on llms.txt / llms-full.txt where
  // earlier regex missed AI-feed-style "X is associated with Y effects".
  assert.ok(
    GATE_SRC.includes("associated\\s+with"),
    "'associated with' (associative) pattern pinned",
  );
  assert.ok(
    GATE_SRC.includes("traditionally"),
    "'= traditionally' (copula) pattern pinned",
  );
});

test("check-efficacy-claims — therapeutic-verb + condition pairings pinned", () => {
  // helps with / good for / relieves / treats — all paired with
  // anxiety/insomnia/pain/depression/PTSD/nausea (WAC-listed conditions).
  for (const verb of ["helps?\\s+with", "good\\s+for", "relieves?", "treats?"]) {
    assert.ok(
      GATE_SRC.includes(verb),
      `therapeutic verb '${verb}' must be pinned in a condition-pairing pattern`,
    );
  }
  for (const cond of ["anxiety", "insomnia", "pain", "depression", "PTSD", "nausea"]) {
    assert.ok(
      GATE_SRC.includes(cond),
      `condition '${cond}' must appear in a therapeutic-verb pattern`,
    );
  }
});

test("check-efficacy-claims — pharmacological descriptors pinned", () => {
  // Clinical-sounding terms that imply pharmacological efficacy:
  // anti-anxiety, anxiolytic, anti-inflammatory, analgesic.
  assert.ok(
    GATE_SRC.includes("anti[\\s-]?anxiety"),
    "anti-anxiety descriptor pinned",
  );
  assert.ok(GATE_SRC.includes("anxiolytic"), "anxiolytic descriptor pinned");
  assert.ok(
    GATE_SRC.includes("anti[\\s-]?inflammatory"),
    "anti-inflammatory descriptor pinned",
  );
  assert.ok(GATE_SRC.includes("analgesic"), "analgesic descriptor pinned");
});

test("check-efficacy-claims — Senior→Wisdom rename (Doug 2026-05 dignity directive)", () => {
  // Cross-doctrine catch: 'Senior discount' must be 'Wisdom discount'
  // per Doug's 2026-05 dignity directive. Pin the rule so a future
  // refactor doesn't drop it.
  assert.match(
    GATE_SRC,
    /Senior\\s\+discount/,
    "Senior→Wisdom rename rule must persist",
  );
  assert.match(
    GATE_SRC,
    /Doug\s+2026-05/,
    "Doug 2026-05 dignity directive anchor preserved",
  );
});

test("check-efficacy-claims — SCAN_DIRS + EXEMPT_PREFIXES + walk-skip __tests__ pinned", () => {
  // app + components + lib customer-facing surfaces · 3rd-party brand
  // pages exempt (their own voice) · scripts/ + version.ts exempt
  // (gate + changelog describe rule retrospectively) · walk skips
  // __tests__ (load-bearing — this file contains forbidden patterns).
  assert.match(
    GATE_SRC,
    /SCAN_DIRS\s*=\s*\[["']app["']\s*,\s*["']components["']\s*,\s*["']lib["']\]/,
    "SCAN_DIRS canonical 3-dir set",
  );
  assert.match(GATE_SRC, /app\/brands\/\[slug\]\/_brands\//, "3rd-party brand exempt");
  assert.match(GATE_SRC, /["']scripts\/["']/, "scripts/ exempt");
  assert.match(GATE_SRC, /lib\/version\.ts/, "lib/version.ts exempt");
  assert.match(GATE_SRC, /name === "__tests__"/, "walk skips __tests__ (self-trip defense)");
});

test("check-efficacy-claims — strict by default, --warn opt-in", () => {
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
