import "server-only";
import type { Strain, LineageGraph } from "./strains";
import type { MenuProduct } from "./db";

// Pure scoring helpers — match a product against a strain via name / lineage /
// terpene / type. Server-only (consumed by lib/db.ts's getStrainMatchedProducts).
// Mirror in seattle-cannabis-web/lib/strain-match.ts. Keep in sync.
//
// Spec: STRAIN_MENU_INTEGRATION_SPEC_2026_05_17.md §3.1 + §4. Doug greenlight
// 2026-05-17 — Path B (local Postgres) won over Path A (Algolia direct) per
// the spec agent's investigation (iHJ Algolia is currently CORS-rejected on
// new Vercel origins + active partner-relationship negotiation pending; local
// DB already has every field the spec needs via getMenuProducts shape).

export type MatchReason =
  | { kind: "exact"; matched: string }
  | { kind: "lineage-parent"; parentName: string }
  | { kind: "lineage-child"; childName: string }
  | { kind: "lineage-sibling"; viaParentName: string }
  | { kind: "terpene"; sharedTerpenes: string[] }
  | { kind: "type-only"; type: string };

export type ScoredProduct = {
  product: MenuProduct;
  score: number;
  reason: MatchReason;
};

/** Word-boundary lowercase substring — avoids "Blue" matching "Blueberry"
 *  and "OG" matching every OG variant. Skips needles shorter than 3 chars
 *  unless explicitly an alias. */
export function nameContains(haystack: string, needle: string): boolean {
  if (!needle || needle.length < 3) return false;
  const escaped = needle.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  const re = new RegExp(`\\b${escaped}\\b`, "i");
  return re.test(haystack);
}

/** Parse comma/semicolon-separated terpene text from products.terpenes column
 *  into a normalized lowercase array. The Inv-App sync may emit either format
 *  depending on upstream POS source. */
function parseTerpenes(s: string | null): string[] {
  if (!s) return [];
  return s
    .split(/[,;]/)
    .map((t) => t.trim().toLowerCase())
    .filter((t) => t.length > 0);
}

const TYPE_LABELS: Record<string, string> = {
  indica: "indica",
  sativa: "sativa",
  hybrid: "hybrid",
};

/** Score one product against one strain. Returns null if score < 3
 *  (pure type-only with no other signal = noise; we have hundreds of
 *  same-type products and can't show them all on every strain page). */
export function scoreProduct(
  product: MenuProduct,
  strain: Strain,
  graph: LineageGraph | null,
  strainsBySlug: Record<string, Strain>,
): ScoredProduct | null {
  // Defensive — products without an image render an ugly empty card.
  if (!product.imageUrl) return null;
  if (!product.name || product.name.length < 3) return null;

  let score = 0;
  let best: MatchReason | null = null;
  const productName = product.name;

  // +10 exact strain-name match
  if (nameContains(productName, strain.name)) {
    score += 10;
    best = { kind: "exact", matched: strain.name };
  }

  // +6 alias match (only if no exact match yet — aliases are weaker signal)
  if (!best) {
    for (const alias of strain.aliases ?? []) {
      if (nameContains(productName, alias)) {
        score += 6;
        best = { kind: "exact", matched: strain.name };
        break;
      }
    }
  }

  // +5 lineage parent
  if (graph) {
    for (const parent of graph.parents) {
      if (parent.name && nameContains(productName, parent.name)) {
        score += 5;
        if (!best || (best.kind !== "exact")) {
          best = { kind: "lineage-parent", parentName: parent.name };
        }
      }
    }
    // +5 lineage child (descendant)
    for (const child of graph.descendants) {
      if (child.name && nameContains(productName, child.name)) {
        score += 5;
        if (!best || (best.kind !== "exact" && best.kind !== "lineage-parent")) {
          best = { kind: "lineage-child", childName: child.name };
        }
      }
    }
    // +3 lineage sibling (shares a parent, downgraded label)
    for (const sibling of graph.siblings) {
      if (sibling.name && nameContains(productName, sibling.name)) {
        score += 3;
        // Find a shared-parent name for the label
        const sibStrain = strainsBySlug[sibling.slug];
        const sharedParentName =
          sibStrain?.parents?.find((p) => p && strain.parents?.includes(p))
            ? (graph.parents.find((gp) => gp.slug === sibStrain.parents?.find((p) => p && strain.parents?.includes(p)))?.name ?? "shared lineage")
            : "shared lineage";
        // Sibling label only wins if nothing stronger has been found yet
        // (sibling rank 3 — exact/parent/child are all stronger). Type
        // narrows `best` so this is the only valid override condition.
        if (!best) {
          best = { kind: "lineage-sibling", viaParentName: sharedParentName };
        }
      }
    }
  }

  // Terpene match — only if type matches (terpenes alone across types
  // surface confusing cross-effect picks). Cap +6 = 3 terps.
  const sharedTerpenes: string[] = [];
  if (product.strainType === strain.type && product.terpenes) {
    const productTerps = parseTerpenes(product.terpenes);
    for (const myT of strain.terpenes ?? []) {
      const tLower = myT.name.toLowerCase();
      if (productTerps.some((pt) => pt.includes(tLower))) {
        sharedTerpenes.push(myT.name);
      }
    }
    if (sharedTerpenes.length > 0) {
      score += Math.min(sharedTerpenes.length, 3) * 2;
      if (!best) {
        best = { kind: "terpene", sharedTerpenes: sharedTerpenes.slice(0, 3) };
      }
    }
  }

  // +1 type-only (fallback if nothing else matched)
  if (product.strainType === strain.type) {
    score += 1;
    if (!best) {
      best = { kind: "type-only", type: TYPE_LABELS[strain.type] ?? strain.type };
    }
  }

  // Drop pure-noise candidates (sum < 3 = no real signal)
  if (score < 3 || !best) return null;

  return { product, score, reason: best };
}

/** Normalize a product name for dedup-by-stem (drops weight/format prefixes
 *  like "1g - " / "3.5g - " / "28g - " — same regex pattern from JaneMenu.tsx
 *  alt-text scrubber). */
function nameStem(name: string): string {
  return name
    .replace(/^\d+(?:\.\d+)?\s*(?:g|mg|oz)\s*-\s*/i, "")
    .replace(/\s*-\s*\([A-Z]{1,3}\)\s*$/i, "")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}

/** Dedupe + rank scored products. Keeps the cheapest unit of each
 *  (brand, name-stem) group per Doug spec §4.3 weight-variant dedup. */
export function rankStrainMatches(
  scored: ScoredProduct[],
  opts: { limit: number },
): ScoredProduct[] {
  if (scored.length === 0) return [];

  // Dedupe by (brand, name-stem) — keep cheapest unit per group
  const byStem = new Map<string, ScoredProduct>();
  for (const s of scored) {
    const key = `${(s.product.brand ?? "").toLowerCase()}|${nameStem(s.product.name)}`;
    const existing = byStem.get(key);
    if (!existing) {
      byStem.set(key, s);
      continue;
    }
    // Prefer higher-score, then cheaper
    const existingPrice = existing.product.unitPrice ?? Infinity;
    const candidatePrice = s.product.unitPrice ?? Infinity;
    if (s.score > existing.score) {
      byStem.set(key, s);
    } else if (s.score === existing.score && candidatePrice < existingPrice) {
      byStem.set(key, s);
    }
  }

  const REASON_RANK: Record<MatchReason["kind"], number> = {
    exact: 0,
    "lineage-parent": 1,
    "lineage-child": 2,
    "lineage-sibling": 3,
    terpene: 4,
    "type-only": 5,
  };

  return Array.from(byStem.values())
    .sort((a, b) => {
      // 1. Reason rank (exact > lineage > terpene > type)
      const reasonDiff = REASON_RANK[a.reason.kind] - REASON_RANK[b.reason.kind];
      if (reasonDiff !== 0) return reasonDiff;
      // 2. Score desc
      if (a.score !== b.score) return b.score - a.score;
      // 3. New first
      if (a.product.isNew !== b.product.isNew) return a.product.isNew ? -1 : 1;
      // 4. Cheaper first (more accessible)
      const aP = a.product.unitPrice ?? Infinity;
      const bP = b.product.unitPrice ?? Infinity;
      return aP - bP;
    })
    .slice(0, opts.limit);
}

/** Resolve the displayed badge label per spec §4.4. Used by the
 *  StrainInStockSection component. */
export function renderReason(reason: MatchReason, strain: Strain): string {
  switch (reason.kind) {
    case "exact":
      return `✓ ${strain.name}`;
    case "lineage-parent":
      return `~ Parent: ${reason.parentName}`;
    case "lineage-child":
      return `~ Crosses to ${reason.childName}`;
    case "lineage-sibling":
      return `~ Shares ${reason.viaParentName} parent`;
    case "terpene":
      return `~ Same terps: ${reason.sharedTerpenes.slice(0, 2).join(", ")}`;
    case "type-only":
      return `~ Same ${reason.type}`;
  }
}
