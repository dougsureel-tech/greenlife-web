// Pin tests for lib/wrapped-mock-data.ts via fs.readFileSync source-
// assertion (server-only barrier).
//
// Mock fixture for /account/wrapped — served in preview mode + as
// real-data-fetcher-fallback when a customer has no recap row yet.
// Drift here = preview page displays wrong defaults; smoke-test loses
// fidelity.
//
// Pin focus:
//   1. MOCK_WRAPPED_RECAP shape matches WrappedRecap (all required
//      fields present with sensible values)
//   2. year + customerId stay aligned to "demo-customer-<year>" pattern
//   3. WAC-safe vocabulary in copy strings (heroBlurb · loyaltyPick
//      .headline · varietyRank.description) — drift = preview page
//      slips into effect-claim
//   4. getMockRecap + getMockRecapForName function contracts
//
// Run: pnpm test:all

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(HERE, "..", "wrapped-mock-data.ts");
const SRC = readFileSync(SOURCE_PATH, "utf-8");

// ── Server-only barrier + types ────────────────────────────────────

describe("wrapped-mock-data.ts — server-only barrier", () => {
  test("imports `server-only`", () => {
    assert.match(SRC, /^import "server-only";/m);
  });

  test("imports WrappedRecap type from sibling ./wrapped (single source of recap shape)", () => {
    // Drift to inline type def would let the mock-data shape drift
    // independently from the real WrappedRecap contract.
    assert.match(SRC, /^import type \{ WrappedRecap \} from "\.\/wrapped";/m);
  });
});

// ── MOCK_WRAPPED_RECAP value invariants ────────────────────────────

describe("wrapped-mock-data.ts — MOCK_WRAPPED_RECAP value contract", () => {
  test("exports MOCK_WRAPPED_RECAP typed as WrappedRecap", () => {
    assert.match(SRC, /^export const MOCK_WRAPPED_RECAP:\s*WrappedRecap\s*=\s*\{/m);
  });

  test("customerId is 'demo-customer-2026' (year-aligned demo sentinel)", () => {
    // The demo-customer-<year> pattern lets the preview page disambiguate
    // mock from real customer IDs in logs. Drift to a non-year-suffixed
    // string would weaken that disambiguation.
    assert.match(SRC, /customerId:\s*"demo-customer-2026"/);
  });

  test("customerName is 'Friend of the Shop' (warm brand-voice placeholder)", () => {
    // The default name renders when no displayName override is supplied.
    // "Friend of the Shop" is brand-warm. Drift to "Demo User" or
    // "Test Customer" would feel impersonal on the preview.
    assert.match(SRC, /customerName:\s*"Friend of the Shop"/);
  });

  test("year = 2026 (matches CURRENT_WRAPPED_YEAR in wrapped.ts)", () => {
    // Drift would create a mismatch with wrapped.ts CURRENT_WRAPPED_YEAR;
    // the preview page would display year-mismatched data.
    assert.match(SRC, /^\s*year:\s*2026,/m);
  });

  test("topStrains array has at least 3 entries (renders 3-up grid)", () => {
    // The card layout assumes ≥3 entries. The preview surfaces 3-across
    // tiles; fewer would render with empty slots.
    const topStrainsBlock = SRC.match(/topStrains:\s*\[([\s\S]+?)\],/)?.[1] ?? "";
    const entries = (topStrainsBlock.match(/\{/g) ?? []).length;
    assert.ok(entries >= 3, `topStrains has ${entries} entries, expected ≥3`);
  });

  test("includes wedding-cake / blue-dream / gelato (cookies + haze family anchors)", () => {
    // These 3 anchor strains exist on both stacks' shelves + are
    // representative cookies/haze family choices. Drift to obscure
    // strains would make the preview feel artificial.
    assert.match(SRC, /slug:\s*"wedding-cake"/);
    assert.match(SRC, /slug:\s*"blue-dream"/);
    assert.match(SRC, /slug:\s*"gelato"/);
  });

  test("topFamilyName is 'Cookies' + topFamilyCoverage shape valid", () => {
    assert.match(SRC, /topFamilyName:\s*"Cookies"/);
    assert.match(SRC, /topFamilyCoverage:\s*\{\s*explored:\s*\d+,\s*total:\s*\d+\s*\}/);
  });

  test("dominantTerpene = Limonene (Citrus-bright aroma palette — WAC-safe)", () => {
    // The note string MUST stay process-vocabulary ("Citrus-bright
    // aroma palette") — drift to effect-claim ("uplifting") would
    // violate WAC 314-55-155.
    assert.match(SRC, /slug:\s*"limonene"/);
    assert.match(SRC, /label:\s*"Limonene"/);
    assert.match(SRC, /note:\s*"Citrus-bright aroma palette"/);
  });

  test("totalStrainsTried = 23 + totalPurchases = 31 (sensible demo values)", () => {
    assert.match(SRC, /totalPurchases:\s*31/);
    assert.match(SRC, /totalStrainsTried:\s*23/);
  });

  test("optInPublic = false (preview never public-share-eligible by default)", () => {
    // Default-private — preview-mode customers shouldn't accidentally
    // land in any public share-card aggregator.
    assert.match(SRC, /optInPublic:\s*false/);
  });

  test("generatedAt is mid-December 2026 ISO (matches cron-fire window)", () => {
    // The mid-December cron generates real recaps; the mock's
    // generatedAt aligns to that window so the preview page renders
    // a plausible date.
    assert.match(SRC, /generatedAt:\s*"2026-12-15T12:00:00\.000Z"/);
  });
});

// ── WAC-safe copy invariants ───────────────────────────────────────

describe("wrapped-mock-data.ts — WAC-safe copy strings", () => {
  test("loyaltyPick.headline is 'The strain you came back to' (behavior-descriptive, not effect-claim)", () => {
    // Pinning the literal catches drift toward effect-claim copy
    // ("The strain that worked for you" → therapeutic).
    assert.match(SRC, /headline:\s*"The strain you came back to"/);
  });

  test("varietyRank.description is 'More variety than 73% of customers' (descriptive, not bragging)", () => {
    // Drift to "Better taste than 73%" or "More potent year" would
    // either become a competitor-comparison or volume-brag (both WAC-banned).
    assert.match(SRC, /description:\s*"More variety than 73% of customers"/);
  });

  test("heroBlurb stays process-vocabulary (citrus / dessert-family / shelf — NO efficacy)", () => {
    // The hero blurb is the most visible string on the preview card.
    // It MUST stay aroma/family/shelf vocabulary.
    assert.match(SRC, /A year of bright citrus afternoons/);
    assert.match(SRC, /dessert-family evenings/);
    assert.match(SRC, /shelf widened across 23 strains/);
  });

  test("heroBlurb does NOT contain efficacy / medical / volume-brag vocabulary", () => {
    // Defensive: explicit ban on common drift words within the
    // hero blurb specifically. The whole file is allowed to use
    // "WAC 314-55-155" in comments, but the BLURB itself must not
    // include effect-claim language.
    const heroMatch = SRC.match(/heroBlurb:\s*\n?\s*"([^"]+)"/);
    if (heroMatch) {
      const blurb = heroMatch[1].toLowerCase();
      const banned = [
        "treats",
        "cures",
        "heals",
        "relieves",
        "anxiety",
        "pain",
        "insomnia",
        "depression",
        "best-selling",
        "biggest-spending",
      ];
      for (const word of banned) {
        assert.ok(
          !blurb.includes(word),
          `heroBlurb contains banned word "${word}" — drift toward WAC-noncompliant copy`,
        );
      }
    }
  });

  test("WAC 314-55-155 compliance comment is preserved in file header", () => {
    // Header rule: "every dynamic stat string here is reviewed and
    // approved as celebratory + descriptive (variety, exploration,
    // loyalty) — NO efficacy, NO volume bragging, NO medical framing."
    assert.match(SRC, /WAC 314-55-155/);
    assert.match(SRC, /NO efficacy/);
    assert.match(SRC, /NO volume bragging/);
    assert.match(SRC, /NO medical framing/);
  });

  test("header instructs 'Re-read the brand-voice doc + WAC guide before editing copy' (drift gate)", () => {
    // This is the operator-facing tripwire for future copy edits.
    // Drift removes the instruction → casual edits slip past doctrine.
    // Spans 2 lines: "Re-read\n// the brand-voice doc + the WAC guide..."
    assert.match(SRC, /Re-read[\s\S]{1,20}the brand-voice doc \+ the WAC guide before editing copy/);
  });
});

// ── getMockRecap function contract ─────────────────────────────────

describe("wrapped-mock-data.ts — getMockRecap function contract", () => {
  test("exports getMockRecap(): WrappedRecap (no-arg accessor)", () => {
    assert.match(SRC, /^export function getMockRecap\(\):\s*WrappedRecap\s*\{/m);
  });

  test("getMockRecap returns the MOCK_WRAPPED_RECAP constant (single source)", () => {
    assert.match(SRC, /^export function getMockRecap[\s\S]{0,100}return MOCK_WRAPPED_RECAP;/m);
  });
});

// ── getMockRecapForName function contract ──────────────────────────

describe("wrapped-mock-data.ts — getMockRecapForName function contract", () => {
  test("exports getMockRecapForName(displayName?) returning WrappedRecap", () => {
    assert.match(
      SRC,
      /^export function getMockRecapForName\(displayName:\s*string \| null \| undefined\):\s*WrappedRecap\s*\{/m,
    );
  });

  test("null/undefined/empty displayName → returns base MOCK_WRAPPED_RECAP", () => {
    // The empty-string fall-through is important — '' is falsy in JS
    // but not strictly null/undefined. Pin the truthy-check.
    assert.match(SRC, /if \(!displayName\) return MOCK_WRAPPED_RECAP;/);
  });

  test("with displayName: spreads base recap, overrides ONLY customerName", () => {
    // Object-spread with single-field override preserves all other
    // demo-fixture data while personalizing the name. Drift to a
    // full rebuild would risk dropping fields.
    assert.match(
      SRC,
      /return \{ \.\.\.MOCK_WRAPPED_RECAP, customerName:\s*displayName \};/,
    );
  });
});

// ── Doctrine references ────────────────────────────────────────────

describe("wrapped-mock-data.ts — doctrine + Phase-1 swap-in references", () => {
  test("comment names the Phase 1 (receipt-verified purchase corpus + reviews) trigger", () => {
    assert.match(SRC, /Phase 1[\s\S]{0,80}receipt-verified purchase corpus[\s\S]{0,40}strain reviews/);
  });

  test("comment names the customer_year_recaps table as the eventual real-data source", () => {
    assert.match(SRC, /customer_year_recaps/);
  });

  test("comment names the mid-December cron as the future production data path", () => {
    // The mid-December cron is the canonical recap-generation cadence
    // (sister of Spotify Wrapped's Dec drop). Anchors operator decision
    // for future year-bumps.
    assert.match(SRC, /mid-December cron/);
  });

  test("comment names the 3 smoke-test reviewers (Doug + Kat + Austin)", () => {
    // The 3 named reviewers map to the existing /admin/reviewer-feedback
    // allowlist on inv-App. Drift would lose the smoke-test path's
    // operator-mental-model anchor.
    // Spans 2 lines: "Doug,\n// Kat, and Austin"
    assert.match(SRC, /Doug,[\s\S]{1,20}Kat, and Austin/);
  });
});
