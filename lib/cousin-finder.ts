// Cousin-Finder — C7 of PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
//
// Given an "anchor" strain (one the customer has loved), returns the top-N
// "cousin" strains they haven't tried yet, ranked by a combined score:
//   cousinScore = TERPENE_WEIGHT × terpeneCosineSim
//               + LINEAGE_WEIGHT × (1 / (1 + shortestPathDistance))
//
// The shortest-path distance is computed over the lineage graph defined by
// STRAINS[*].parents — undirected, breadth-first (BFS). The graph is small
// (~230 nodes today, ~600 edges including descendants), so BFS is O(V+E)
// and recomputation is trivial per request. No caching is required to hit
// the <50ms latency target promised in the plan.
//
// PATENT-TRACK (see docs/terpene-fingerprint.md): the COMBINATION of
//   - receipt-verified purchase weights (lib/terpene-fingerprint.ts)
//   - per-customer multi-axis terpene-affinity vector (same)
//   - lineage-graph shortest-path traversal as recommendation distance
//     (this file)
// is the novel claim. Do NOT expose this scoring shape on the client bundle
// — keep it inside Server Components and route handlers only.
//
// FEATURE FLAG: All public consumers MUST check
//   process.env.TERPENE_FINGERPRINT_ENABLED === "true"
// before invoking these helpers in a render path.
//
// WAC 314-55-155: cousin copy stays scent + flavor + lineage vocabulary.
// Never "similar effects" or "treats the same condition" — always
// "shares the lineage and aromatic family of strains you've rated highly".

import "server-only";
import type { Strain } from "./strains";
import {
  strainTerpeneVector,
  terpeneCosineSimilarity,
} from "./terpene-fingerprint";

/** Default weights — terpene-heavy per plan's Doug-decision recommendation
 *  (70-30 split for Phase 4.3; A/B candidate at 60-40 in Phase 5). */
export const TERPENE_WEIGHT = 0.7;
export const LINEAGE_WEIGHT = 0.3;

/** Hard cap on BFS depth — anything beyond 6 lineage hops isn't a "cousin"
 *  in any meaningful sense (great-great-great-grandparent territory). */
export const MAX_LINEAGE_DEPTH = 6;

export type Cousin = {
  slug: string;
  name: string;
  type: Strain["type"];
  /** Combined score in [0, 1]. Higher = closer cousin. */
  score: number;
  /** Cosine similarity of terpene vectors in [0, 1]. */
  terpeneSimilarity: number;
  /** BFS hops over the lineage graph; null = no path exists. */
  lineageDistance: number | null;
  /** The anchor strain the customer rated highly. */
  anchorSlug: string;
};

/**
 * Find the top-N cousin strains for an anchor strain.
 *
 * Pure function — no DB, no I/O. Callers pass the strain corpus + the
 * "already tried" set so the caller controls personalization.
 *
 * @param anchorSlug  The strain the customer loved (e.g. their highest-rated).
 * @param strainsBySlug  Full strain corpus (typically `STRAINS` from lib/strains.ts).
 * @param triedSlugs  Set of slugs the customer has already purchased — these
 *                    are EXCLUDED from cousin candidates (the whole point is
 *                    to recommend strains they haven't tried).
 * @param topN  How many cousins to return.
 */
export function findCousins(
  anchorSlug: string,
  strainsBySlug: Readonly<Record<string, Strain>>,
  triedSlugs: ReadonlySet<string>,
  topN = 3,
): Cousin[] {
  const anchor = strainsBySlug[anchorSlug];
  if (!anchor) return [];

  const anchorVec = strainTerpeneVector(anchor);
  const distances = bfsShortestPaths(anchorSlug, strainsBySlug);

  const candidates: Cousin[] = [];
  for (const [slug, strain] of Object.entries(strainsBySlug)) {
    if (slug === anchorSlug) continue;
    if (triedSlugs.has(slug)) continue;

    const candidateVec = strainTerpeneVector(strain);
    const terpeneSim = terpeneCosineSimilarity(anchorVec, candidateVec);

    const distance = distances.get(slug) ?? null;
    const lineageScore = distance === null ? 0 : 1 / (1 + distance);

    const score = TERPENE_WEIGHT * terpeneSim + LINEAGE_WEIGHT * lineageScore;

    // Require SOME signal — either a lineage path or non-trivial terpene
    // overlap. Cousins with score < 0.05 are noise.
    if (score < 0.05) continue;

    candidates.push({
      slug,
      name: strain.name,
      type: strain.type,
      score,
      terpeneSimilarity: terpeneSim,
      lineageDistance: distance,
      anchorSlug,
    });
  }

  candidates.sort((a, b) => b.score - a.score);
  return candidates.slice(0, topN);
}

/**
 * Aggregate cousins across the customer's TOP-N anchor strains (their
 * top-rated picks). De-dupes — if the same cousin is surfaced from two
 * different anchors, keep the higher-scoring instance.
 *
 * Returns a flat list ordered by score DESC. The caller can group by
 * anchorSlug for display ("cousins of your Wedding Cake" / "cousins of
 * your Blue Dream") or render flat — both shapes are valid UX choices.
 */
export function findCousinsAcrossAnchors(
  anchorSlugs: readonly string[],
  strainsBySlug: Readonly<Record<string, Strain>>,
  triedSlugs: ReadonlySet<string>,
  topNPerAnchor = 3,
): Cousin[] {
  const byCousinSlug = new Map<string, Cousin>();
  for (const anchorSlug of anchorSlugs) {
    const cousins = findCousins(anchorSlug, strainsBySlug, triedSlugs, topNPerAnchor);
    for (const c of cousins) {
      const existing = byCousinSlug.get(c.slug);
      if (!existing || c.score > existing.score) {
        byCousinSlug.set(c.slug, c);
      }
    }
  }
  return Array.from(byCousinSlug.values()).sort((a, b) => b.score - a.score);
}

// ────────────────────────────────────────────────────────────────────────
// Lineage graph traversal — undirected BFS over parent + descendant edges.
// Pure function; no I/O.
// ────────────────────────────────────────────────────────────────────────

/**
 * Compute shortest-path distances from `sourceSlug` to every reachable
 * strain in the corpus, using both `parents` and reverse-`parents`
 * (descendant) edges. Returns a Map keyed by slug → hop count.
 *
 * Slugs unreachable within MAX_LINEAGE_DEPTH or via no path at all are
 * absent from the result.
 *
 * Why undirected? Strain cousins are siblings + great-aunts + nephews —
 * not just descendants. The graph is structurally a family tree;
 * "lineage distance" must traverse both up AND down to find cousins.
 */
function bfsShortestPaths(
  sourceSlug: string,
  strainsBySlug: Readonly<Record<string, Strain>>,
): Map<string, number> {
  const adj = buildAdjacency(strainsBySlug);
  const distances = new Map<string, number>();
  const queue: Array<{ slug: string; depth: number }> = [{ slug: sourceSlug, depth: 0 }];
  distances.set(sourceSlug, 0);

  while (queue.length > 0) {
    const current = queue.shift()!;
    if (current.depth >= MAX_LINEAGE_DEPTH) continue;
    const neighbors = adj.get(current.slug);
    if (!neighbors) continue;
    for (const next of neighbors) {
      if (distances.has(next)) continue;
      distances.set(next, current.depth + 1);
      queue.push({ slug: next, depth: current.depth + 1 });
    }
  }

  return distances;
}

/**
 * Build an undirected adjacency list from the strain corpus. Each edge
 * comes from a `parents` reference; we add both directions so BFS sees
 * sibling/cousin relationships natively.
 *
 * Result is the same for every call within a process lifetime — memoized
 * via module-level cache keyed by corpus reference identity.
 */
const adjCache = new WeakMap<object, Map<string, Set<string>>>();

function buildAdjacency(
  strainsBySlug: Readonly<Record<string, Strain>>,
): Map<string, Set<string>> {
  const cached = adjCache.get(strainsBySlug as object);
  if (cached) return cached;

  const adj = new Map<string, Set<string>>();
  function ensure(slug: string): Set<string> {
    let s = adj.get(slug);
    if (!s) {
      s = new Set<string>();
      adj.set(slug, s);
    }
    return s;
  }

  for (const [childSlug, strain] of Object.entries(strainsBySlug)) {
    if (!strain.parents) continue;
    for (const parentSlug of strain.parents) {
      if (!parentSlug) continue;
      // Only add edges where BOTH endpoints exist in the corpus —
      // otherwise BFS would visit orphan nodes that the radar/page can't render.
      if (!strainsBySlug[parentSlug]) continue;
      ensure(childSlug).add(parentSlug);
      ensure(parentSlug).add(childSlug);
    }
  }

  adjCache.set(strainsBySlug as object, adj);
  return adj;
}
