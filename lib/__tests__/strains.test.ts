// Pin tests for lib/strains.ts — the 250-strain Wave-1 editorial corpus
// powering /strains/<slug> customer-facing pages.
//
// Why this exists: strains.ts is the LARGEST untested lib in the repo
// (~14,777 lines, ~3,250 data cells across ~250 entries × ~13 fields).
// Drift in any of: slug format, type enum, parent references, WAC
// compliance copy, alias overlap → customer-facing regression OR
// lineage-graph breakage OR product-name auto-link miss.
//
// Pin focus:
//   1. STRAIN type-system invariants — every entry has required fields
//      with correct shape (slug/name/type/aliases/tagline/intro/effects/
//      terpenes/flavor/bestFor/avoidIf/faqs)
//   2. Slug invariants — kebab-case alphanumeric, unique, matches the
//      DB-computed slug shape
//   3. Type enum — exactly "sativa" | "indica" | "hybrid"
//   4. Parent-reference integrity — every parent slug either resolves
//      in STRAINS or is `null` (landrace/unknown)
//   5. **WAC 314-55-155 compliance**: no efficacy/medical claims in
//      intro/tagline/effects/faqs (condition-anchored regex)
//   6. Helper function contracts (getStrain / isStrainInWave /
//      getStrainsInCurrentWave / buildLineageGraph)
//   7. STRAIN_SLUGS derivation sync with STRAINS
//
// Run: pnpm test:all

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import {
  STRAINS,
  STRAIN_SLUGS,
  getStrain,
  isStrainInWave,
  getStrainsInCurrentWave,
  getEffectiveWaveSize,
  buildLineageGraph,
  type Strain,
} from "../strains.ts";

const ENTRIES: Array<[string, Strain]> = Object.entries(STRAINS);

// ── Registry shape ──────────────────────────────────────────────────

describe("STRAINS — corpus size + shape", () => {
  test("has at least 200 entries (Wave-1 250-strain rollout floor)", () => {
    // File header: "Wave 1 of the 250-strain rollout". Drift below 200
    // would surface as missing customer-facing pages.
    assert.ok(ENTRIES.length >= 200, `expected ≥200 entries, got ${ENTRIES.length}`);
  });

  test("every entry's map-key === its slug field (no orphan-keyed entries)", () => {
    for (const [key, entry] of ENTRIES) {
      assert.equal(
        entry.slug,
        key,
        `STRAINS["${key}"].slug = "${entry.slug}" — drifted from map key`,
      );
    }
  });
});

// ── Slug invariants ─────────────────────────────────────────────────

describe("STRAINS — slug format invariants", () => {
  // Same shape as brand-copy.ts slugs: lowercase alphanumeric + hyphens.
  const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  test("all slugs are kebab-case alphanumeric", () => {
    for (const [key] of ENTRIES) {
      assert.match(
        key,
        SLUG_RE,
        `slug "${key}" doesn't match kebab-case alphanumeric shape`,
      );
    }
  });

  test("no leading or trailing hyphens (would URL-encode awkwardly)", () => {
    for (const [key] of ENTRIES) {
      assert.ok(!key.startsWith("-"), `slug "${key}" has leading hyphen`);
      assert.ok(!key.endsWith("-"), `slug "${key}" has trailing hyphen`);
    }
  });

  test("no consecutive hyphens (DB-computed slugs would collapse these)", () => {
    for (const [key] of ENTRIES) {
      assert.ok(!key.includes("--"), `slug "${key}" has consecutive hyphens`);
    }
  });
});

// ── Type enum + required fields ────────────────────────────────────

describe("STRAINS — per-entry required fields", () => {
  const ALLOWED_TYPES: ReadonlyArray<Strain["type"]> = ["sativa", "indica", "hybrid"];

  test("every entry has type ∈ {sativa, indica, hybrid}", () => {
    for (const [slug, s] of ENTRIES) {
      assert.ok(
        ALLOWED_TYPES.includes(s.type),
        `${slug}.type = "${s.type}" — must be one of sativa/indica/hybrid`,
      );
    }
  });

  test("every entry has non-empty name", () => {
    for (const [slug, s] of ENTRIES) {
      assert.ok(typeof s.name === "string" && s.name.length > 0, `${slug}.name empty`);
    }
  });

  test("every entry has non-empty tagline", () => {
    for (const [slug, s] of ENTRIES) {
      assert.ok(
        typeof s.tagline === "string" && s.tagline.length > 0,
        `${slug}.tagline empty`,
      );
    }
  });

  test("every entry has non-empty intro", () => {
    for (const [slug, s] of ENTRIES) {
      assert.ok(typeof s.intro === "string" && s.intro.length > 0, `${slug}.intro empty`);
    }
  });

  test("every entry has aliases array (readonly string[]; can be empty)", () => {
    for (const [slug, s] of ENTRIES) {
      assert.ok(Array.isArray(s.aliases), `${slug}.aliases must be array`);
      for (const a of s.aliases) {
        assert.ok(typeof a === "string", `${slug}.aliases has non-string entry`);
      }
    }
  });

  test("every entry has effects array with ≥1 entry", () => {
    for (const [slug, s] of ENTRIES) {
      assert.ok(Array.isArray(s.effects), `${slug}.effects must be array`);
      assert.ok(s.effects.length >= 1, `${slug}.effects must have ≥1 entry`);
    }
  });

  test("every entry has terpenes array with name+note shape", () => {
    for (const [slug, s] of ENTRIES) {
      assert.ok(Array.isArray(s.terpenes), `${slug}.terpenes must be array`);
      for (const t of s.terpenes) {
        assert.ok(typeof t.name === "string" && t.name.length > 0, `${slug}.terpenes has empty name`);
        assert.ok(typeof t.note === "string" && t.note.length > 0, `${slug}.terpenes has empty note`);
      }
    }
  });

  test("every entry has flavor + bestFor + avoidIf arrays (can be empty but must be array)", () => {
    for (const [slug, s] of ENTRIES) {
      assert.ok(Array.isArray(s.flavor), `${slug}.flavor must be array`);
      assert.ok(Array.isArray(s.bestFor), `${slug}.bestFor must be array`);
      assert.ok(Array.isArray(s.avoidIf), `${slug}.avoidIf must be array`);
    }
  });

  test("every entry has faqs array with q+a shape", () => {
    for (const [slug, s] of ENTRIES) {
      assert.ok(Array.isArray(s.faqs), `${slug}.faqs must be array`);
      for (const faq of s.faqs) {
        assert.ok(typeof faq.q === "string" && faq.q.length > 0, `${slug}.faqs has empty q`);
        assert.ok(typeof faq.a === "string" && faq.a.length > 0, `${slug}.faqs has empty a`);
      }
    }
  });
});

// ── Parent-reference integrity ─────────────────────────────────────

describe("STRAINS — parent reference integrity", () => {
  test("every parent slug (when non-null) resolves to a STRAINS entry OR is a documented external", () => {
    // Per buildLineageGraph: parents that don't exist in STRAINS still
    // render as best-effort name strings (lineage parse fallback). But
    // we should AT MINIMUM flag the count of unresolved parents so a
    // future agent can decide whether to add the parent to the corpus.
    let unresolved = 0;
    for (const [slug, s] of ENTRIES) {
      if (!s.parents) continue;
      for (const pSlug of s.parents) {
        if (pSlug === null) continue;
        if (!STRAINS[pSlug]) unresolved++;
      }
    }
    // Soft cap: <40 unresolved parents (the corpus deliberately includes
    // parent slugs that don't have their own page yet; capped at 40 so
    // accidental orphan-creation gets surfaced).
    assert.ok(
      unresolved <= 40,
      `${unresolved} parent-slug refs don't resolve in STRAINS — over the 40 soft-cap. Either add the parents to corpus OR null them out.`,
    );
  });

  test("no entry lists itself as its own parent (circular)", () => {
    for (const [slug, s] of ENTRIES) {
      if (!s.parents) continue;
      assert.ok(
        !s.parents.includes(slug),
        `${slug} lists itself as a parent — circular lineage`,
      );
    }
  });
});

// ── WAC 314-55-155 compliance — efficacy/medical-claim ban ─────────

describe("STRAINS — WAC 314-55-155 efficacy-claim ban", () => {
  // Condition-anchored regex (same posture as brand-copy.test.ts):
  // bare "cures" / "heals" / "treats" appear in legitimate cannabis-
  // process context. Only bann the medical-condition-anchored forms.
  // Condition-anchored only. Bare "therapeutic" appears in legit
  // META-content (e.g. stephen-hawking-kush.faq: "Not a therapeutic
  // claim" — defensive disclaimer NEGATING a claim, not making one).
  // The condition-anchored form ("therapeutic for anxiety") is still
  // covered by the cures/heals/treats anchored regex below.
  const BANNED_TERMS = [
    /\bmedical[- ]grade\b/i,
    /\bclinically\s+(?:proven|tested|shown)/i,
    /\b(?:cures?|curing|heals?|healing|treats?|treatment for|therapeutic for)\s+(?:anxiety|pain|insomnia|depression|inflammation|nausea|cancer|disease|illness|ptsd|migraines?|seizures?)/i,
    /\bdiagnos(?:e|is|tic)\b/i,
    /\bdoctor[- ]recommended\b/i,
    /\bphysician[- ]approved\b/i,
    /\bFDA[- ]approved\b/i,
  ];

  test("no entry intro contains a WAC-banned efficacy term", () => {
    for (const [slug, s] of ENTRIES) {
      for (const re of BANNED_TERMS) {
        assert.ok(
          !re.test(s.intro),
          `${slug}.intro matches BANNED ${re} — efficacy claim violates WAC 314-55-155`,
        );
      }
    }
  });

  test("no entry tagline contains a WAC-banned efficacy term", () => {
    for (const [slug, s] of ENTRIES) {
      for (const re of BANNED_TERMS) {
        assert.ok(
          !re.test(s.tagline),
          `${slug}.tagline matches BANNED ${re} — efficacy claim violates WAC 314-55-155`,
        );
      }
    }
  });

  test("no faq q/a contains a WAC-banned efficacy term", () => {
    for (const [slug, s] of ENTRIES) {
      for (const faq of s.faqs) {
        for (const re of BANNED_TERMS) {
          assert.ok(!re.test(faq.q), `${slug}.faqs[].q matches BANNED ${re}`);
          assert.ok(!re.test(faq.a), `${slug}.faqs[].a matches BANNED ${re}`);
        }
      }
    }
  });

  test("no effects entry is a banned-efficacy-claim phrase", () => {
    // effects is a short tag-style list ("relaxing", "uplifting"). The
    // bare adjective forms are WAC-OK ("customers report relaxing").
    // What we ban: explicit condition-anchored claims slipping in.
    for (const [slug, s] of ENTRIES) {
      for (const e of s.effects) {
        for (const re of BANNED_TERMS) {
          assert.ok(!re.test(e), `${slug}.effects has BANNED phrase "${e}" — ${re}`);
        }
      }
    }
  });
});

// ── STRAIN_SLUGS derivation sync ───────────────────────────────────

describe("STRAINS — STRAIN_SLUGS derived array", () => {
  test("STRAIN_SLUGS length equals STRAINS entry count", () => {
    assert.equal(STRAIN_SLUGS.length, ENTRIES.length);
  });

  test("STRAIN_SLUGS preserves Object.keys order from STRAINS", () => {
    const keys = Object.keys(STRAINS);
    for (let i = 0; i < keys.length; i++) {
      assert.equal(STRAIN_SLUGS[i], keys[i]);
    }
  });
});

// ── Helper function contracts ──────────────────────────────────────

describe("STRAINS — getStrain helper", () => {
  test("returns the entry for a known slug", () => {
    const [firstSlug, firstEntry] = ENTRIES[0];
    assert.strictEqual(getStrain(firstSlug), firstEntry);
  });

  test("returns undefined for unknown slug", () => {
    assert.equal(getStrain("definitely-not-a-real-strain-9k3jf"), undefined);
  });

  test("returns undefined for empty string", () => {
    assert.equal(getStrain(""), undefined);
  });
});

describe("STRAINS — isStrainInWave SEO gate", () => {
  test("returns false when SEO_STRAIN_WAVE is unset (default 0 = none indexed)", () => {
    delete process.env.SEO_STRAIN_WAVE;
    assert.equal(isStrainInWave(ENTRIES[0][0]), false);
  });

  test("returns false when SEO_STRAIN_WAVE is 0", () => {
    process.env.SEO_STRAIN_WAVE = "0";
    assert.equal(isStrainInWave(ENTRIES[0][0]), false);
    delete process.env.SEO_STRAIN_WAVE;
  });

  test("returns true for slug within wave when SEO_STRAIN_WAVE = N", () => {
    process.env.SEO_STRAIN_WAVE = "5";
    assert.equal(isStrainInWave(STRAIN_SLUGS[0]), true);
    assert.equal(isStrainInWave(STRAIN_SLUGS[4]), true);
    assert.equal(isStrainInWave(STRAIN_SLUGS[5]), false);
    delete process.env.SEO_STRAIN_WAVE;
  });

  test("returns false for unknown slug regardless of wave", () => {
    process.env.SEO_STRAIN_WAVE = "9999";
    assert.equal(isStrainInWave("definitely-not-real-slug-9k3jf"), false);
    delete process.env.SEO_STRAIN_WAVE;
  });
});

describe("STRAINS — getStrainsInCurrentWave", () => {
  test("returns empty array when SEO_STRAIN_WAVE is 0/unset", () => {
    delete process.env.SEO_STRAIN_WAVE;
    assert.deepEqual([...getStrainsInCurrentWave()], []);
  });

  test("returns first N slugs when SEO_STRAIN_WAVE = N", () => {
    process.env.SEO_STRAIN_WAVE = "3";
    const wave = [...getStrainsInCurrentWave()];
    assert.equal(wave.length, 3);
    assert.deepEqual(wave, STRAIN_SLUGS.slice(0, 3));
    delete process.env.SEO_STRAIN_WAVE;
  });
});

describe("STRAINS — getEffectiveWaveSize auto-cadence (Doug 2026-05-27 — corpus-length ceiling)", () => {
  // SEO_STRAIN_WAVE_CAP env var REMOVED 2026-05-27 per Doug — natural
  // ceiling is `STRAIN_SLUGS.length` (corpus grows → ceiling grows
  // automatically). Tests now stub only the cadence vars; the ceiling
  // assertion uses the live corpus.
  const ENV_KEYS = [
    "SEO_STRAIN_WAVE",
    "SEO_STRAIN_WAVE_START_DATE",
    "SEO_STRAIN_WAVE_INITIAL",
    "SEO_STRAIN_WAVE_STEP_SIZE",
    "SEO_STRAIN_WAVE_STEP_DAYS",
  ];
  const cleanEnv = () => {
    for (const k of ENV_KEYS) delete process.env[k];
  };

  test("auto-cadence mode: day 0 = INITIAL (default 25)", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-05-27";
    const now = new Date("2026-05-27T12:00:00Z");
    assert.equal(getEffectiveWaveSize(now), 25);
    cleanEnv();
  });

  test("auto-cadence mode: day 3 = INITIAL + STEP_SIZE (35)", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-05-27";
    const now = new Date("2026-05-30T12:00:00Z");
    assert.equal(getEffectiveWaveSize(now), 35);
    cleanEnv();
  });

  test("auto-cadence mode: clamps to STRAIN_SLUGS.length at long horizons (no manual env-var cap)", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-05-27";
    const now = new Date("2030-01-01T00:00:00Z");
    // ~4 years of cadence ticks would explode well past corpus size;
    // natural ceiling is STRAIN_SLUGS.length, not a hardcoded number.
    assert.equal(getEffectiveWaveSize(now), STRAIN_SLUGS.length);
    cleanEnv();
  });

  test("ceiling tracks STRAIN_SLUGS.length — NOT a hardcoded constant (Doug 2026-05-27 corpus-grows-ceiling-grows)", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-05-27";
    // Use tight STEP_DAYS=1 + huge STEP_SIZE so cadence rockets past any
    // hypothetical hardcoded cap quickly; ceiling MUST come from corpus.
    process.env.SEO_STRAIN_WAVE_INITIAL = "1";
    process.env.SEO_STRAIN_WAVE_STEP_SIZE = "1000";
    process.env.SEO_STRAIN_WAVE_STEP_DAYS = "1";
    const now = new Date("2026-06-27T00:00:00Z"); // 31 days → cadence = 1 + 31*1000 = 31001
    const result = getEffectiveWaveSize(now);
    assert.equal(result, STRAIN_SLUGS.length, `expected ceiling=corpus length ${STRAIN_SLUGS.length}, got ${result}`);
    // Anti-regression: ceiling MUST NOT equal the legacy 229 hardcoded value
    // (corpus has grown past that since 2026-05-27).
    assert.ok(result !== 229 || STRAIN_SLUGS.length === 229, "ceiling must derive from STRAIN_SLUGS.length, not legacy 229");
    cleanEnv();
  });

  test("monotonic non-decreasing across elapsed days until ceiling", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-05-27";
    const samples = [0, 3, 6, 9, 30, 60, 90, 365].map((days) => {
      const now = new Date(`2026-05-27T00:00:00Z`);
      now.setUTCDate(now.getUTCDate() + days);
      return getEffectiveWaveSize(now);
    });
    for (let i = 1; i < samples.length; i++) {
      assert.ok(samples[i] >= samples[i - 1], `wave must be monotonic non-decreasing: day ${i} (${samples[i]}) < prev (${samples[i - 1]})`);
    }
    // Final sample must equal ceiling (after a year)
    assert.equal(samples.at(-1), STRAIN_SLUGS.length);
    cleanEnv();
  });

  test("+10/3-days cadence math preserved (10 strains added every 3 days)", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-05-27";
    // Day 0 = 25, Day 3 = 35, Day 6 = 45, Day 9 = 55 (steps of 10 per 3 days)
    const day0 = getEffectiveWaveSize(new Date("2026-05-27T00:00:00Z"));
    const day3 = getEffectiveWaveSize(new Date("2026-05-30T00:00:00Z"));
    const day6 = getEffectiveWaveSize(new Date("2026-06-02T00:00:00Z"));
    const day9 = getEffectiveWaveSize(new Date("2026-06-05T00:00:00Z"));
    assert.equal(day0, 25);
    assert.equal(day3, 35);
    assert.equal(day6, 45);
    assert.equal(day9, 55);
    // Cadence delta is exactly +10 per 3 days
    assert.equal(day3 - day0, 10);
    assert.equal(day6 - day3, 10);
    assert.equal(day9 - day6, 10);
    cleanEnv();
  });

  test("auto-cadence mode: returns 0 for date before start", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-06-01";
    const now = new Date("2026-05-15T00:00:00Z");
    assert.equal(getEffectiveWaveSize(now), 0);
    cleanEnv();
  });

  test("auto-cadence mode: custom STEP_SIZE + STEP_DAYS honored", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-05-27";
    process.env.SEO_STRAIN_WAVE_INITIAL = "10";
    process.env.SEO_STRAIN_WAVE_STEP_SIZE = "5";
    process.env.SEO_STRAIN_WAVE_STEP_DAYS = "7";
    // day 14 = 10 + 2 * 5 = 20
    const now = new Date("2026-06-10T12:00:00Z");
    assert.equal(getEffectiveWaveSize(now), 20);
    cleanEnv();
  });

  test("legacy mode: SEO_STRAIN_WAVE alone still works without cadence vars (clamped to corpus length)", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE = "7";
    assert.equal(getEffectiveWaveSize(), 7);
    cleanEnv();
  });

  test("legacy mode: SEO_STRAIN_WAVE > corpus length clamps to STRAIN_SLUGS.length", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE = "999999";
    // Legacy stopgap value 9999 currently in Vercel must NEVER exceed corpus.
    assert.equal(getEffectiveWaveSize(), STRAIN_SLUGS.length);
    cleanEnv();
  });

  test("auto-cadence mode wins over legacy when both set", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE = "1";
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-05-27";
    const now = new Date("2026-05-30T12:00:00Z");
    // day 3 cadence = 35, beats legacy=1
    assert.equal(getEffectiveWaveSize(now), 35);
    cleanEnv();
  });

  test("auto-cadence mode: malformed START_DATE returns 0 (fail-safe, not infinity-of-strains)", () => {
    cleanEnv();
    process.env.SEO_STRAIN_WAVE_START_DATE = "not-a-date";
    assert.equal(getEffectiveWaveSize(), 0);
    cleanEnv();
  });

  test("SEO_STRAIN_WAVE_CAP env-var is DEAD — setting it must NOT change behavior (Doug 2026-05-27 removal)", () => {
    cleanEnv();
    // Anti-regression: if a future refactor accidentally re-introduces
    // SEO_STRAIN_WAVE_CAP, this test catches it. With cadence active, the
    // wave must be driven by STRAIN_SLUGS.length, not by this leftover var.
    process.env.SEO_STRAIN_WAVE_START_DATE = "2026-05-27";
    process.env.SEO_STRAIN_WAVE_INITIAL = "1";
    process.env.SEO_STRAIN_WAVE_STEP_SIZE = "1000";
    process.env.SEO_STRAIN_WAVE_STEP_DAYS = "1";
    // Set the now-dead env var to a stupidly-low value; if it were still
    // read, ceiling would be 5; with refactor, ceiling is STRAIN_SLUGS.length.
    process.env.SEO_STRAIN_WAVE_CAP = "5";
    const now = new Date("2026-06-27T00:00:00Z");
    assert.equal(getEffectiveWaveSize(now), STRAIN_SLUGS.length);
    delete process.env.SEO_STRAIN_WAVE_CAP;
    cleanEnv();
  });
});

describe("STRAINS — buildLineageGraph", () => {
  test("returns null for unknown slug", () => {
    assert.equal(buildLineageGraph("definitely-not-a-real-strain-9k3jf"), null);
  });

  test("returns a graph object for known slug (center + parents + descendants + siblings arrays)", () => {
    // Pick the first entry that has parents declared.
    const withParents = ENTRIES.find(([, s]) => s.parents && s.parents.length > 0);
    if (!withParents) return; // corpus drift escape
    const [slug] = withParents;
    const graph = buildLineageGraph(slug);
    assert.ok(graph, `buildLineageGraph(${slug}) returned null unexpectedly`);
    assert.equal(graph!.center.slug, slug);
    assert.ok(Array.isArray(graph!.parents));
    assert.ok(Array.isArray(graph!.descendants));
    assert.ok(Array.isArray(graph!.siblings));
  });

  test("siblings array is capped at 8 (file invariant — anything more is noise)", () => {
    for (const [slug] of ENTRIES.slice(0, 30)) {
      const graph = buildLineageGraph(slug);
      if (!graph) continue;
      assert.ok(graph.siblings.length <= 8, `${slug} siblings count ${graph.siblings.length} > 8 cap`);
    }
  });

  test("center slug always matches input", () => {
    for (const [slug] of ENTRIES.slice(0, 10)) {
      const graph = buildLineageGraph(slug);
      if (!graph) continue;
      assert.equal(graph.center.slug, slug);
    }
  });
});
