import Link from "next/link";

// StrainCard — SSoT presentational primitive for strain-library card
// renderings across the public site. Server Component (RSC): no client
// hooks, no fetches, no localStorage. Pure shape-in, JSX-out.
//
// Why this exists: prior to this ship, the V2 card-hierarchy layout
// (name → tagline → chip row of type + dominant terpene + THC range)
// existed verbatim across 2 call sites:
//   - app/strains/page.tsx (A-Z library grid, flipped-V2 branch)
//   - app/find-your-strain/result/page.tsx (quiz result cards)
// Same fields, same hover discipline, same focus rings, same WSLCB-
// safe voice (preference-observation; never causation). Refactor pulls
// the layout into ONE component so a future flip (chip ordering, a11y
// tweak, contrast bump) lands in 1 file, not N.
//
// Sister to feedback_copy_paste_template_amplifies_compliance_defects_
// 2026_05_26 — same failure mode the limonene-FAQ pin warned about:
// copy-pasted templates amplify defects N× across surfaces. Pulling
// the rendering into a primitive caps that risk at 1× by construction.
//
// OUT OF SCOPE: the "founder card" hero variant on /strains/families/
// [family] (different hierarchy: lineage line, "Founder strain" badge,
// verification metadata block, "Open {name} page →" CTA + hero size).
// Out of scope: FamilyStrainTile member-grid (lineage-line variant +
// inline anchor "· founder" eyebrow + no tagline + no chip row — 3
// orthogonal shape differences that would force `variant: "lineage"`
// + `lineageNote` + `isAnchor` flags that don't compose cleanly with
// the V2 hierarchy below). Both surfaces stay raw — if a separate
// primitive emerges (`<StrainFounderCard>` or `<StrainLineageTile>`)
// that's the right decomposition, NOT bloating this one.
//
// Round 2 (2026-05-28) added `variant: "compact"` for the partner-rail
// surface — same V2 hierarchy (chip row of type + terpene + THC + pill)
// but smaller font + tighter padding + line-clamp-1 tagline. The
// migration converges the partner cards onto the V2 hierarchy as a
// side-benefit (chip-style type vs prior eyebrow-dot-style — alignment
// with the rest of the site is the SSoT compound win).

/**
 * Type chip styling per shelf category — green=hybrid, red=sativa,
 * purple=indica, amber=cbd. Encodes the cannabis-counter convention.
 * Plain Tailwind classes so the consumer doesn't need to import
 * TYPE_LABELS separately.
 */
const TYPE_BADGES: Record<string, { label: string; chip: string; dot: string }> = {
  indica: { label: "Indica", chip: "bg-purple-50 text-purple-800", dot: "bg-purple-400" },
  sativa: { label: "Sativa", chip: "bg-red-50 text-red-800", dot: "bg-red-400" },
  hybrid: { label: "Hybrid", chip: "bg-green-50 text-green-800", dot: "bg-green-400" },
  cbd: { label: "CBD", chip: "bg-amber-50 text-amber-800", dot: "bg-amber-400" },
};

export type StrainCardProps = {
  /** Slug used to build the default link target (`/strains/<slug>`). */
  slug: string;
  /** Canonical display name, e.g. "Blue Dream". */
  name: string;
  /** Shelf category — drives chip color. */
  type: string;
  /**
   * Tagline — the V2 default-variant hierarchy contract assumes a
   * populated 1-sentence tagline. Callers that have strains with empty
   * taglines on the V2 hub should fall back to their own legacy
   * rendering (see app/strains/page.tsx for the pattern) rather than
   * passing "" here. Compact-variant callers may pass null when the
   * tagline is unavailable from their corpus — the tagline line is
   * rendered only when truthy.
   */
  tagline: string | null;
  /** Dominant terpene name (e.g. "Myrcene"). Omitted when absent. */
  dominantTerpene?: string | null;
  /** Typical THC range, e.g. "17–24%". Omitted when absent. */
  thcRange?: string | null;

  // ── Optional rendering knobs ─────────────────────────────────────────
  /**
   * Override the link target. Default is `/strains/<slug>`. The quiz
   * result page uses the default; future callers (e.g. a deep-linked
   * search rail) can override.
   */
  linkOverride?: string;
  /**
   * Hover/focus accent color — defaults to "green" (Wenatchee brand).
   * SCC sister-port passes "indigo" for Rainier Valley brand identity.
   * Tailwind requires class strings to be statically discoverable, so
   * this is a hard-keyed enum rather than a free string.
   */
  accent?: "green" | "indigo";
  /**
   * Optional right-side pill (e.g. match-confidence "Strong match" /
   * "Good match" / "General direction" on the quiz result page).
   * Renders to the right of the name header, aria-labeled by the
   * caller's choice of label. Omit on hub pages.
   */
  pill?: { label: string; chipClassName: string; ariaLabel?: string } | null;
  /**
   * Optional italic match-reason line below the chip row (quiz result
   * "Type + dominant terpene match" / "Type lean match"). Omit on hub
   * pages — adds visual noise when there's no provenance to explain.
   */
  matchReason?: string | null;
  /**
   * Heading level for the card title. Defaults to "h3" — the hub grids
   * use h2 for the section heading + h3 for each card. The quiz result
   * page also uses h2 → h3 hierarchy. Always renders as a heading for
   * a11y; type-checked enum so we can't accidentally break the
   * document outline.
   */
  headingLevel?: "h2" | "h3";
  /**
   * Visual size variant.
   *  - "default" (the V2 hub hierarchy): text-base/lg bold name +
   *    text-xs/sm leading-snug tagline + chip row. Used by the A-Z
   *    library grid and the quiz result page.
   *  - "compact": text-sm semibold name + text-xs line-clamp-1 tagline
   *    + tighter padding (px-4 py-3 instead of py-3.5). Used by the
   *    partner-rail surface on /strains/[slug] where each card is one
   *    of 5 in a multi-column grid below other content.
   *
   * Default = "default". This is intentionally a single binary axis
   * (size/density). Other axes (lineage line, founder badge, hero
   * size, verification metadata block) belong on a separate primitive
   * — bolting them onto this one would make the prop surface a
   * combinatorial god-component.
   */
  variant?: "default" | "compact";
};

/**
 * Single SSoT strain-card primitive.
 *
 * a11y discipline:
 *   - Card is a <Link>; <Link> renders as <a>, which is keyboard-
 *     focusable by default. Focus-visible ring matches accent.
 *   - Card title renders as a heading element (h2 or h3) — preserves
 *     the document outline so screen-reader users can navigate the
 *     card grid as a list of named items.
 *   - Type dot is `aria-hidden`; the chip-label text carries the
 *     semantic info.
 *   - Tap target: the entire card (px-4 py-3.5 padding on a min-1-line
 *     name + min-1-line tagline + 1-line chip row) clears ≥44px tap
 *     height comfortably.
 */
export function StrainCard({
  slug,
  name,
  type,
  tagline,
  dominantTerpene,
  thcRange,
  linkOverride,
  accent = "green",
  pill,
  matchReason,
  headingLevel = "h3",
  variant = "default",
}: StrainCardProps) {
  const href = linkOverride ?? `/strains/${slug}`;
  const typeBadge =
    TYPE_BADGES[type] ?? { label: type, chip: "bg-stone-100 text-stone-700", dot: "bg-stone-400" };

  // Accent-aware classes. Tailwind requires literal class strings, so
  // we branch rather than interpolate.
  const accentClasses =
    accent === "indigo"
      ? {
          border: "hover:border-indigo-500",
          ring: "focus-visible:ring-indigo-500",
          nameHover: "group-hover:text-indigo-800",
        }
      : {
          border: "hover:border-green-500",
          ring: "focus-visible:ring-green-500",
          nameHover: "group-hover:text-green-900",
        };

  // Variant-aware typography + padding. Tailwind requires literal class
  // strings so we branch rather than interpolate.
  const isCompact = variant === "compact";
  const padClass = isCompact ? "px-4 py-3" : "px-4 py-3.5";
  const nameClass = isCompact
    ? `text-sm font-semibold text-stone-900 ${accentClasses.nameHover} transition-colors`
    : `text-base sm:text-lg font-bold tracking-tight text-stone-900 ${accentClasses.nameHover} transition-colors`;
  const taglineClass = isCompact
    ? "mt-1 text-xs text-stone-600 line-clamp-1"
    : "mt-1 text-xs sm:text-sm text-stone-600 leading-snug";

  const Heading = headingLevel;

  return (
    <Link
      href={href}
      className={`group block h-full rounded-xl bg-white border border-stone-200 ${accentClasses.border} hover:shadow-sm transition-all ${padClass} focus:outline-none focus-visible:ring-2 ${accentClasses.ring}`}
    >
      <div className="flex items-start justify-between gap-2">
        <Heading className={nameClass}>{name}</Heading>
        {pill && (
          <span
            className={`shrink-0 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${pill.chipClassName}`}
            aria-label={pill.ariaLabel ?? `Match quality: ${pill.label}`}
          >
            {pill.label}
          </span>
        )}
      </div>
      {tagline && <p className={taglineClass}>{tagline}</p>}
      <div className="mt-2 flex flex-wrap items-center gap-1.5">
        <span
          className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${typeBadge.chip}`}
        >
          <span className={`inline-block w-1.5 h-1.5 rounded-full ${typeBadge.dot}`} aria-hidden="true" />
          {typeBadge.label}
        </span>
        {dominantTerpene && (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-emerald-50 text-emerald-700">
            {dominantTerpene}
          </span>
        )}
        {thcRange && (
          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide bg-stone-100 text-stone-700">
            Typical THC {thcRange}
          </span>
        )}
      </div>
      {matchReason && <div className="mt-2 text-[11px] text-stone-500 italic">{matchReason}</div>}
    </Link>
  );
}
