// Pin tests for lib/brand-copy.ts — file-based brand-bio SSoT for
// vendors who haven't filled their /vmi/profile bio yet (audit
// finding 2026-05-15: 109 brand pages had zero brand story).
//
// Test focus: the WAC 314-55-155 compliance invariants documented
// in the file header (no efficacy/medical claims, U+2019 apostrophes
// only, no exclamation marks) — these are LICENSE-RISK if they drift.
// Plus slug / shape contracts that protect the brand-page render path.
//
// Run: pnpm test:all
// Or: node --test --experimental-strip-types --no-warnings lib/__tests__/brand-copy.test.ts

import { describe, test } from "node:test";
import assert from "node:assert/strict";

import { BRAND_COPY, getBrandCopy, type BrandCopy } from "../brand-copy.ts";

const ENTRIES: Array<[string, BrandCopy]> = Object.entries(BRAND_COPY);

// ── Sanity: registry shape ──────────────────────────────────────────

describe("BRAND_COPY — registry shape", () => {
  test("has at least one entry", () => {
    assert.ok(ENTRIES.length > 0, "BRAND_COPY must not be empty");
  });

  test("every entry's map-key === its slug field (no orphan-keyed entries)", () => {
    for (const [key, entry] of ENTRIES) {
      assert.equal(
        entry.slug,
        key,
        `BRAND_COPY["${key}"].slug = "${entry.slug}" — drifted from map key. Either rename the key or update entry.slug.`,
      );
    }
  });

  // Note: alphabetization is documented as a convention in the file
  // header ("keep alphabetized by slug so PRs that add a brand drop into
  // a deterministic insertion point") but the current data has drifted
  // from strict alpha order across 63 entries. Pinning strict order here
  // would require reordering the whole map — out of scope for the WAC-
  // compliance-focused ship that landed this test file. Future cleanup
  // candidate; the convention itself stays in the file header for the
  // human reviewer to follow on net-new additions.
});

// ── Slug contract — must match DB-computed slug shape ──────────────

describe("BRAND_COPY — slug shape (matches DB regex)", () => {
  // DB-computed slug rule per file header:
  // LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'))
  // Resulting slug: lowercase alphanumeric + hyphens.
  //
  // Known sitemap-alias exceptions (documented in-source) — these are
  // intentional dupes of the canonical slug with extra punctuation
  // so getBrandCopy() can resolve both URL shapes that historically
  // appeared in the sitemap. Each MUST have an in-source comment
  // explaining the alias before the entry.
  const SLUG_ALIAS_ALLOWLIST = new Set<string>([
    "dewey-cannabis-co-", // Doug 2026-05-17 page-completion-agent report — sitemap alias
  ]);
  const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  test("all slugs are kebab-case alphanumeric (matches DB-computed shape) OR documented alias", () => {
    for (const [key] of ENTRIES) {
      if (SLUG_ALIAS_ALLOWLIST.has(key)) continue;
      assert.match(
        key,
        SLUG_RE,
        `slug "${key}" doesn't match DB regex — URL would mismatch the vendor-page resolver. If this is an intentional sitemap alias, add it to SLUG_ALIAS_ALLOWLIST and document the in-source reason.`,
      );
    }
  });

  test("no slug is empty string", () => {
    for (const [key] of ENTRIES) {
      assert.ok(key.length > 0, "slug must be non-empty");
    }
  });

  test("no leading hyphens (would URL-encode awkwardly)", () => {
    for (const [key] of ENTRIES) {
      assert.ok(!key.startsWith("-"), `slug "${key}" has leading hyphen`);
    }
  });

  test("trailing hyphens only in documented sitemap-alias allowlist", () => {
    for (const [key] of ENTRIES) {
      if (!key.endsWith("-")) continue;
      assert.ok(
        SLUG_ALIAS_ALLOWLIST.has(key),
        `slug "${key}" has trailing hyphen but isn't in SLUG_ALIAS_ALLOWLIST. Document the in-source reason if intentional.`,
      );
    }
  });

  test("no consecutive hyphens (DB regex collapses [^a-z0-9]+ to single -)", () => {
    for (const [key] of ENTRIES) {
      assert.ok(
        !key.includes("--"),
        `slug "${key}" has consecutive hyphens — DB regex would collapse those, so this won't resolve.`,
      );
    }
  });
});

// ── WAC 314-55-155 compliance — efficacy / medical-claim ban ────────

describe("BRAND_COPY — WAC 314-55-155 efficacy-claim ban", () => {
  // Per file header: "No efficacy/medical claims. 'Strict quality bar' not
  // 'medical-grade'. Describe the brand's story, lineup, format mix — never
  // therapeutic outcome."
  //
  // Plus general WSLCB-cannabis-marketing rule that customer-facing copy
  // cannot make explicit therapeutic claims. The bio field is the highest-
  // risk surface because it's prose (vs the structured tagline / display).
  // The regexes below are CONDITION-ANCHORED (e.g. "cures anxiety", not
  // bare "cures") on purpose — bare "cure" / "curing" / "heal" are
  // CANNABIS-PROCESS nouns in this domain (curing flower, hash cure
  // time, etc.) and would false-positive against legit brand copy.
  // Verified empirically against the 63-entry corpus: the bare-form
  // tests false-positived on western-cultured + downtown-cannabis +
  // painted-rooster bios that describe flower-curing technique, NOT
  // medical claims.
  const BANNED_TERMS = [
    /\bmedical[- ]grade\b/i,
    /\bclinical(?:ly)?\b/i,
    /\b(?:cures?|curing|heals?|healing|treats?|treatment for)\s+(?:anxiety|pain|insomnia|depression|inflammation|nausea|cancer|disease|illness|ptsd|migraines?|seizures?)/i,
    /\btherapeutic\b/i,
    /\bdiagnos(?:e|is|tic)\b/i,
    /\bprevents?\s+(?:disease|illness|cancer)/i,
    /\bdoctor[- ]recommended\b/i,
    /\bphysician[- ]approved\b/i,
    /\bFDA[- ]approved\b/i,
  ];

  test("no bio contains a WAC-banned efficacy term (license risk)", () => {
    for (const [slug, entry] of ENTRIES) {
      if (!entry.bio) continue;
      for (const re of BANNED_TERMS) {
        assert.ok(
          !re.test(entry.bio),
          `${slug}.bio matches BANNED ${re} — efficacy/medical claim violates WAC 314-55-155. Rewrite to descriptive non-therapeutic copy ("strict quality bar" instead of "medical-grade", "customers reach for it when…" instead of "treats X").`,
        );
      }
    }
  });

  test("no tagline contains a WAC-banned efficacy term", () => {
    for (const [slug, entry] of ENTRIES) {
      if (!entry.tagline) continue;
      for (const re of BANNED_TERMS) {
        assert.ok(
          !re.test(entry.tagline),
          `${slug}.tagline matches BANNED ${re} — efficacy/medical claim violates WAC 314-55-155.`,
        );
      }
    }
  });

  test("no displayName contains a WAC-banned efficacy term (defensive — names rarely have these)", () => {
    for (const [slug, entry] of ENTRIES) {
      if (!entry.displayName) continue;
      for (const re of BANNED_TERMS) {
        assert.ok(
          !re.test(entry.displayName),
          `${slug}.displayName matches BANNED ${re} — efficacy claim in brand display name violates WAC 314-55-155.`,
        );
      }
    }
  });
});

// ── Voice rules (per file header) ───────────────────────────────────

describe("BRAND_COPY — voice rules (file-header convention)", () => {
  test("no bio contains an exclamation mark (file header: 'No exclamation marks.')", () => {
    for (const [slug, entry] of ENTRIES) {
      if (!entry.bio) continue;
      assert.ok(
        !entry.bio.includes("!"),
        `${slug}.bio contains "!" — violates voice convention "No exclamation marks." in file header.`,
      );
    }
  });

  test("no tagline contains an exclamation mark", () => {
    for (const [slug, entry] of ENTRIES) {
      if (!entry.tagline) continue;
      assert.ok(
        !entry.tagline.includes("!"),
        `${slug}.tagline contains "!" — violates voice convention "No exclamation marks." in file header.`,
      );
    }
  });

  test("bios use U+2019 curly apostrophe (not ASCII ') per file-header rule", () => {
    // The file header rule: "U+2019 apostrophes." — typographic
    // consistency across brand-page renders. Bios should NEVER contain
    // a plain ASCII ' (would render as a straight quote, off-brand).
    for (const [slug, entry] of ENTRIES) {
      if (!entry.bio) continue;
      assert.ok(
        !entry.bio.includes("'"),
        `${slug}.bio contains ASCII apostrophe "'" — voice rule requires U+2019 curly apostrophe (’). Replace " ' " with " ’ ".`,
      );
    }
  });

  test("taglines use U+2019 curly apostrophe (not ASCII ')", () => {
    for (const [slug, entry] of ENTRIES) {
      if (!entry.tagline) continue;
      assert.ok(
        !entry.tagline.includes("'"),
        `${slug}.tagline contains ASCII apostrophe — voice rule requires U+2019 (’).`,
      );
    }
  });
});

// ── logoUrl path-shape contract ─────────────────────────────────────

describe("BRAND_COPY — logoUrl path-shape contract", () => {
  test("every logoUrl starts with /brand-logos/ (mirrors cross-stack public/ convention)", () => {
    for (const [slug, entry] of ENTRIES) {
      if (!entry.logoUrl) continue;
      assert.ok(
        entry.logoUrl.startsWith("/brand-logos/"),
        `${slug}.logoUrl = "${entry.logoUrl}" — must start with "/brand-logos/" per render fallback chain. Files live at public/brand-logos/ on BOTH greenlife-web + seattle-cannabis-web.`,
      );
    }
  });

  test("every logoUrl ends with a valid image extension (png / jpg / svg / webp)", () => {
    const VALID_EXTS = /\.(png|jpg|jpeg|svg|webp)$/i;
    for (const [slug, entry] of ENTRIES) {
      if (!entry.logoUrl) continue;
      assert.match(
        entry.logoUrl,
        VALID_EXTS,
        `${slug}.logoUrl = "${entry.logoUrl}" — must end with .png/.jpg/.svg/.webp.`,
      );
    }
  });

  test("no logoUrl contains absolute URL (must be relative to public/)", () => {
    for (const [slug, entry] of ENTRIES) {
      if (!entry.logoUrl) continue;
      assert.ok(
        !entry.logoUrl.startsWith("http"),
        `${slug}.logoUrl is absolute URL — convention is relative path under public/. Absolute URLs would bypass Next.js image optimization + cross-stack mirroring.`,
      );
    }
  });
});

// ── updatedAt shape (when set) ──────────────────────────────────────

describe("BRAND_COPY — updatedAt shape", () => {
  test("when set, matches YYYY-MM-DD ISO date shape", () => {
    const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
    for (const [slug, entry] of ENTRIES) {
      if (entry.updatedAt == null) continue;
      assert.match(
        entry.updatedAt,
        ISO_DATE,
        `${slug}.updatedAt = "${entry.updatedAt}" — must be YYYY-MM-DD per file-header convention.`,
      );
    }
  });

  test("when set, parses to a valid Date (not 2026-13-45 or similar)", () => {
    for (const [slug, entry] of ENTRIES) {
      if (entry.updatedAt == null) continue;
      const parsed = new Date(entry.updatedAt + "T00:00:00Z");
      assert.ok(
        !Number.isNaN(parsed.getTime()),
        `${slug}.updatedAt = "${entry.updatedAt}" is not a parseable date.`,
      );
    }
  });
});

// ── getBrandCopy contract ───────────────────────────────────────────

describe("getBrandCopy — lookup function contract", () => {
  test("returns the entry for a known slug", () => {
    const [firstSlug, firstEntry] = ENTRIES[0];
    assert.strictEqual(getBrandCopy(firstSlug), firstEntry);
  });

  test("returns undefined for an unknown slug (callers fall through to DB)", () => {
    assert.equal(getBrandCopy("definitely-not-a-real-brand-9k3jf"), undefined);
  });

  test("returns undefined for empty string (no false-positive)", () => {
    assert.equal(getBrandCopy(""), undefined);
  });

  test("is case-sensitive — uppercase slug does NOT match a lowercase entry", () => {
    // The DB-side slug is always lowercase per the LOWER() in the slug-
    // generation SQL. URL-side resolution uses the literal-key match. If
    // a future agent ever case-normalizes inside getBrandCopy, the test
    // catches the drift.
    const [knownSlug] = ENTRIES[0];
    const upperSlug = knownSlug.toUpperCase();
    if (upperSlug === knownSlug) return; // all-numeric slug edge case
    assert.equal(
      getBrandCopy(upperSlug),
      undefined,
      `case-insensitive match would surface "${knownSlug}" entry for URL "/brands/${upperSlug}" — drift from DB convention.`,
    );
  });
});
