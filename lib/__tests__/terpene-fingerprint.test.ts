// Pin tests for lib/terpene-fingerprint.ts via fs.readFileSync source-
// assertion (server-only barrier prevents module-load — same pattern as
// email.ts + voice-memo.ts).
//
// C7 of PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md: customer terpene
// preference vector from receipt-verified purchase + rating history.
// PATENT-TRACK — the COMBINATION of (a) receipt-verified weights +
// (b) per-customer terpene vector + (c) lineage graph (cousin-finder)
// is the novel-claim bundle. Drift in the scoring constants or the
// "PATENT-TRACK" comment markers risks the patent application's
// novel-combination defensibility.
//
// Pin focus:
//   1. PATENT-TRACK comment markers stay literal (load-bearing for the
//      patent application's novel-combination claim — a refactor that
//      removed these markers could be cited as "the agent didn't think
//      this was novel")
//   2. Scoring constants pinned at exact values (POSITION_WEIGHTS [1.0,
//      0.6, 0.35], AXIS_CAP 0.55) — drift = different recommendations
//   3. ratingWeight ramp pinned at the documented values (1★→0.25,
//      2★→0.4, 3★→0.6, 4★→0.85, 5★→1.0 — 5★ counts ~3× a 3★)
//   4. purchaseWeight = ln(1+count) diminishing-returns formula
//   5. Feature-flag default OFF (TERPENE_FINGERPRINT_ENABLED === "true")
//   6. ZERO_VECTOR empty-state shape pinned (7 zeros — UI relies on this
//      for the "no fingerprint yet" render path)
//
// Run: pnpm test:all

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(HERE, "..", "terpene-fingerprint.ts");
const SRC = readFileSync(SOURCE_PATH, "utf-8");

// ── Server-only barrier ─────────────────────────────────────────────

describe("terpene-fingerprint.ts — server-only barrier", () => {
  test("imports `server-only` (scoring constants must NOT bundle to client)", () => {
    // File header: "Do NOT inline these scoring constants into client-
    // bundled code — keep all math in server modules imported by
    // Server Components only." Drift would expose patent-claim math
    // in browser DevTools.
    assert.match(SRC, /^import "server-only";/m);
  });
});

// ── PATENT-TRACK anti-rot ──────────────────────────────────────────

describe("terpene-fingerprint.ts — PATENT-TRACK comment markers", () => {
  test("header comment contains literal 'PATENT-TRACK' marker", () => {
    // The marker is the file's load-bearing legal-defensibility flag.
    // It tells anyone reading "this is novel-claim infrastructure;
    // don't simplify or duplicate."
    assert.match(SRC, /PATENT-TRACK/);
  });

  test("PATENT-TRACK section enumerates the 3-part novel claim (a + b + c)", () => {
    // (a) receipt-verified purchase weights
    // (b) per-customer multi-axis terpene-affinity vector
    // (c) lineage-graph shortest-path traversal (in cousin-finder)
    assert.match(SRC, /\(a\)\s+receipt-verified/);
    assert.match(SRC, /\(b\)\s+per-customer multi-axis terpene-affinity vector/);
    assert.match(SRC, /\(c\)\s+lineage-graph shortest-path/);
  });

  test("references docs/terpene-fingerprint.md (the patent-track posture doc)", () => {
    assert.match(SRC, /docs\/terpene-fingerprint\.md/);
  });

  test("PATENT-TRACK warning appears inline at computeTerpeneFingerprint algorithm doc", () => {
    // Per file: "Algorithm (PATENT-TRACK — do not duplicate into client
    // bundle)". The inline warning is the second tripwire — the file-
    // header one might rot but inline-at-function is harder to miss.
    assert.match(
      SRC,
      /Algorithm \(PATENT-TRACK — do not duplicate into client bundle\)/,
    );
  });

  test("comment forbids client-bundle exposure of scoring constants", () => {
    // The "kept private to avoid client-bundle exposure" comment block
    // pins WHY POSITION_WEIGHTS + AXIS_CAP + ratingWeight + purchaseWeight
    // are NOT exported. Drift = future agent exports them for "easier
    // testing" + accidentally bundles to client.
    assert.match(SRC, /kept private to avoid client-bundle exposure/);
  });
});

// ── Scoring constants — exact pinned values ────────────────────────

describe("terpene-fingerprint.ts — scoring constants (load-bearing for recommendations)", () => {
  test("POSITION_WEIGHTS = [1.0, 0.6, 0.35] (top / 2nd / 3rd terpene)", () => {
    // Drift = different terpene attention distribution = different
    // recommendations from cousin-finder. The exact ratios were calibrated;
    // any change should be a deliberate patent-application updateable
    // ship, not a casual refactor.
    assert.match(SRC, /const POSITION_WEIGHTS\s*=\s*\[1\.0,\s*0\.6,\s*0\.35\]\s*as const;/);
  });

  test("AXIS_CAP = 0.55 (prevents radar flattening from one heavy strain)", () => {
    // Per file comment: "Cap any single axis at 0.55 BEFORE re-normalizing
    // (prevents one heavy strain from flattening the radar)." Drift up
    // (e.g. 0.8) re-introduces the flattening; drift down (e.g. 0.3) makes
    // the radar feel "flat" to power users.
    assert.match(SRC, /const AXIS_CAP\s*=\s*0\.55;/);
  });

  test("ZERO_VECTOR is exactly 7 zeros (TERPENE_AXES count anchor)", () => {
    // The 7-element vector size comes from TERPENE_AXES.length (= 7
    // canonical axes covering ~95% of shelf terpene mass). UI uses the
    // zero-vector to render "no fingerprint yet" empty state.
    assert.match(SRC, /const ZERO_VECTOR:\s*TerpeneVector\s*=\s*\[0,\s*0,\s*0,\s*0,\s*0,\s*0,\s*0\];/);
  });
});

// ── ratingWeight ramp — exact pinned values ────────────────────────

describe("terpene-fingerprint.ts — ratingWeight ramp", () => {
  test("ratingWeight(1) returns 0.25 (1★ still counts SOMETHING — customer engaged)", () => {
    // File header: "Strains rated below 3 contribute LESS weight (not
    // zero — we still saw the customer engage)." Drift to 0 would lose
    // signal from 1★/2★ ratings.
    assert.match(SRC, /if \(rating <= 1\) return 0\.25;/);
  });

  test("ratingWeight(2) returns 0.4", () => {
    assert.match(SRC, /if \(rating <= 2\) return 0\.4;/);
  });

  test("ratingWeight(3) returns 0.6", () => {
    assert.match(SRC, /if \(rating <= 3\) return 0\.6;/);
  });

  test("ratingWeight(4) returns 0.85", () => {
    assert.match(SRC, /if \(rating <= 4\) return 0\.85;/);
  });

  test("ratingWeight(5+) returns 1.0 (default arm)", () => {
    // After all <= branches, function returns 1.0 — pins the default-arm.
    assert.match(SRC, /return 1\.0;/);
  });

  test("ramp documents '5★ counts ~3× a 3★' (calibration anchor)", () => {
    // The "3×" ratio between 5★ and 3★ is the calibration claim. If a
    // future agent re-balances and that ratio shifts to 2× or 5×, the
    // user-experience-tested calibration is lost. Pin the literal.
    assert.match(SRC, /5★ counts ~3× more than a 3★/);
  });
});

// ── purchaseWeight diminishing-returns formula ─────────────────────

describe("terpene-fingerprint.ts — purchaseWeight (ln(1+count) diminishing-returns)", () => {
  test("uses Math.log(1 + count) formula (diminishing-returns shape)", () => {
    // Drift to plain `count` would let one repeat-purchase strain
    // dominate the vector (the exact flatten-the-radar problem AXIS_CAP
    // mitigates downstream). The ln(1+count) shape is the upstream defense.
    assert.match(SRC, /Math\.log\(1 \+ count\)/);
  });

  test("purchaseWeight(0) returns 0 (no purchase = no contribution)", () => {
    assert.match(SRC, /if \(count <= 0\) return 0;/);
  });

  test("comment documents the calibration values (1→0.69, 2→1.10, 5→1.79, 10→2.40)", () => {
    // The reference values let a future agent sanity-check that they
    // haven't inadvertently changed the ln() base or shape (e.g.
    // accidentally Math.log2 vs Math.log).
    assert.match(SRC, /1 purchase → 0\.69, 2 → 1\.10, 5 → 1\.79, 10 → 2\.40/);
  });
});

// ── Feature-flag default ───────────────────────────────────────────

describe("terpene-fingerprint.ts — feature-flag default-OFF", () => {
  test("file header documents TERPENE_FINGERPRINT_ENABLED === 'true' gate", () => {
    // Public consumers MUST check the flag per file header. Drift toward
    // a different gate value (e.g. !== "false" would invert the default
    // to "on unless explicitly off") would silently expose the C7 UI
    // before the foundation tables exist.
    assert.match(
      SRC,
      /process\.env\.TERPENE_FINGERPRINT_ENABLED === "true"/,
    );
  });

  test("file header explicitly says 'Default OFF'", () => {
    assert.match(SRC, /Default OFF/);
  });
});

// ── Exported function surface ──────────────────────────────────────

describe("terpene-fingerprint.ts — exported function surface", () => {
  test("re-exports TERPENE_AXES + VECTOR_VERSION + types from terpene-types", () => {
    // File header: "TERPENE_AXES + TerpeneAxis + VECTOR_VERSION +
    // TerpeneVector are re-exported above from ./terpene-types so
    // Client Components can import the same shapes without bundling
    // this server-only file." The re-export is the bridge to client
    // — drift breaks the radar component's typed-shape consumption.
    assert.match(SRC, /^export \{ TERPENE_AXES, VECTOR_VERSION \};/m);
    assert.match(SRC, /^export type \{ TerpeneAxis, TerpeneVector \};/m);
  });

  test("exports computeTerpeneFingerprint (the patent-track scoring entry point)", () => {
    assert.match(SRC, /^export function computeTerpeneFingerprint/m);
  });

  test("exports terpeneCosineSimilarity (used by cousin-finder for distance)", () => {
    assert.match(SRC, /^export function terpeneCosineSimilarity/m);
  });

  test("exports strainTerpeneVector (per-strain anchor vector)", () => {
    assert.match(SRC, /^export function strainTerpeneVector/m);
  });

  test("exports buildMockFingerprint + buildAverageFingerprint (mock-mode fixtures)", () => {
    // Mock-mode fixtures unblock the UI ship pre-cutover. If renamed,
    // /account/terpene-profile page would 500 on the import.
    assert.match(SRC, /^export function buildMockFingerprint/m);
    assert.match(SRC, /^export function buildAverageFingerprint/m);
  });

  test("exports dominantTerpeneAxis (axis-label helper for chart tooltip)", () => {
    assert.match(SRC, /^export function dominantTerpeneAxis/m);
  });

  test("exports RatedStrain type (callers pass this shape from their data layer)", () => {
    assert.match(SRC, /^export type RatedStrain\s*=/m);
  });
});

// ── Doctrine references (anti-rot pins) ────────────────────────────

describe("terpene-fingerprint.ts — doctrine-reference anti-rot", () => {
  test("header references C7 of strain-tree innovation plan", () => {
    assert.match(SRC, /C7/);
    assert.match(SRC, /PLAN_STRAIN_TREE_INNOVATION_2026_05_21\.md/);
  });

  test("comment justifies 7-axis choice ('~95% of dispensary-shelf terpene mass')", () => {
    // The 7-axis count is calibrated to the Confident Cannabis aggregate
    // panel data. Drift in axis count = breaking change for cached vectors
    // (must bump VECTOR_VERSION). The "why 7" explanation is the anchor
    // for that decision; drift would lose institutional knowledge.
    assert.match(SRC, /~95% of dispensary-shelf terpene mass/);
  });

  test("comment explains Ocimene intentional omission (low shelf presence anchor)", () => {
    // The Ocimene omission is non-obvious — a future agent might "fix"
    // the omission thinking it's an oversight. Pin the rationale comment.
    assert.match(SRC, /Ocimene is intentionally[\s\S]{0,200}low shelf presence/);
  });

  test("BREAKING-change note on adding new axis (bump VECTOR_VERSION)", () => {
    // Cached vectors are serialized 7-element arrays. Adding an 8th axis
    // means stored vectors are no longer interpretable without re-indexing.
    // The VECTOR_VERSION bump is the migration tripwire.
    // "Adding a\n * new axis is a BREAKING change..." spans 2 lines
    // with " * " comment-continuation in between — `\s+` doesn't match
    // the `*`. Use `[\s\S]{1,40}` to tolerate any inter-anchor chars.
    assert.match(SRC, /Adding a[\s\S]{1,40}new axis is a BREAKING change for cached vectors/);
    assert.match(SRC, /bump VECTOR_VERSION/);
  });
});
