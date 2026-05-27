// Pin tests for scripts/check-strain-body-claims.mjs.
//
// Strain-body-focused WAC 314-55-155 compliance gate (Ship 2.7c / Strain
// Tree arc). Complements `check-efficacy-claims.mjs` (verbs) and
// `check-wac-314-55-155-banned-claims.mjs` (noun phrases) by covering
// 3 NEW categories specific to strain-page hand-curated prose:
//
//   1. Wellness-brand markers — elevate/elevating/journey/wellness moment/
//      intentional sesh/mindful/holistic
//   2. Effect-on-you constructions — makes you (high/stoned/sleepy/relaxed/
//      focused) · gets you (high/stoned)
//   3. Therapeutic-dosing phrases — mg recommendation / how much to take /
//      recommended dosage / recommended dose / therapeutic dose / right dose
//      for / dose for <condition>
//
// DOCTRINE: WSLCB strain-page visible HTML body is the highest-amplification
// surface. `lib/strains.ts` exports 229+ strains × ~6 prose fields each. A
// future copy edit adding "helps with sleep" to bestFor (or "elevate your
// journey" to intro) silently ships a 314-55-155 violation past the
// JSON-LD `scrubWslcbClaims` scrubber — which only guards the structured
// data, not the visible HTML body. This gate is the visible-HTML defense.
//
// Run:
//   node --test --experimental-strip-types --no-warnings \
//     lib/__tests__/check-strain-body-claims.test.ts

import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const REPO_ROOT = dirname(dirname(dirname(__filename))); // lib/__tests__/file.ts → repo
const GATE_PATH = join(REPO_ROOT, "scripts/check-strain-body-claims.mjs");
const GATE_SRC = readFileSync(GATE_PATH, "utf8");

// Helper: run the gate against a synthetic lib/strains.ts in a temp cwd.
// The gate reads from `process.cwd() + "/lib/strains.ts"` so we mkdir
// the lib/ subdir, write the synthetic corpus, then exec from temp cwd.
// Uses spawnSync (not execFileSync) so we capture BOTH stdout + stderr
// regardless of exit code.
function runGateAgainst(corpus: string, args: string[] = []): { code: number; stdout: string; stderr: string } {
  const dir = mkdtempSync(join(tmpdir(), "check-strain-body-"));
  try {
    mkdirSync(join(dir, "lib"));
    writeFileSync(join(dir, "lib/strains.ts"), corpus, "utf8");
    const result = spawnSync("node", [GATE_PATH, ...args], { cwd: dir, encoding: "utf8" });
    return {
      code: result.status ?? 1,
      stdout: result.stdout ?? "",
      stderr: result.stderr ?? "",
    };
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

// ─── DOCTRINE PINS ────────────────────────────────────────────────────────

test("check-strain-body-claims — WAC 314-55-155 doctrine anchor preserved", () => {
  assert.match(GATE_SRC, /WAC\s+314-55-155/, "WAC 314-55-155 reference must persist");
});

test("check-strain-body-claims — sister-gate references preserved (not duplicative)", () => {
  // This gate must continue to disclaim itself as a complement to the two
  // broad gates so a future cleanup doesn't accidentally merge them.
  assert.match(GATE_SRC, /check-efficacy-claims\.mjs/, "sister verb-gate referenced");
  assert.match(
    GATE_SRC,
    /check-wac-314-55-155-banned-claims\.mjs/,
    "sister noun-phrase gate referenced",
  );
});

test("check-strain-body-claims — strain-body-only scope (lib/strains.ts) pinned", () => {
  // The gate is intentionally narrower than the broad gates — scans
  // ONLY `lib/strains.ts`. Drift into broader scan = duplication of
  // the broad gates' work.
  assert.match(
    GATE_SRC,
    /STRAINS_PATH\s*=\s*join\(ROOT,\s*["']lib\/strains\.ts["']\)/,
    "STRAINS_PATH binding pinned",
  );
});

// ─── REGEX-BANK PINS ──────────────────────────────────────────────────────

test("check-strain-body-claims — wellness-marker patterns pinned", () => {
  for (const word of [
    "elevate",
    "elevating",
    "journey",
    "wellness\\s+moment",
    "intentional\\s+sesh",
    "mindful",
    "holistic",
  ]) {
    assert.ok(
      GATE_SRC.includes(word),
      `wellness-marker pattern '${word}' must be in the regex bank`,
    );
  }
});

test("check-strain-body-claims — effect-on-you constructions pinned", () => {
  // "makes you X" and "gets you X" — both shapes are direct causation
  // claims per WAC doctrine.
  assert.match(
    GATE_SRC,
    /makes\\s\+you\\s\+\(\?:high\|stoned\|sleepy\|relaxed\|focused\)/,
    "'makes you (high/stoned/sleepy/relaxed/focused)' pinned",
  );
  assert.match(
    GATE_SRC,
    /gets\\s\+you\\s\+\(\?:high\|stoned\)/,
    "'gets you (high/stoned)' pinned",
  );
});

test("check-strain-body-claims — therapeutic-dosing phrases pinned (NOT bare 'dose')", () => {
  // The narrow-form dosing patterns. Bare `dose`/`dosing` is INTENTIONALLY
  // not in the regex bank — those produce ~150 false-positives on
  // responsible-consumption customer guidance like "start with a small dose".
  // The bare-dose absence is the load-bearing design decision.
  assert.match(GATE_SRC, /mg\\s\+recommendation/, "'mg recommendation' pinned");
  assert.match(GATE_SRC, /how\\s\+much\\s\+to\\s\+take/, "'how much to take' pinned");
  assert.match(GATE_SRC, /recommended\\s\+dosage/, "'recommended dosage' pinned");
  assert.match(GATE_SRC, /recommended\\s\+dose/, "'recommended dose' pinned");
  assert.match(GATE_SRC, /therapeutic\\s\+dose/, "'therapeutic dose' pinned");
  assert.match(GATE_SRC, /right\\s\+dose\\s\+for/, "'right dose for X' pinned");
  assert.match(
    GATE_SRC,
    /dose\\s\+for\\s\+\(\?:anxiety\|pain\|sleep/,
    "'dose for <condition>' pinned",
  );

  // Anti-pin: bare `dose`/`dosing` MUST NOT appear as a standalone
  // word-boundary regex pattern. They are intentionally absent.
  assert.ok(
    !/rx:\s*\/\\bdose\\b\/gi/.test(GATE_SRC),
    "bare /\\bdose\\b/ pattern must NOT be in the regex bank (responsible-consumption guidance false-positive)",
  );
  assert.ok(
    !/rx:\s*\/\\bdosing\\b\/gi/.test(GATE_SRC),
    "bare /\\bdosing\\b/ pattern must NOT be in the regex bank",
  );
});

// ─── BEHAVIORAL PINS (run the gate against synthetic corpora) ────────────

test("check-strain-body-claims — exits 0 on clean corpus", () => {
  const corpus = `
export const STRAINS = {
  "blue-dream": {
    name: "Blue Dream",
    intro: "A balanced hybrid customers reach for in the afternoon.",
    bestFor: ["Daytime use", "Creative work"],
    faqs: [{ q: "Is it strong?", a: "Tests in the 17–24% THC range." }],
  },
};
`;
  const { code, stdout } = runGateAgainst(corpus);
  assert.equal(code, 0, "clean corpus must exit 0");
  assert.match(stdout, /0 banned-phrase hits/, "clean corpus must report 0 hits");
});

test("check-strain-body-claims — flags wellness-marker 'elevate your journey'", () => {
  const corpus = `
export const STRAINS = {
  "test-strain": {
    name: "Test",
    intro: "Elevate your journey with this strain.",
    bestFor: ["Evening"],
  },
};
`;
  const { code, stderr } = runGateAgainst(corpus);
  assert.equal(code, 1, "wellness-marker corpus must fail");
  assert.match(stderr, /wellness-brand marker/, "must surface wellness-brand marker rule");
});

test("check-strain-body-claims — flags effect-on-you 'makes you sleepy'", () => {
  const corpus = `
export const STRAINS = {
  "test-strain": {
    name: "Test",
    intro: "This strain makes you sleepy after a long day.",
    bestFor: ["Evening"],
  },
};
`;
  const { code, stderr } = runGateAgainst(corpus);
  assert.equal(code, 1, "effect-on-you corpus must fail");
  assert.match(stderr, /effect-on-you construction/, "must surface effect-on-you rule");
});

test("check-strain-body-claims — flags therapeutic-dosing 'recommended dose for sleep'", () => {
  const corpus = `
export const STRAINS = {
  "test-strain": {
    name: "Test",
    intro: "What's the recommended dose for sleep?",
    bestFor: ["Evening"],
  },
};
`;
  const { code, stderr } = runGateAgainst(corpus);
  assert.equal(code, 1, "therapeutic-dosing corpus must fail");
  assert.match(
    stderr,
    /therapeutic-dosing phrase/,
    "must surface therapeutic-dosing rule",
  );
});

// ─── FALSE-POSITIVE CORPUS PINS (gate must NOT flag these) ───────────────

test("check-strain-body-claims — does NOT flag 'start with a small dose' (responsible-consumption)", () => {
  // The 154-occurrence corpus pattern that bare `dose` would mis-flag.
  // Customer-helpful consumption-amount guidance, not therapeutic-dosing.
  const corpus = `
export const STRAINS = {
  "test-strain": {
    name: "Test",
    faqs: [{ q: "How much?", a: "Start with a small dose. Half-dose or less if low tolerance." }],
  },
};
`;
  const { code, stdout } = runGateAgainst(corpus);
  assert.equal(code, 0, "'start with a small dose' must NOT trigger");
  assert.match(stdout, /0 banned-phrase hits/);
});

test("check-strain-body-claims — does NOT flag 'cure date' (cannabis curing process)", () => {
  // Curing flower is legit operator vocabulary, not a medical-cure claim.
  const corpus = `
export const STRAINS = {
  "test-strain": {
    name: "Test",
    intro: "Pay attention to the cure date on the jar — fresher is usually better.",
  },
};
`;
  const { code, stdout } = runGateAgainst(corpus);
  assert.equal(code, 0, "'cure date' must NOT trigger");
  assert.match(stdout, /0 banned-phrase hits/);
});

test("check-strain-body-claims — does NOT flag 'energy-saving' or incidental 'energy'", () => {
  // Incidental energy words in non-effect context.
  const corpus = `
export const STRAINS = {
  "test-strain": {
    name: "Test",
    intro: "The grow room uses energy-saving LED lights.",
  },
};
`;
  const { code, stdout } = runGateAgainst(corpus);
  assert.equal(code, 0, "incidental 'energy' must NOT trigger");
  assert.match(stdout, /0 banned-phrase hits/);
});

test("check-strain-body-claims — does NOT flag 'relaxed family tree' (adjective on noun)", () => {
  // Wedding Cake's relaxed family tree — "relaxed" used as adjective on a
  // metaphorical noun-phrase, not as an effect claim. The bare-effect-
  // adjective layer is in `check-efficacy-claims.mjs`, NOT here.
  const corpus = `
export const STRAINS = {
  "wedding-cake": {
    name: "Wedding Cake",
    intro: "From a relaxed family tree of West Coast hybrids.",
  },
};
`;
  const { code, stdout } = runGateAgainst(corpus);
  assert.equal(code, 0, "'relaxed family tree' must NOT trigger (out of scope for this gate)");
  assert.match(stdout, /0 banned-phrase hits/);
});

test("check-strain-body-claims — skips comments via stripComments()", () => {
  // Block + line comments are stripped before scanning so doctrine
  // comments quoting banned phrases don't self-trip the gate.
  const corpus = `
// "elevate your journey" — DO NOT add this to any strain
/* Future writers: never write "makes you sleepy" — WAC 314-55-155 violation */
export const STRAINS = {
  "test-strain": {
    name: "Test",
    intro: "A balanced hybrid.",
  },
};
`;
  const { code, stdout } = runGateAgainst(corpus);
  assert.equal(code, 0, "comments quoting banned phrases must NOT trigger");
  assert.match(stdout, /0 banned-phrase hits/);
});

// ─── --warn FLAG + STRAIN_NAME_EXEMPTIONS PINS ───────────────────────────

test("check-strain-body-claims — --warn flag exits 0 even on hits", () => {
  const corpus = `
export const STRAINS = {
  "test-strain": {
    name: "Test",
    intro: "Elevate your journey.",
  },
};
`;
  const { code, stderr } = runGateAgainst(corpus, ["--warn"]);
  assert.equal(code, 0, "--warn flag must exit 0 even with hits");
  assert.match(stderr, /check-strain-body-claims \(warn\)/, "must show warn-mode header");
});

test("check-strain-body-claims — STRAIN_NAME_EXEMPTIONS array present + extension recipe documented", () => {
  // Empty today (no current strain has a watch-list word in its name),
  // but the array must exist for future extension. The doctrine comment
  // explains when to add an entry.
  assert.match(
    GATE_SRC,
    /const\s+STRAIN_NAME_EXEMPTIONS\s*=\s*\[/,
    "STRAIN_NAME_EXEMPTIONS array binding present",
  );
  assert.match(
    GATE_SRC,
    /Mindful\s+Mango|Healing\s+Touch/,
    "doctrine comment shows extension recipe with an example strain name",
  );
});

test("check-strain-body-claims — strict by default, --warn opt-in", () => {
  assert.match(
    GATE_SRC,
    /WARN_ONLY\s*=\s*process\.argv\.includes\(["']--warn["']\)/,
    "--warn flag binding pinned",
  );
  assert.match(
    GATE_SRC,
    /process\.exit\(WARN_ONLY \? 0 : 1\)/,
    "default-strict exit policy pinned",
  );
});

// ─── REAL-CORPUS PIN — the live lib/strains.ts must stay clean ───────────

test("check-strain-body-claims — the actual repo's lib/strains.ts passes strict", () => {
  // Functional pin — the live strain corpus stays clean. If a future copy
  // edit introduces a banned phrase, this test surfaces it BEFORE pre-push.
  const result = spawnSync("node", [GATE_PATH], { cwd: REPO_ROOT, encoding: "utf8" });
  assert.equal(result.status, 0, `live lib/strains.ts has banned-phrase hits:\n${result.stderr ?? ""}`);
  assert.match(result.stdout ?? "", /0 banned-phrase hits/, "live corpus must report 0 hits");
});
