// Pin tests for lib/ambassador-briefs.ts — Ambassador Program v0.1
// content brief library. Library is byte-identical between GLW + SCC
// (lockstep file per file header); these tests run on both stacks.
//
// Coverage:
//   1. registry shape (5 briefs, no duplicates)
//   2. per-brief field invariants (required fields populated)
//   3. compliance vocabulary (WAC 314-55-155 + privacy posture)
//   4. targetSeconds bounds (10–90)
//   5. title length (≤60 char)
//   6. id-format invariants (kebab-case)
//   7. getBrief contract
//   8. BRIEF_IDS derivation sync
//   9. lockstep-file invariant (header comment present)
//
// fs-based source assertions for invariants the linter/typecheck won't
// catch (compliance ban-list, "outside" repetition, etc.) so the file
// header doctrine rules stay load-bearing on every push.

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  BRIEF_LIBRARY,
  BRIEF_IDS,
  getBrief,
  type Brief,
} from "../ambassador-briefs.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(join(__dirname, "..", "ambassador-briefs.ts"), "utf8");

// ── 1. registry shape ──────────────────────────────────────────────────

test("registry has exactly the 5 Phase-1 briefs (PLAN §10 default)", () => {
  assert.equal(BRIEF_LIBRARY.length, 5);
});

test("every brief id is unique (no duplicate keys)", () => {
  const seen = new Set<string>();
  for (const b of BRIEF_LIBRARY) {
    assert.equal(seen.has(b.id), false, `duplicate brief id: ${b.id}`);
    seen.add(b.id);
  }
});

test("registry contains the 5 expected ids (PLAN §3 A/B/C/E/I subset)", () => {
  const ids = BRIEF_LIBRARY.map((b) => b.id).sort();
  assert.deepEqual(ids, [
    "budtender-shoutout",
    "outfit-vibe",
    "strain-cheers",
    "walking-out-happy",
    "whats-in-bag",
  ]);
});

// ── 2. per-brief field invariants ──────────────────────────────────────

test("every brief has non-empty id + title + prompt", () => {
  for (const b of BRIEF_LIBRARY) {
    assert.equal(typeof b.id, "string");
    assert.ok(b.id.length > 0, `brief missing id`);
    assert.equal(typeof b.title, "string");
    assert.ok(b.title.length > 0, `brief ${b.id} missing title`);
    assert.equal(typeof b.prompt, "string");
    assert.ok(b.prompt.length > 0, `brief ${b.id} missing prompt`);
  }
});

test("every brief targetSeconds is a positive number", () => {
  for (const b of BRIEF_LIBRARY) {
    assert.equal(typeof b.targetSeconds, "number");
    assert.ok(b.targetSeconds > 0, `brief ${b.id} targetSeconds not positive`);
    assert.ok(Number.isFinite(b.targetSeconds));
  }
});

test("every brief has at least one complianceTips entry", () => {
  for (const b of BRIEF_LIBRARY) {
    assert.ok(Array.isArray(b.complianceTips));
    assert.ok(
      b.complianceTips.length >= 1,
      `brief ${b.id} has empty complianceTips`,
    );
    for (const tip of b.complianceTips) {
      assert.equal(typeof tip, "string");
      assert.ok(tip.length > 0, `brief ${b.id} empty tip`);
    }
  }
});

// ── 3. compliance vocabulary ────────────────────────────────────────────

test("complianceTips per brief never contain banned-WAC vocabulary", () => {
  // Mirrors scripts/check-efficacy-claims.mjs condition-anchored regex
  // subset — anything that would trip the build gate must trip this
  // test FIRST so the dev catches it before pushing.
  const BANNED = [
    /\btreats?\s+(?:anxiety|insomnia|pain|depression|nausea|inflammation)/i,
    /\bhelps?\s+with\s+(?:anxiety|insomnia|sleep|pain|depression|nausea)/i,
    /\brelieves?\s+(?:anxiety|insomnia|pain|stress|nausea|inflammation)/i,
    /\bgood\s+for\s+(?:anxiety|insomnia|sleep|pain|depression|nausea|stress)/i,
    /\banti[\s-]?anxiety\b/i,
    /\banxiolytic\b/i,
    /\banalgesic\b/i,
    /\bsedative\b/i,
    /\bsedating\b/i,
  ];
  for (const b of BRIEF_LIBRARY) {
    for (const tip of b.complianceTips) {
      for (const rx of BANNED) {
        assert.equal(
          rx.test(tip),
          false,
          `brief ${b.id} tip "${tip}" matches banned WAC vocabulary ${rx}`,
        );
      }
    }
    for (const rx of BANNED) {
      assert.equal(rx.test(b.prompt), false, `brief ${b.id} prompt trips ${rx}`);
      assert.equal(rx.test(b.title), false, `brief ${b.id} title trips ${rx}`);
    }
  }
});

test("every brief surfaces the OUTSIDE-the-store recording rule", () => {
  // §4 + §5 — recording happens outside the store. Every brief carries
  // this in its complianceTips so the customer self-screens before
  // recording. Wording must contain the word "outside" in at least one
  // tip (case-insensitive).
  for (const b of BRIEF_LIBRARY) {
    const joined = b.complianceTips.join("\n").toLowerCase();
    assert.ok(
      joined.includes("outside"),
      `brief ${b.id} complianceTips never mentions OUTSIDE the store`,
    );
  }
});

test("every brief surfaces the 21+ / first-names-only privacy posture", () => {
  for (const b of BRIEF_LIBRARY) {
    const joined = b.complianceTips.join("\n").toLowerCase();
    assert.ok(joined.includes("21+"), `brief ${b.id} missing 21+ tip`);
    assert.ok(
      joined.includes("first name"),
      `brief ${b.id} missing first-name-only tip`,
    );
  }
});

test("every brief carries the no-consumption-on-camera tip", () => {
  for (const b of BRIEF_LIBRARY) {
    const joined = b.complianceTips.join("\n").toLowerCase();
    assert.ok(
      joined.includes("smoking") || joined.includes("consumption"),
      `brief ${b.id} missing no-consumption tip`,
    );
  }
});

// ── 4. targetSeconds bounds ────────────────────────────────────────────

test("targetSeconds in [10, 90] for every brief (PLAN §3 range)", () => {
  for (const b of BRIEF_LIBRARY) {
    assert.ok(
      b.targetSeconds >= 10 && b.targetSeconds <= 90,
      `brief ${b.id} targetSeconds=${b.targetSeconds} out of [10,90] range`,
    );
  }
});

test("targetSeconds matches PLAN §3 spec values", () => {
  // Exact pinning — drift here breaks the customer-facing "Target N sec"
  // chip on the brief card. PLAN doc is the SoT.
  const expected: Record<string, number> = {
    "strain-cheers": 15,
    "budtender-shoutout": 30,
    "whats-in-bag": 45,
    "outfit-vibe": 20,
    "walking-out-happy": 30,
  };
  for (const b of BRIEF_LIBRARY) {
    assert.equal(b.targetSeconds, expected[b.id], `brief ${b.id} targetSeconds drift`);
  }
});

// ── 5. title length ────────────────────────────────────────────────────

test("every brief title is ≤60 chars (card-layout invariant)", () => {
  for (const b of BRIEF_LIBRARY) {
    assert.ok(
      b.title.length <= 60,
      `brief ${b.id} title len=${b.title.length}: "${b.title}"`,
    );
  }
});

// ── 6. id-format invariants ────────────────────────────────────────────

test("every brief id is kebab-case lowercase alphanumeric", () => {
  const ID_RE = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;
  for (const b of BRIEF_LIBRARY) {
    assert.ok(ID_RE.test(b.id), `brief id "${b.id}" not kebab-case`);
  }
});

// ── 7. getBrief contract ───────────────────────────────────────────────

test("getBrief returns the matching brief for known id", () => {
  const b: Brief | undefined = getBrief("strain-cheers");
  assert.ok(b, "getBrief returned undefined for known id");
  assert.equal(b!.id, "strain-cheers");
});

test("getBrief returns undefined for unknown id", () => {
  assert.equal(getBrief("not-a-real-brief"), undefined);
});

test("getBrief returns undefined for empty string", () => {
  assert.equal(getBrief(""), undefined);
});

test("getBrief is case-sensitive (kebab-case strict)", () => {
  // "Strain-Cheers" must NOT match "strain-cheers" — the upload route's
  // brief-id allowlist is case-sensitive against the DB foreign key.
  assert.equal(getBrief("Strain-Cheers"), undefined);
  assert.equal(getBrief("STRAIN-CHEERS"), undefined);
});

// ── 8. BRIEF_IDS derivation sync ───────────────────────────────────────

test("BRIEF_IDS mirrors BRIEF_LIBRARY ids (count + contents)", () => {
  assert.equal(BRIEF_IDS.length, BRIEF_LIBRARY.length);
  for (const b of BRIEF_LIBRARY) {
    assert.ok(BRIEF_IDS.includes(b.id), `BRIEF_IDS missing ${b.id}`);
  }
});

// ── 9. lockstep-file invariant ─────────────────────────────────────────

test("file header declares the byte-identical lockstep invariant", () => {
  assert.ok(
    SRC.includes("byte-identical"),
    "file header missing byte-identical invariant — see file comment",
  );
  assert.ok(
    SRC.includes("greenlife-web"),
    "file header missing greenlife-web lockstep mention",
  );
  assert.ok(
    SRC.includes("seattle-cannabis-web"),
    "file header missing seattle-cannabis-web lockstep mention",
  );
});

test("source file imports STORE so per-stack STORE.name substitutes", () => {
  // The budtender + walking-out-happy briefs use STORE.name in their
  // prompt strings. If the import is removed or renamed, those briefs
  // would render "${STORE.name}" literal text to customers.
  assert.ok(
    /from\s+["']\.\/store(?:\.ts)?["']/.test(SRC),
    "ambassador-briefs.ts must import STORE from ./store",
  );
});

test("at least one brief prompt uses STORE.name template substitution", () => {
  // Pinning the substitution shape — if a future refactor inlines a
  // store-specific string, that brief diverges between GLW + SCC.
  let found = false;
  for (const b of BRIEF_LIBRARY) {
    // The template-literal substitution produces concrete text at
    // import time. We can detect substitution by checking the prompt
    // contains a store-name-ish suffix (Cannabis / Cannabis Co.).
    if (/Cannabis/i.test(b.prompt)) {
      found = true;
      break;
    }
  }
  assert.ok(found, "no brief uses STORE.name in its prompt");
});

// ── 10. compliance-tip ban-list sanity ─────────────────────────────────

test("complianceTips never mention specific dosing or potency", () => {
  // PLAN §4 — "No specific dosing or potency claims" — these will trip
  // both efficacy-claims and operator-eyes. Keep them out of customer
  // self-screening copy.
  const DOSAGE = [/\b\d+\s*mg\b/i, /\b\d+\s*percent\b/i, /\b\d+%\s*THC\b/i];
  for (const b of BRIEF_LIBRARY) {
    for (const tip of b.complianceTips) {
      for (const rx of DOSAGE) {
        assert.equal(
          rx.test(tip),
          false,
          `brief ${b.id} tip "${tip}" mentions dosage`,
        );
      }
    }
  }
});

test("type Brief shape: required fields exported correctly", () => {
  // Compile-time pin — drift to Brief type without updating tests
  // would silently let undefined fields through.
  const b: Brief = {
    id: "test-id",
    title: "Test",
    prompt: "Test prompt.",
    targetSeconds: 15,
    complianceTips: ["test"],
  };
  assert.equal(b.id, "test-id");
});
