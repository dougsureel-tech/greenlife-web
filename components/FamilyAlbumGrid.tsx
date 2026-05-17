// FamilyAlbumGrid — reusable tile grid for the 10 strain families.
//
// Renders on two surfaces:
//   1. `/strains/families` — standalone hub page (compact=false, all 10 tiles)
//   2. `/strains` family-tab panel — embedded in the hub (compact=true, smaller tiles)
//
// Each tile shows: family name + count + tagline + mini-tree thumbnail
// (anchor strain + up to 3 descendants). Type-color coded via anchor's
// strain.type so each family gets a visual identity inside the existing
// indica/sativa/hybrid color system.
//
// Per spec §3d. Server component. Zero JS.

import Link from "next/link";
import { STRAINS, buildLineageGraph } from "@/lib/strains";
import { STRAIN_FAMILIES, getFamilyCount } from "@/lib/strain-families";
import { FamilyMiniTree } from "@/components/FamilyMiniTree";

interface FamilyAlbumGridProps {
  /** Compact mode for embedding in the `/strains` family-tab panel.
   *  Defaults to false (full size, used on standalone /strains/families). */
  compact?: boolean;
}

/** Type-keyed accent palette — matches the anchor's strain.type so the
 *  card visually slots into the existing /strains/{indica,sativa,hybrid}
 *  color system. Landrace bucket has no single type → stone-neutral. */
const ACCENTS: Record<string, { eyebrow: string; chip: string; hover: string }> = {
  indica: {
    eyebrow: "text-indigo-700",
    chip: "bg-indigo-50 text-indigo-800 border-indigo-200",
    hover: "hover:border-indigo-400",
  },
  sativa: {
    eyebrow: "text-orange-700",
    chip: "bg-orange-50 text-orange-800 border-orange-200",
    hover: "hover:border-orange-400",
  },
  hybrid: {
    eyebrow: "text-emerald-700",
    chip: "bg-emerald-50 text-emerald-800 border-emerald-200",
    hover: "hover:border-emerald-400",
  },
  landrace: {
    eyebrow: "text-stone-600",
    chip: "bg-stone-100 text-stone-700 border-stone-300",
    hover: "hover:border-stone-400",
  },
};

export function FamilyAlbumGrid({ compact = false }: FamilyAlbumGridProps) {
  return (
    <ul
      className={`grid gap-4 sm:gap-5 ${
        compact
          ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
          : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
      }`}
    >
      {STRAIN_FAMILIES.map((fam) => {
        const anchor = fam.anchorSlug ? STRAINS[fam.anchorSlug] : null;
        const accentKey = anchor?.type ?? "landrace";
        const accent = ACCENTS[accentKey] ?? ACCENTS.landrace;
        const count = getFamilyCount(fam.slug);
        // Build a mini-graph: anchor at center + up to 2 parents + up to 3
        // most-descended children from the dataset's parent walk.
        const graph = anchor ? buildLineageGraph(anchor.slug) : null;
        const parents = graph?.parents.slice(0, 2) ?? [];
        const descendants = graph?.descendants.slice(0, 3) ?? [];

        return (
          <li key={fam.slug}>
            <Link
              href={`/strains/families/${fam.slug}`}
              className={`group flex h-full flex-col rounded-2xl bg-white border border-stone-200 ${accent.hover} hover:shadow-md transition-all p-5 sm:p-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500`}
            >
              <p
                className={`text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.16em] mb-2 ${accent.eyebrow}`}
              >
                {anchor ? `Founder: ${anchor.name}` : "Pre-modern shelf"}
              </p>
              <h3 className="text-lg sm:text-xl font-bold tracking-tight text-stone-900 group-hover:text-emerald-900 transition-colors mb-2">
                {fam.name}
              </h3>
              <p className="text-sm text-stone-600 leading-relaxed mb-3 line-clamp-3">
                {fam.tagline}
              </p>
              {!compact && anchor && (graph?.parents.length || graph?.descendants.length) ? (
                <div className="my-2 rounded-lg bg-stone-50 border border-stone-200 p-2">
                  <FamilyMiniTree
                    center={{ name: anchor.name, type: anchor.type, slug: anchor.slug }}
                    parents={parents.map((p) => ({
                      slug: p.slug,
                      name: p.name,
                      type: p.type,
                    }))}
                    descendants={descendants.map((d) => ({
                      slug: d.slug,
                      name: d.name,
                      type: d.type,
                    }))}
                    size="thumb"
                  />
                </div>
              ) : null}
              <div className="mt-auto flex items-center justify-between pt-3">
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${accent.chip}`}
                >
                  {count} strain{count === 1 ? "" : "s"}
                </span>
                <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:text-emerald-900">
                  See the line
                  <span aria-hidden="true">→</span>
                </span>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
