import Link from "next/link";
import { STRAINS } from "@/lib/strains";
import type { CoPurchasePartner } from "@/lib/strain-co-purchase-fetch";

// Customer-facing strain co-purchase rail. Phase 2 Ship 2.4 of the Strain
// Tree arc (sister of the admin Markov dashboard at /admin/reports/
// strain-co-purchase, Phase 1B.3, v428.5205).
//
// Renders below StrainInStockSection + above the FAQ on /strains/[slug]. The
// rail surfaces the top 5 partner strains by lift > 1.0 from THIS store's
// basket-level Markov data. Each partner card: name + type chip + tagline
// (one line) + link to that strain page.
//
// Voice: "People who pick {strain_name} also reach for these" — PATTERN
// observation (preference-as-fact about past customer behavior), NOT effect
// claim. WSLCB 314-55-155 safe — no causation framing, no medical adjacency,
// no efficacy verbs. Mirrors the verb-of-preference rubric from
// STRAIN_COPY_VOICE_RUBRIC_2026_05_15.md.
//
// Honest empty-state contract: when fewer than 2 partners survive (insufficient
// basket signal, all partners fell below lift floor, transient API failure),
// renders NOTHING. No "1 partner" lonely-card state. No "insufficient data"
// placeholder. No "loading" skeleton. The page simply doesn't show the rail
// for strains that haven't accumulated enough basket signal yet — which is
// honest: the math isn't ready, so we don't pretend it is.
//
// Privacy: no customer counts, no purchase frequencies, no transaction IDs
// surfaced to customers. Pure strain-pair surfacing — same data the admin
// dashboard renders, but with the operator-only fields (basket count, lift
// value, confidence) stripped before display.

export type StrainCoPurchaseRailProps = {
  /** Anchor strain — the strain whose page is being rendered. */
  anchorName: string;
  /** Partners as returned by the inv-App endpoint. May be empty. */
  partners: CoPurchasePartner[];
};

// Type-color dot palette — same emerald/violet/red/sky palette the strain
// page hero context strip uses. Keeps the type signal consistent across the
// page.
const TYPE_DOT_CLASS: Record<string, string> = {
  indica: "bg-purple-400",
  sativa: "bg-red-400",
  hybrid: "bg-green-400",
};

const TYPE_LABEL: Record<string, string> = {
  indica: "Indica",
  sativa: "Sativa",
  hybrid: "Hybrid",
};

export function StrainCoPurchaseRail({
  anchorName,
  partners,
}: StrainCoPurchaseRailProps) {
  // Suppress display when fewer than 2 partners — avoids the awkward
  // "1 partner" lonely state. The honest empty-state contract: render
  // nothing rather than render something misleading.
  if (!partners || partners.length < 2) return null;

  // Cap at 5 — voice TTS / mobile scroll friendly. The inv-App endpoint
  // already caps at TOP_N_PARTNERS_PER_STRAIN (5) but defense-in-depth
  // against a future endpoint change pushing more.
  const displayPartners = partners.slice(0, 5);

  // Look up each partner's tagline from the public-site STRAINS corpus.
  // Partners whose slug isn't in the corpus get a graceful fallback that
  // omits the tagline rather than rendering "undefined". (The inv-App
  // matcher's strain-index is the SoT for the data corpus; if a slug is
  // returned by the API that isn't yet in the public-site STRAINS map,
  // the card still renders without the tagline.)
  const enrichedPartners = displayPartners.map((p) => {
    const corpus = STRAINS[p.slug];
    return {
      ...p,
      tagline: corpus?.tagline ?? null,
    };
  });

  return (
    <section
      aria-labelledby="co-purchase-rail-heading"
      className="max-w-3xl mx-auto px-4 pb-12"
    >
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-700 mb-2">
        On the same receipt
      </p>
      <h2
        id="co-purchase-rail-heading"
        className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900 mb-2"
      >
        People who pick {anchorName} also reach for these
      </h2>
      <p className="text-sm text-stone-600 mb-4">
        Drawn from real basket patterns at the shop — strains regulars tend to
        grab on the same trip.
      </p>
      <nav
        aria-label={`Other strains often picked with ${anchorName}`}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3"
      >
        {enrichedPartners.map((p) => (
          <Link
            key={p.slug}
            href={`/strains/${p.slug}`}
            className="rounded-xl border border-stone-200 bg-white hover:border-stone-400 hover:shadow-sm transition-all px-4 py-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
          >
            <div className="flex items-center gap-1.5 mb-1">
              <span
                aria-hidden="true"
                className={`inline-block h-2 w-2 rounded-full ${TYPE_DOT_CLASS[p.type] ?? "bg-stone-400"}`}
              />
              <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-600">
                {TYPE_LABEL[p.type] ?? p.type}
              </span>
            </div>
            <div className="text-sm font-semibold text-stone-900 group-hover:underline">
              {p.name}
            </div>
            {p.tagline && (
              <div className="text-xs text-stone-600 mt-0.5 line-clamp-1">
                {p.tagline}
              </div>
            )}
          </Link>
        ))}
      </nav>
    </section>
  );
}
