// Pin tests for lib/wrapped.ts (C1 — Year-in-Strains annual recap data
// layer) via fs.readFileSync source-assertion (server-only barrier).
//
// Pin focus:
//   1. WrappedRecap + WrappedTopStrain type contracts (table-row
//      shape — drift = real-data swap-in fails when Phase 4.2 ships)
//   2. format*Brag functions — literal output patterns + WAC-safe
//      vocabulary (catches customer-facing copy drift)
//   3. CURRENT_WRAPPED_YEAR pinned at 2026 (drift = landing-page
//      defaults to wrong year's recap)
//   4. isWrappedEnabled === "true" gate (off-by-default)
//   5. getWrappedRecap preview-mode delegation (real-data path
//      is a 1-line swap when Phase 1 lands)
//   6. WAC 314-55-155 vocabulary rules in header
//
// Run: pnpm test:all

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(HERE, "..", "wrapped.ts");
const SRC = readFileSync(SOURCE_PATH, "utf-8");

// ── Server-only barrier ─────────────────────────────────────────────

describe("wrapped.ts — server-only barrier", () => {
  test("imports `server-only`", () => {
    assert.match(SRC, /^import "server-only";/m);
  });
});

// ── WrappedTopStrain + WrappedRecap type contracts ─────────────────

describe("wrapped.ts — WrappedRecap row-shape contract", () => {
  test("WrappedTopStrain has slug + name + visits + familySlug + familyName", () => {
    // These fields back the `customer_year_recaps.top_strain_slugs` JSONB
    // column. Drift here = real-data row deserialization fails.
    assert.match(SRC, /^export type WrappedTopStrain\s*=\s*\{/m);
    assert.match(SRC, /slug:\s*string;/);
    assert.match(SRC, /name:\s*string;/);
    assert.match(SRC, /visits:\s*number;/);
    assert.match(SRC, /familySlug:\s*string \| null;/);
    assert.match(SRC, /familyName:\s*string \| null;/);
  });

  test("WrappedRecap declares all 12+ documented fields (table-row shape)", () => {
    // Each field maps to a customer_year_recaps column. Pin so a
    // future agent adding/removing fields without doctrine review
    // gets caught.
    const required = [
      /customerId:\s*string;/,
      /customerName:\s*string;/,
      /year:\s*number;/,
      /topStrains:\s*WrappedTopStrain\[\];/,
      /topFamilySlug:\s*string \| null;/,
      /topFamilyName:\s*string \| null;/,
      /totalPurchases:\s*number;/,
      /totalStrainsTried:\s*number;/,
      /heroBlurb:\s*string;/,
      /generatedAt:\s*string;/,
      /optInPublic:\s*boolean;/,
    ];
    for (const re of required) {
      assert.match(SRC, re, `WrappedRecap missing required field: ${re}`);
    }
  });

  test("dominantTerpene sub-shape has slug + label + note (nullable parent)", () => {
    // Used by the radar/family card overlay. Drift would either lose
    // the terpene readout OR change its serialized shape.
    assert.match(SRC, /dominantTerpene:\s*\{[\s\S]{0,200}slug:\s*string;[\s\S]{0,100}label:\s*string;[\s\S]{0,100}note:\s*string;[\s\S]{0,80}\} \| null;/);
  });

  test("topFamilyCoverage sub-shape has explored + total (nullable parent)", () => {
    assert.match(
      SRC,
      /topFamilyCoverage:\s*\{\s*explored:\s*number;\s*total:\s*number\s*\} \| null;/,
    );
  });

  test("loyaltyPick sub-shape has strainSlug + strainName + visits + headline (nullable parent)", () => {
    assert.match(SRC, /loyaltyPick:\s*\{[\s\S]{0,300}strainSlug:\s*string;/);
    assert.match(SRC, /loyaltyPick:\s*\{[\s\S]{0,300}strainName:\s*string;/);
    assert.match(SRC, /loyaltyPick:\s*\{[\s\S]{0,300}visits:\s*number;/);
    assert.match(SRC, /loyaltyPick:\s*\{[\s\S]{0,300}headline:\s*string;/);
  });
});

// ── Format functions — output pattern invariants ───────────────────

describe("wrapped.ts — formatVarietyBrag", () => {
  test("when varietyRank set: '<N> strains — <description>' (toLowerCase'd description)", () => {
    // Pinning the literal output shape catches drift in customer-facing
    // copy. The toLowerCase() on description is intentional — keeps the
    // single-string fluent (e.g. "more than 80% of regulars" not
    // "More than 80% of regulars").
    assert.match(SRC, /return\s*`\$\{recap\.totalStrainsTried\} strains — \$\{recap\.varietyRank\.description\.toLowerCase\(\)\}`;/);
  });

  test("fallback (no varietyRank): '<N> strains explored this year'", () => {
    assert.match(SRC, /return\s*`\$\{recap\.totalStrainsTried\} strains explored this year`;/);
  });
});

describe("wrapped.ts — formatFamilyBrag", () => {
  test("no topFamilyName fallback: 'A wide-ranging shelf year' (WAC-safe descriptive)", () => {
    // The fallback string must stay descriptive (process-vocabulary),
    // not slip into effect claim ("a relaxed year" → therapeutic).
    assert.match(SRC, /return "A wide-ranging shelf year";/);
  });

  test("with coverage: 'Top family: <name> — <explored> of <total> on our shelf'", () => {
    assert.match(SRC, /return\s*`Top family: \$\{recap\.topFamilyName\} — \$\{coverage\.explored\} of \$\{coverage\.total\} on our shelf`;/);
  });

  test("without coverage: 'Top family: <name>' (no count)", () => {
    assert.match(SRC, /return\s*`Top family: \$\{recap\.topFamilyName\}`;/);
  });
});

describe("wrapped.ts — formatTerpeneBrag", () => {
  test("no terpene fallback: 'An aroma year all your own' (aroma vocabulary)", () => {
    // "aroma" stays WAC-safe — it's process language, not effect.
    // Drift to "An effect year all your own" or "A vibe year" would
    // either slip into efficacy claim OR slip into casual non-brand voice.
    assert.match(SRC, /return "An aroma year all your own";/);
  });

  test("with terpene: '<label> · <note>'", () => {
    assert.match(SRC, /return\s*`\$\{recap\.dominantTerpene\.label\} · \$\{recap\.dominantTerpene\.note\}`;/);
  });
});

describe("wrapped.ts — formatLoyaltyBrag", () => {
  test("no loyaltyPick fallback: 'The shelf you kept widening' (descriptive)", () => {
    // Fallback stays descriptive — no effect-claim drift.
    assert.match(SRC, /return "The shelf you kept widening";/);
  });

  test("with pick: '<headline>: <strainName>'", () => {
    assert.match(SRC, /return\s*`\$\{recap\.loyaltyPick\.headline\}: \$\{recap\.loyaltyPick\.strainName\}`;/);
  });
});

describe("wrapped.ts — formatTopStrainsHeadline", () => {
  test("slices to top 3 (Math.min via slice(0, 3))", () => {
    // The card lays out 3 across; more than 3 would either overflow OR
    // get silently truncated. Pin the slice.
    assert.match(SRC, /recap\.topStrains\.slice\(0, 3\)/);
  });

  test("0 strains → 'Your year on the shelf' (fallback heading)", () => {
    assert.match(SRC, /return "Your year on the shelf";/);
  });

  test("1 strain → 'Your top strain: <name>' (singular)", () => {
    assert.match(SRC, /return\s*`Your top strain: \$\{names\[0\]\}`;/);
  });

  test("2 strains → 'Top strains: <a> · <b>' (middle-dot separator)", () => {
    assert.match(SRC, /return\s*`Top strains: \$\{names\[0\]\} · \$\{names\[1\]\}`;/);
  });

  test("3 strains → 'Top strains: <a> · <b> · <c>'", () => {
    assert.match(SRC, /return\s*`Top strains: \$\{names\[0\]\} · \$\{names\[1\]\} · \$\{names\[2\]\}`;/);
  });
});

// ── isWrappedEnabled feature-flag gate ─────────────────────────────

describe("wrapped.ts — isWrappedEnabled feature-flag gate", () => {
  test("checks WRAPPED_ENABLED === 'true' (off-by-default)", () => {
    // Default-off — drift to `!== "false"` would invert the default
    // (recap renders unsolicited for every signup).
    assert.match(SRC, /process\.env\.WRAPPED_ENABLED === "true"/);
  });
});

// ── CURRENT_WRAPPED_YEAR constant ──────────────────────────────────

describe("wrapped.ts — CURRENT_WRAPPED_YEAR landing-page default", () => {
  test("CURRENT_WRAPPED_YEAR = 2026 (current production year)", () => {
    // When 2027's recap ships, this constant gets bumped or read from
    // env. Drift to 2025 or 2027 prematurely would fetch wrong year's
    // recap as the landing-page default.
    assert.match(SRC, /^export const CURRENT_WRAPPED_YEAR\s*=\s*2026;/m);
  });

  test("comment names the bump-vs-env-read decision for future year transitions", () => {
    // Anchors future operator decision: when 2026 ends, bump constant
    // OR refactor to env-read. Pin the comment so the decision-tree
    // doesn't rot.
    // Source uses lowercase "when" (mid-sentence). Match case-insensitively.
    assert.match(SRC, /when 2027's recap ships, bump this constant or read from env/i);
  });
});

// ── getWrappedRecap preview-mode delegation ───────────────────────

describe("wrapped.ts — getWrappedRecap preview-mode delegation", () => {
  test("preview:true → delegates to getMockRecapForName(displayName)", () => {
    // Phase 1 mock-mode: preview ALWAYS returns the mock fixture.
    // Drift would either skip the mock (preview shows null) OR ignore
    // displayName (mock shows wrong name).
    assert.match(SRC, /if \(opts\.preview\) \{[\s\S]{0,80}return getMockRecapForName\(opts\.displayName\);/);
  });

  test("preview:false → returns null (Phase 1 — real-data path not yet wired)", () => {
    // The 1-line swap is documented at the Phase 4.2 swap-in marker.
    // Until then, non-preview returns null. Pin against accidental
    // early-wire that would query a not-yet-existing table.
    assert.match(SRC, /Phase 4\.2 real-data swap goes here/);
    // The function must still return null when preview is off.
    assert.match(SRC, /return null;\s*\}\s*$/m);
  });

  test("documents real-data table name `customer_year_recaps` (Phase 4.2 anchor)", () => {
    // When Phase 4.2 lands, the SELECT goes against this table.
    // The comment is the contract — anchor for the migration spec.
    assert.match(SRC, /customer_year_recaps/);
  });
});

// ── getPreviewRecap convenience export ─────────────────────────────

describe("wrapped.ts — getPreviewRecap (sync convenience)", () => {
  test("exports getPreviewRecap(displayName?) returning WrappedRecap", () => {
    // Sync helper used by share-card preview routes — async-only entry
    // would force every consumer to await unnecessarily.
    assert.match(SRC, /^export function getPreviewRecap\(displayName\?:\s*string \| null\):\s*WrappedRecap/m);
  });

  test("delegates to getMockRecapForName (single source of mock data)", () => {
    assert.match(SRC, /return getMockRecapForName\(displayName\);/);
  });
});

// ── WAC 314-55-155 doctrine ────────────────────────────────────────

describe("wrapped.ts — WAC 314-55-155 vocabulary rules", () => {
  test("header forbids: NO efficacy + NO volume bragging + NO medical + NO competitor references", () => {
    // The 4-part WAC defense list is the per-stat-string compliance
    // guard. Drift here = customer-facing recap card could slip into
    // any of the 4 banned categories. Pin all 4 literally.
    assert.match(SRC, /NO efficacy/);
    assert.match(SRC, /NO volume bragging/);
    assert.match(SRC, /NO medical/);
    assert.match(SRC, /NO competitor/);
  });

  test("header references formatVarietyBrag as the canonical-safe-phrasing exemplar", () => {
    // "See formatVarietyBrag() for the canonical safe phrasing." The
    // exemplar reference helps future agents understand what "WAC-safe"
    // looks like in practice.
    // Source wraps the function name in backticks: `formatVarietyBrag()`
    // Use [`]? to tolerate either form.
    assert.match(SRC, /formatVarietyBrag\(\)[`]?\s+for the canonical safe phrasing/);
  });

  test("header references C1 of strain-tree innovation plan", () => {
    assert.match(SRC, /C1/);
    assert.match(SRC, /PLAN_STRAIN_TREE_INNOVATION_2026_05_21\.md/);
  });

  test("header centralizes format-helper convention (drift defense for new stat strings)", () => {
    // "New stat strings MUST go through here, not be inlined at the
    // call site." Without this rule, customer-facing copy drift would
    // be uncontrolled.
    // Source wraps the sentence across 2 lines: "...not be\n// inlined at the call site."
    // Use [\s\S]{1,40} to tolerate the newline + comment-continuation.
    assert.match(SRC, /New stat strings MUST go through here, not be[\s\S]{1,40}inlined at the call site/);
  });
});
