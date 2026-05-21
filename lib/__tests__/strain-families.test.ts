// Tests for `lib/strain-families.ts` — Strain Family Album SSoT.
//
// Why pinned: 10 founder-line families anchor a customer-facing /strains
// taxonomy + drive PageRank flow + per-family content. Drift risks:
//   - Anchor slug typo → /strains/families/<slug> renders without
//     a founder card
//   - Family slug collision → routing/sitemap conflict
//   - WAC voice drift on family descriptions (efficacy claims slip in)
//   - Empty family → "0 strains" tile on the family-album grid
//
// Note on `@/lib/strains` import: the SoT lib was refactored from
// `@/lib/strains` → `./strains` in this same ship so the Node test
// runner can resolve it without a tsconfig-paths loader. Test file
// + ref code go together as one batch.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  STRAIN_FAMILIES,
  FAMILY_SLUGS,
  getFamily,
  getStrainsInFamily,
  getFounderAnchors,
  getFamilyCount,
} from "../strain-families.ts";

import { STRAINS } from "../strains.ts";

// ── STRAIN_FAMILIES shape ──────────────────────────────────────────────

describe("STRAIN_FAMILIES — array shape", () => {
  test("has exactly 10 families (9 founders + landrace)", () => {
    assert.equal(STRAIN_FAMILIES.length, 10);
  });

  test("includes the canonical 10 family keys", () => {
    const slugs = STRAIN_FAMILIES.map((f) => f.slug).sort();
    const expected = [
      "afghani",
      "blueberry",
      "cheese",
      "cookies",
      "diesel",
      "haze",
      "kush",
      "landrace",
      "northern-lights",
      "skunk",
    ].sort();
    assert.deepEqual(slugs, expected);
  });

  test("every family has required fields populated", () => {
    for (const f of STRAIN_FAMILIES) {
      assert.ok(f.slug, "missing slug");
      assert.ok(f.name && typeof f.name === "string", `${f.slug} missing name`);
      assert.ok(f.tagline && typeof f.tagline === "string", `${f.slug} missing tagline`);
      assert.ok(
        f.description && typeof f.description === "string",
        `${f.slug} missing description`,
      );
      if (f.slug !== "landrace") {
        assert.ok(f.anchorSlug, `${f.slug} missing anchorSlug`);
      }
    }
  });

  test("only landrace has null anchorSlug", () => {
    for (const f of STRAIN_FAMILIES) {
      if (f.slug === "landrace") {
        assert.equal(f.anchorSlug, null);
      } else {
        assert.notEqual(f.anchorSlug, null, `${f.slug} should have anchor`);
      }
    }
  });
});

// ── Slug uniqueness ────────────────────────────────────────────────────

describe("STRAIN_FAMILIES — slug uniqueness", () => {
  test("no duplicate family slugs (routing collision prevention)", () => {
    const slugs = STRAIN_FAMILIES.map((f) => f.slug);
    assert.equal(slugs.length, new Set(slugs).size);
  });
});

// ── Tagline + description length discipline ────────────────────────────

describe("STRAIN_FAMILIES — tagline + description length", () => {
  test("tagline within reasonable bound (≤120 chars)", () => {
    for (const f of STRAIN_FAMILIES) {
      assert.ok(f.tagline.length <= 120, `${f.slug} tagline ${f.tagline.length} chars`);
    }
  });

  test("description in 50-200-word range (per type docstring 80-110 ± slack)", () => {
    for (const f of STRAIN_FAMILIES) {
      const words = f.description.trim().split(/\s+/).length;
      assert.ok(
        words >= 50 && words <= 200,
        `${f.slug} description ${words} words (want 50-200)`,
      );
    }
  });
});

// ── WAC 314-55-155 voice invariants ────────────────────────────────────

describe("STRAIN_FAMILIES — WAC voice invariants", () => {
  test("no exclamation marks in name, tagline, or description", () => {
    for (const f of STRAIN_FAMILIES) {
      assert.ok(!f.name.includes("!"), `${f.slug} name has !`);
      assert.ok(!f.tagline.includes("!"), `${f.slug} tagline has !`);
      assert.ok(!f.description.includes("!"), `${f.slug} description has !`);
    }
  });

  test("no efficacy-claim trigger words in description (defensive)", () => {
    const triggers = [
      / cures? /i,
      / heals? /i,
      / treats /i,
      /medicinal /i,
      / relieves /i,
    ];
    for (const f of STRAIN_FAMILIES) {
      for (const re of triggers) {
        assert.ok(
          !re.test(f.description),
          `${f.slug} description matches efficacy-trigger ${re}`,
        );
      }
    }
  });
});

// ── Anchor referential integrity ───────────────────────────────────────

describe("STRAIN_FAMILIES — anchor strain integrity", () => {
  test("every non-null anchorSlug exists in STRAINS", () => {
    for (const f of STRAIN_FAMILIES) {
      if (!f.anchorSlug) continue;
      assert.ok(
        STRAINS[f.anchorSlug],
        `${f.slug} anchor "${f.anchorSlug}" not in STRAINS`,
      );
    }
  });

  test("every includeSlugs entry exists in STRAINS", () => {
    for (const f of STRAIN_FAMILIES) {
      if (!f.includeSlugs) continue;
      for (const slug of f.includeSlugs) {
        assert.ok(
          STRAINS[slug],
          `${f.slug} includeSlug "${slug}" not in STRAINS`,
        );
      }
    }
  });
});

// ── FAMILY_SLUGS derived correctly ─────────────────────────────────────

describe("FAMILY_SLUGS", () => {
  test("matches STRAIN_FAMILIES.map(f => f.slug)", () => {
    assert.deepEqual(
      [...FAMILY_SLUGS],
      STRAIN_FAMILIES.map((f) => f.slug),
    );
  });

  test("length matches STRAIN_FAMILIES length", () => {
    assert.equal(FAMILY_SLUGS.length, STRAIN_FAMILIES.length);
  });
});

// ── getFamily helper ───────────────────────────────────────────────────

describe("getFamily — slug lookup", () => {
  test("returns the family for a known slug", () => {
    const fam = getFamily("kush");
    assert.ok(fam);
    assert.equal(fam.slug, "kush");
  });

  test("returns null for unknown slug", () => {
    assert.equal(getFamily("nonexistent-family"), null);
  });

  test("returns null for empty string", () => {
    assert.equal(getFamily(""), null);
  });
});

// ── getStrainsInFamily sanity ──────────────────────────────────────────

describe("getStrainsInFamily — derivation sanity", () => {
  test("returns empty for unknown family slug", () => {
    assert.deepEqual([...getStrainsInFamily("nonexistent")], []);
  });

  test("kush family is non-empty (anchor + parent-walk + name-match all contribute)", () => {
    const strains = getStrainsInFamily("kush");
    assert.ok(strains.length > 0, "kush family should not be empty");
  });

  test("when family has anchor, anchor strain is first in returned array", () => {
    const fam = getFamily("kush");
    assert.ok(fam?.anchorSlug);
    const strains = getStrainsInFamily("kush");
    if (strains.length > 0) {
      assert.equal(strains[0]!.slug, fam.anchorSlug, "anchor should be first");
    }
  });
});

// ── getFounderAnchors ──────────────────────────────────────────────────

describe("getFounderAnchors", () => {
  test("returns 9 (10 families minus landrace which has null anchor)", () => {
    const anchors = getFounderAnchors();
    assert.equal(anchors.length, 9);
  });

  test("does NOT include landrace (no anchor)", () => {
    const anchors = getFounderAnchors();
    const landraceFamily = STRAIN_FAMILIES.find((f) => f.slug === "landrace");
    if (landraceFamily) {
      assert.equal(landraceFamily.anchorSlug, null);
    }
    for (const a of anchors) {
      const matchingFam = STRAIN_FAMILIES.find((f) => f.anchorSlug === a.slug);
      assert.ok(matchingFam);
      assert.notEqual(matchingFam.slug, "landrace");
    }
  });
});

// ── getFamilyCount ─────────────────────────────────────────────────────

describe("getFamilyCount", () => {
  test("matches getStrainsInFamily length", () => {
    for (const fam of STRAIN_FAMILIES) {
      const count = getFamilyCount(fam.slug);
      const strains = getStrainsInFamily(fam.slug);
      assert.equal(count, strains.length, `${fam.slug} count mismatch`);
    }
  });

  test("returns 0 for unknown family", () => {
    assert.equal(getFamilyCount("nonexistent"), 0);
  });
});
