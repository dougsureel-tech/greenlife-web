import Link from "next/link";
import type { CrossStoreStockResult } from "@/lib/strain-stock-cross-store";
import { freshnessLabel } from "@/lib/strain-stock-cross-store";
import type { Strain } from "@/lib/strains";

// Cross-store stock widget — renders on /strains/[slug] right after the hero
// context strip + before the intro paragraph. Trigger: repeat-carry analysis
// found 224/250 corpus strains are ghost pages (page exists, no current
// stock); UX-expert URGENT pre-Google-indexation flag. Widget closes the gap
// with a cross-store visibility cue so a Wenatchee customer landing on a
// strain that's only at SCC sees that and vice versa.
//
// Server component. Data fetched in app/strains/[slug]/page.tsx via
// fetchCrossStoreStock() — both inv-App URLs probed in parallel, 5s timeout,
// graceful-null per store on failure. Widget shows "ask staff" fallback when
// both stores fail (defense-in-depth for a transient inv-App outage).
//
// WSLCB-safe shape: no $ figures, no medical-claim adjacency, no efficacy
// framing — strictly availability cues. Mirrors `seattle-cannabis-web/
// components/StrainStockWidget.tsx` with brand-accent swap (emerald → indigo).

export type StrainStockWidgetProps = {
  strain: Pick<Strain, "slug" | "name">;
  stock: CrossStoreStockResult;
  /** Which store this widget is rendering ON — controls which row reads
   *  "at this store" vs "at the other store". */
  thisStore: "wen" | "sea";
};

const STORE_ORDER: Array<"wen" | "sea"> = ["wen", "sea"];

export function StrainStockWidget({ strain, stock, thisStore }: StrainStockWidgetProps) {
  const both = STORE_ORDER.map((key) => stock[key]).filter(
    (r): r is NonNullable<typeof r> => r !== null,
  );

  // Graceful "ask staff" fallback — both stores' inv-App fetches failed (or
  // returned malformed). Pre-fix we'd render nothing at all; post-fix we
  // surface a calm "call us" cue so the customer still has a next action.
  if (both.length === 0) {
    return (
      <section
        aria-label={`Live stock for ${strain.name}`}
        className="max-w-3xl mx-auto px-4 pt-2 pb-4"
      >
        <div className="rounded-xl border border-stone-200 bg-white px-4 py-3 text-sm text-stone-700">
          <span className="font-semibold text-stone-900">Stock today:</span>{" "}
          Live availability isn&apos;t loading right now — call us at{" "}
          <a href="tel:+15096639980" className="underline decoration-stone-300 hover:decoration-stone-700">
            (509) 663-9980
          </a>{" "}
          and a budtender can check {strain.name} on the shelf.
        </div>
      </section>
    );
  }

  const anyHere = stock[thisStore]?.inStock === true;
  const otherKey: "wen" | "sea" = thisStore === "wen" ? "sea" : "wen";
  const otherHas = stock[otherKey]?.inStock === true;

  // Top-line headline copy — one short sentence that names the situation
  // upfront so a quick scan resolves "is this available?" before reading
  // the per-store rows.
  let headline: string;
  if (anyHere && otherHas) {
    headline = `${strain.name} is in stock at both stores today.`;
  } else if (anyHere) {
    headline = `${strain.name} is in stock at this store today.`;
  } else if (otherHas) {
    headline = `${strain.name} isn't on the shelf at this store today — it's available at our sister store.`;
  } else {
    // Both stores zero — check freshness for "just sold out" framing
    const here = stock[thisStore];
    const fresh = here ? freshnessLabel({ lastSeenAt: here.lastSeenAt, lastSoldAt: here.lastSoldAt }) : null;
    headline = fresh
      ? `${strain.name} just sold out (${fresh}) — check back soon.`
      : `${strain.name} isn't on the shelf at either store today.`;
  }

  return (
    <section
      aria-label={`Live stock for ${strain.name}`}
      className="max-w-3xl mx-auto px-4 pt-2 pb-4"
    >
      <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 px-4 py-3">
        <p className="text-sm font-semibold text-stone-900 mb-2">{headline}</p>
        <ul className="space-y-1.5 text-sm text-stone-700">
          {both.map((row) => {
            const isThis = row.store === thisStore;
            const fresh = freshnessLabel({ lastSeenAt: row.lastSeenAt, lastSoldAt: row.lastSoldAt });
            const labelPrefix = isThis ? "Here at" : "At";
            if (row.inStock && row.productCount > 0) {
              const productsLabel = row.productCount === 1 ? "1 product" : `${row.productCount} products`;
              return (
                <li key={row.store} className="flex items-start gap-2">
                  <span aria-hidden="true" className="mt-0.5">📍</span>
                  <span>
                    <span className="font-medium text-emerald-900">In stock</span>{" "}
                    {labelPrefix} <span className="font-semibold">{row.storeLabel}</span> ·{" "}
                    {productsLabel}
                    {!isThis && (
                      <>
                        {" · "}
                        <Link
                          href={`${row.publicMenuUrl}?q=${encodeURIComponent(strain.name)}`}
                          className="underline decoration-emerald-300 hover:decoration-emerald-700"
                        >
                          See it on the {row.storeLabel} menu →
                        </Link>
                      </>
                    )}
                  </span>
                </li>
              );
            }
            // Out-of-stock row — freshness signal when we have one
            return (
              <li key={row.store} className="flex items-start gap-2">
                <span aria-hidden="true" className="mt-0.5 opacity-60">·</span>
                <span className="text-stone-600">
                  {labelPrefix} <span className="font-semibold">{row.storeLabel}</span> ·{" "}
                  {fresh ? `restocking — last seen ${fresh}` : "not on the shelf right now"}
                </span>
              </li>
            );
          })}
        </ul>
        <p className="text-[11px] text-stone-500 mt-2">
          Live stock updates every few minutes. Call ahead if you want a budtender to set one aside.
        </p>
      </div>
    </section>
  );
}
