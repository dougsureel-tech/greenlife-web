import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getMenuProducts, getPickupEta, getActiveDeals } from "@/lib/db";
import { STORE, getOrderingStatus, todayCloseLabel, DEFAULT_OG_IMAGE } from "@/lib/store";
import { fetchClosureStatus } from "@/lib/closure-status";
import { getLoyaltyByClerkId } from "@/lib/portal";
import { ClosureBanner } from "@/components/ClosureBanner";
import { OrderMenu } from "../order/OrderMenu";

// /menu-preview = post-cutover preview surface. Renders the DEV TREE MENU
// (OrderMenu.tsx) inside the visual chrome that the post-cutover /menu
// would carry. Goal: Doug can visit this URL and SEE exactly what /menu
// becomes when he greenlights the single-flip cutover commit — without
// the actual cutover happening yet.
//
// Cutover guardrail compliance:
//   - /menu/page.tsx default render is STILL <JaneMenu> (per v36.325 guardrail)
//   - /menu-preview is a NEW route, additive only
//   - robots: noindex so /menu-preview never competes with /menu in SERPs
//   - When Doug greenlights, the cutover commit is: copy /menu-preview body
//     into /menu/page.tsx, delete JaneMenu + prewarmDutchieMenu + iHJ preconnect
//
// What's intentionally DIFFERENT from /menu/page.tsx:
//   - No JaneMenu (the iHJ Boost embed)
//   - No MenuFallback (it watched the iHJ embed for stall — N/A here)
//   - No prewarmDutchieMenu (warms iHJ edge cache — N/A here)
//   - No iHJ preconnect <link>s
//   - No CollectionPage / BreadcrumbList JSON-LD (those live on the canonical
//     /menu surface so they don't double-emit during preview)
//
// What's intentionally THE SAME as /menu/page.tsx:
//   - Hero band copy + statutory band ("Cash only · 21+")
//   - ClosureBanner wiring
//   - revalidate=60 (Live Menu means live)
//
// What's pulled from /order/page.tsx:
//   - Full OrderMenu data fetching (getMenuProducts + getPickupEta +
//     auth() + getActiveDeals + getOrderingStatus + getLoyaltyByClerkId)
//   - Premium hero band visual register (will likely consolidate at cutover)
//
// Per `MENU_MODEL_A_ARCHITECTURE_2026_05_16.md` Phase 1 § "ALLOWED Phase 1
// menu work" and `feedback_menu_cutover_guardrail_2026_05_16.md`.

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Menu Preview — Cutover-target render",
  description: `Preview surface for the post-cutover ${STORE.name} live menu. Not customer-indexed.`,
  alternates: { canonical: "/menu-preview" },
  // The whole point of preview is that customers + crawlers don't land
  // here. /menu remains the canonical live surface until Doug greenlights
  // the cutover. nofollow + noindex covers both axes.
  robots: { index: false, follow: false },
  openGraph: {
    siteName: STORE.name,
    locale: "en_US",
    title: `Menu Preview | ${STORE.name}`,
    description: "Internal preview of the post-cutover menu surface.",
    url: `${STORE.website}/menu-preview`,
    type: "website",
    images: [DEFAULT_OG_IMAGE],
  },
};

function minToLabel(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default async function MenuPreviewPage() {
  const [products, eta, { userId }, activeDeals, closure] = await Promise.all([
    getMenuProducts().catch(() => []),
    getPickupEta().catch(() => ({ depth: 0, label: "Usually ready in under 10 min" })),
    auth().catch(() => ({ userId: null as string | null })),
    getActiveDeals({ includeAppOnly: true }).catch(() => []),
    fetchClosureStatus({ revalidate: 60 }).catch(() => ({ isClosed: false, reason: null })),
  ]);
  const status = getOrderingStatus();
  const signedIn = !!userId;
  const initialLoyalty = userId
    ? await getLoyaltyByClerkId(userId)
        .then((s) => (s ? { points: s.points, tieredFlagOn: s.tieredFlagOn } : null))
        .catch(() => null)
    : null;

  return (
    <>
      {/* Preview banner — only on /menu-preview, NOT shipped to /menu post-cutover. */}
      <div className="bg-amber-100 border-b-2 border-amber-300 text-amber-900 px-4 py-3 text-sm font-semibold text-center">
        🚧 Cutover preview · this is what <span className="underline">/menu</span> becomes post-greenlight · iHJ Boost embed still serves <span className="underline">/menu</span> until Doug greenlights the atomic flip
      </div>
      {/* Premium page header — mirrors /order's hero band; will consolidate
          at cutover into /menu/page.tsx. */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-25"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 80% at 20% 50%, #4ade80, transparent)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1 space-y-2">
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">Live Menu</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Cannabis Menu — {STORE.address.city}</h1>
            <p className="text-green-300/70 text-sm">
              Real-time inventory · Pickup orders open daily 8 AM–{todayCloseLabel()} · Cash at the counter · 21+ with valid ID
            </p>
            <p className="text-green-200/70 text-xs">
              Hand-picked by the best crew in {STORE.address.city} — walk in or call us if you want backup.
            </p>
          </div>
          <div className="flex flex-col items-start sm:items-end gap-2 text-xs">
            {status.state === "open" && status.minutesUntilLastCall <= 60 && (
              <span className="inline-flex items-center gap-1.5 text-amber-300/90 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24] animate-pulse" />
                Last call in {status.minutesUntilLastCall} min · order by {minToLabel(status.lastCallMin)}
              </span>
            )}
            {status.state !== "open" && (
              <span className="inline-flex items-center gap-1.5 text-amber-300/90 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shadow-[0_0_4px_#fbbf24]" />
                {status.state === "before_open"
                  ? `Online ordering opens at ${status.opensAt}`
                  : status.state === "after_last_call"
                    ? `Online ordering closed · reopens at ${status.reopensAt}`
                    : `Online ordering closed · reopens at ${status.opensAt}`}
              </span>
            )}
            {status.state === "open" && (
              <span className="inline-flex items-center gap-1.5 text-green-200/95 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_4px_#4ade80] animate-pulse" />
                <span aria-hidden="true">⚡ </span>{eta.label}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-green-300/60">
              <span className="w-1 h-1 rounded-full bg-green-400/60" />
              Cash only · 21+ ID required
            </span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4">
        <ClosureBanner closure={closure} />
      </div>
      <OrderMenu products={products} signedIn={signedIn} activeDeals={activeDeals} initialLoyalty={initialLoyalty} />
    </>
  );
}
