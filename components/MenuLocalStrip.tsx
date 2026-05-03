import Link from "next/link";
import { STORE } from "@/lib/store";
import { withAttr } from "@/lib/attribution";

// Compact "Serving the Wenatchee Valley" strip — drops in below the
// /menu Boost embed (or above MenuFallback when that fires) so the
// geo-cohort signal that drives the homepage hero is also visible to
// customers who deep-link straight to /menu.
//
// Doug 2026-05-02: ties the front page and /menu so they flow as one
// brand surface, not "homepage marketing → third-party embed cliff".
//
// Pulls from `STORE.nearbyTowns` — the same array that drives:
//   - homepage town card grid (TownCardLink)
//   - LocalBusiness areaServed JSON-LD (root layout.tsx)
//   - metadata description on home + per-town SEO meta
// One source of truth across all three surfaces; renaming a town
// here doesn't propagate to the menu strip — both read STORE.
//
// Keeps the visual register calm: thin pill row for towns + drive-min
// callout, single CTA back to "Visit us" so customers landing here
// from a town SEO landing page get a path to address + map.

export function MenuLocalStrip() {
  return (
    <section
      aria-labelledby="menu-local-heading"
      className="bg-white border-y border-stone-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-9">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
          <div className="space-y-2">
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-green-700">
              Serving the Wenatchee Valley
            </p>
            <h2
              id="menu-local-heading"
              className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight"
            >
              Pickup is fastest from anywhere in NCW.
            </h2>
            <p className="text-sm text-stone-600 max-w-2xl leading-relaxed">
              Order ahead on the menu, swing by {STORE.address.full}, hand the
              budtender your name + ID. Cash only. Most pickups are out the
              door in under 5 minutes.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 lg:max-w-md lg:justify-end">
            {STORE.nearbyTowns.map((t) => (
              <span
                key={t.id}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700"
              >
                {t.name}
                <span className="text-green-700/80 tabular-nums">
                  {t.driveMin === 0 ? "in town" : `${t.driveMin} min`}
                </span>
              </span>
            ))}
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3 text-xs">
          <Link
            href={withAttr("/visit", "menu", "local-strip-visit")}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-700 hover:bg-green-600 text-white font-semibold transition-colors"
          >
            See address + parking
          </Link>
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-200 hover:border-green-300 hover:bg-green-50 text-stone-700 hover:text-green-800 font-semibold transition-all"
          >
            Open in Google Maps ↗
          </a>
          <span className="text-stone-500">
            Open daily · Cash only · 21+ with valid ID
          </span>
        </div>
      </div>
    </section>
  );
}
