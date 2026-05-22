// Pin tests for lib/cousin-finder.ts via fs.readFileSync source-assertion
// (server-only barrier prevents module-load).
//
// C7 of PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md — completes the
// PATENT-TRACK trifecta: this file is part (c) lineage-graph
// shortest-path traversal as recommendation distance. Combined with
// lib/terpene-fingerprint.ts parts (a)+(b), the 3-part combination is
// the novel-claim bundle for the Branch Associates patent application.
//
// Pin focus:
//   1. PATENT-TRACK marker stays in header comment
//   2. TERPENE_WEIGHT + LINEAGE_WEIGHT cousinScore-blend coefficients
//      pinned at exact values (0.7 + 0.3 = 1.0; Doug-decision per
//      Phase 4.3 plan, A/B candidate at 60-40 in Phase 5)
//   3. MAX_LINEAGE_DEPTH = 6 (beyond 6 hops isn't a "cousin")
//   4. BFS undirected-graph invariant (must walk BOTH directions —
//      siblings + descendants — for "cousin" to make sense)
//   5. Cousin type contract (score / terpeneSimilarity / lineageDistance)
//   6. Score-cutoff = 0.05 (filters noise candidates before topN sort)
//   7. Doctrine refs (C7 / patent doc / WAC 314-55-155 cousin-copy
//      vocabulary rule)
//
// Run: pnpm test:all

import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(fileURLToPath(import.meta.url));
const SOURCE_PATH = join(HERE, "..", "cousin-finder.ts");
const SRC = readFileSync(SOURCE_PATH, "utf-8");

// ── Server-only barrier ─────────────────────────────────────────────

describe("cousin-finder.ts — server-only barrier", () => {
  test("imports `server-only` (scoring math + lineage graph must NOT bundle to client)", () => {
    assert.match(SRC, /^import "server-only";/m);
  });
});

// ── PATENT-TRACK anti-rot ──────────────────────────────────────────

describe("cousin-finder.ts — PATENT-TRACK comment markers", () => {
  test("header comment contains literal 'PATENT-TRACK' marker", () => {
    assert.match(SRC, /PATENT-TRACK/);
  });

  test("comment names the 3-part novel claim (this file owns part c — lineage-graph distance)", () => {
    // Combined with terpene-fingerprint.ts (a)+(b), the lineage-graph
    // shortest-path traversal completes the novel-combination claim.
    assert.match(SRC, /receipt-verified purchase weights/);
    assert.match(SRC, /per-customer multi-axis terpene-affinity vector/);
    assert.match(SRC, /lineage-graph shortest-path traversal/);
  });

  test("comment references docs/terpene-fingerprint.md (the patent posture doc)", () => {
    assert.match(SRC, /docs\/terpene-fingerprint\.md/);
  });

  test("comment forbids client-bundle exposure of the scoring shape", () => {
    // "Do NOT expose this scoring shape on the client bundle — keep
    // it inside Server Components and route handlers only."
    assert.match(SRC, /Do NOT expose this scoring shape on the client bundle/);
  });
});

// ── Cousin-score blend coefficients ────────────────────────────────

describe("cousin-finder.ts — cousinScore blend coefficients", () => {
  test("TERPENE_WEIGHT = 0.7 (Phase 4.3 Doug-decision; A/B candidate at 60-40 in Phase 5)", () => {
    // The 70/30 split favors terpene over lineage. Drift to 50/50
    // would silently change recommendations — testing here pins
    // until Phase 5 explicitly flips the ratio.
    assert.match(SRC, /^export const TERPENE_WEIGHT\s*=\s*0\.7;/m);
  });

  test("LINEAGE_WEIGHT = 0.3 (complement of TERPENE_WEIGHT)", () => {
    assert.match(SRC, /^export const LINEAGE_WEIGHT\s*=\s*0\.3;/m);
  });

  test("comment documents the formula: cousinScore = TERPENE × similarity + LINEAGE × (1/(1+distance))", () => {
    // The formula's shape — including the (1/(1+distance)) lineage
    // decay — is patent-track. Plain documentation drift could weaken
    // the novelty argument; pin the literal.
    assert.match(SRC, /cousinScore = TERPENE_WEIGHT × terpeneCosineSim/);
    assert.match(SRC, /LINEAGE_WEIGHT × \(1 \/ \(1 \+ shortestPathDistance\)\)/);
  });

  test("comment documents Phase 4.3 / Phase 5 calibration history (anchor for future re-balancing)", () => {
    assert.match(SRC, /Phase 4\.3/);
    assert.match(SRC, /Phase 5/);
    assert.match(SRC, /60-40/);
  });
});

// ── MAX_LINEAGE_DEPTH cap ──────────────────────────────────────────

describe("cousin-finder.ts — MAX_LINEAGE_DEPTH cap", () => {
  test("MAX_LINEAGE_DEPTH = 6 (great-great-great-grandparent territory)", () => {
    // Per file: "Hard cap on BFS depth — anything beyond 6 lineage hops
    // isn't a 'cousin' in any meaningful sense". Drift up to 10 would
    // surface distant ancestor strains as "cousins" — defeats the
    // intuition; users would say "that's not a cousin, that's a stranger."
    assert.match(SRC, /^export const MAX_LINEAGE_DEPTH\s*=\s*6;/m);
  });

  test("BFS function explicitly caps at MAX_LINEAGE_DEPTH (not a different literal)", () => {
    // The bfsShortestPaths function must reference the exported
    // constant — pinning a hardcoded 6 inline would let the export
    // drift without the BFS following.
    assert.match(SRC, /current\.depth >= MAX_LINEAGE_DEPTH/);
  });
});

// ── Score-cutoff threshold ─────────────────────────────────────────

describe("cousin-finder.ts — score-cutoff noise filter", () => {
  test("requires SOME signal — cousins with score < 0.05 are filtered out", () => {
    // File header: "Require SOME signal — either a lineage path or
    // non-trivial terpene overlap. Cousins with score < 0.05 are noise."
    // Drift up (e.g. 0.20) would over-filter (legit cousins disappear);
    // drift down (e.g. 0.001) would re-surface noise.
    assert.match(SRC, /if \(score < 0\.05\) continue;/);
  });
});

// ── BFS undirected-graph invariant ─────────────────────────────────

describe("cousin-finder.ts — BFS undirected-graph invariant", () => {
  test("comment explicitly justifies UNDIRECTED traversal (siblings + descendants both)", () => {
    // "Why undirected? Strain cousins are siblings + great-aunts + nephews —
    // not just descendants. The graph is structurally a family tree;
    // 'lineage distance' must traverse both up AND down to find cousins."
    //
    // Drift to directed (parent→child only) breaks the "cousin" intuition.
    // Pin the rationale comment.
    assert.match(SRC, /Why undirected\?/);
    assert.match(SRC, /traverse both up AND down/);
  });

  test("buildAdjacency adds edges in BOTH directions (child→parent + parent→child)", () => {
    // The undirected-graph invariant is enforced at adjacency-build
    // time — each edge gets inserted twice (one per direction).
    // Drift to single-direction insert breaks BFS cousin discovery.
    assert.match(SRC, /ensure\(childSlug\)\.add\(parentSlug\)/);
    assert.match(SRC, /ensure\(parentSlug\)\.add\(childSlug\)/);
  });

  test("adjCache is a WeakMap keyed by corpus reference (memoization invariant)", () => {
    // File: "Memoized via module-level cache keyed by corpus reference
    // identity." WeakMap lets GC reclaim when the strain corpus is no
    // longer reachable — drift to a regular Map would leak memory.
    assert.match(SRC, /const adjCache = new WeakMap/);
  });

  test("buildAdjacency excludes orphan-parent edges (defensive — both endpoints must exist in corpus)", () => {
    // "Only add edges where BOTH endpoints exist in the corpus —
    // otherwise BFS would visit orphan nodes that the radar/page can't render."
    assert.match(SRC, /Only add edges where BOTH endpoints exist in the corpus/);
  });
});

// ── Cousin type contract ───────────────────────────────────────────

describe("cousin-finder.ts — Cousin type contract", () => {
  test("exports Cousin type with slug + name + type + score + terpeneSimilarity + lineageDistance + anchorSlug", () => {
    assert.match(SRC, /^export type Cousin\s*=\s*\{/m);
    // Required fields per file definition:
    assert.match(SRC, /slug:\s*string;/);
    assert.match(SRC, /name:\s*string;/);
    assert.match(SRC, /score:\s*number;/);
    assert.match(SRC, /terpeneSimilarity:\s*number;/);
    assert.match(SRC, /lineageDistance:\s*number \| null;/);
    assert.match(SRC, /anchorSlug:\s*string;/);
  });

  test("score field documented as [0, 1] range (higher = closer cousin)", () => {
    assert.match(SRC, /Combined score in \[0, 1\]/);
    assert.match(SRC, /Higher = closer cousin/);
  });

  test("lineageDistance nullable when no path exists (separate from score=0)", () => {
    // null = "no path at all"; 0 distance shouldn't occur (anchor
    // excluded from candidates). UI uses null vs distance for "in
    // lineage" vs "terpene-only match" labeling.
    assert.match(SRC, /null = no path exists/);
  });
});

// ── findCousins function contract ──────────────────────────────────

describe("cousin-finder.ts — findCousins signature", () => {
  test("exports findCousins(anchorSlug, strainsBySlug, triedSlugs, topN=3)", () => {
    assert.match(SRC, /^export function findCousins\(/m);
    assert.match(SRC, /anchorSlug:\s*string,/);
    assert.match(SRC, /strainsBySlug:\s*Readonly<Record<string, Strain>>,/);
    assert.match(SRC, /triedSlugs:\s*ReadonlySet<string>,/);
    assert.match(SRC, /topN\s*=\s*3,/);
  });

  test("returns Cousin[] (NOT a single Cousin or nullable)", () => {
    assert.match(SRC, /\): Cousin\[\] \{/);
  });

  test("documented as PURE FUNCTION (no DB, no I/O)", () => {
    // The pure-function contract is what allows server-side caching
    // + future SSR optimization. Drift to async / DB-touching breaks
    // the page-level Promise.all parallelization assumed by callers.
    assert.match(SRC, /Pure function — no DB, no I/);
  });

  test("triedSlugs are EXCLUDED from candidates (the whole point of cousin recommendation)", () => {
    // "Set of slugs the customer has already purchased — these are
    // EXCLUDED from cousin candidates (the whole point is to recommend
    // strains they haven't tried)."
    assert.match(SRC, /already purchased[\s\S]{0,80}EXCLUDED/);
    assert.match(SRC, /if \(triedSlugs\.has\(slug\)\) continue;/);
  });
});

// ── findCousinsAcrossAnchors — dedup invariant ─────────────────────

describe("cousin-finder.ts — findCousinsAcrossAnchors dedup", () => {
  test("exports findCousinsAcrossAnchors (multi-anchor flat de-duped list)", () => {
    assert.match(SRC, /^export function findCousinsAcrossAnchors\(/m);
  });

  test("dedupes by cousin.slug — same cousin from 2 anchors keeps HIGHER score", () => {
    // "De-dupes — if the same cousin is surfaced from two different
    // anchors, keep the higher-scoring instance." Drift to "keep first"
    // would silently lose better signals; drift to "keep all" would
    // surface duplicate cards in the UI.
    assert.match(SRC, /keep the higher-scoring instance/i);
    // Implementation check:
    assert.match(SRC, /if \(!existing \|\| c\.score > existing\.score\)/);
  });

  test("returns flat-list ordered by score DESC (top cousins first)", () => {
    assert.match(SRC, /\.sort\(\(a, b\) => b\.score - a\.score\)/);
  });
});

// ── WAC 314-55-155 vocabulary rule ─────────────────────────────────

describe("cousin-finder.ts — WAC 314-55-155 cousin-copy vocabulary", () => {
  test("comment forbids 'similar effects' / 'treats the same condition' framing", () => {
    // File header: "cousin copy stays scent + flavor + lineage vocabulary.
    // Never 'similar effects' or 'treats the same condition' — always
    // 'shares the lineage and aromatic family of strains you've rated highly'."
    //
    // This is the WAC defense FOR THE PRESENTATION LAYER — drift here
    // would let UI copy slip into efficacy claims.
    assert.match(SRC, /Never "similar effects"/);
    assert.match(SRC, /treats the same condition/);
  });

  test("comment supplies the SAFE phrasing alternative for cousin-card copy", () => {
    assert.match(SRC, /shares the lineage and aromatic family/);
  });
});

// ── Doctrine references (anti-rot pins) ────────────────────────────

describe("cousin-finder.ts — doctrine references", () => {
  test("header references C7 of strain-tree innovation plan", () => {
    assert.match(SRC, /C7/);
    assert.match(SRC, /PLAN_STRAIN_TREE_INNOVATION_2026_05_21\.md/);
  });

  test("comment justifies the 'no caching' decision (~230 nodes × ~600 edges = trivial BFS)", () => {
    // "The graph is small (~230 nodes today, ~600 edges including
    // descendants), so BFS is O(V+E) and recomputation is trivial per
    // request. No caching is required to hit the <50ms latency target."
    //
    // Drift to "add a Redis cache" without updating this comment would
    // create stale-data risk for cousin recommendations.
    assert.match(SRC, /BFS is O\(V\+E\)/);
    assert.match(SRC, /<50ms latency target/);
  });
});
