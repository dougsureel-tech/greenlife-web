import type { Metadata } from "next";
import { auth } from "@clerk/nextjs/server";
import { getMenuProducts, getPickupEta, getActiveDeals } from "@/lib/db";
import { STORE, getOrderingStatus } from "@/lib/store";
import { OrderMenu } from "./OrderMenu";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Order for Pickup",
  description: `Order cannabis online for pickup at ${STORE.name}. Browse flower, edibles, vapes, concentrates and more. Pay cash in store.`,
  alternates: { canonical: "/order" },
  openGraph: {
    title: `Order for Pickup | ${STORE.name}`,
    description: `Pickup-ready cannabis menu in ${STORE.address.city}, WA. Cash in store, points on every order.`,
    url: `${STORE.website}/order`,
    type: "website",
  },
};

function minToLabel(min: number): string {
  const h24 = Math.floor(min / 60);
  const m = min % 60;
  const ampm = h24 >= 12 ? "PM" : "AM";
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, "0")} ${ampm}`;
}

export default async function OrderPage() {
  const [products, eta, { userId }, activeDeals] = await Promise.all([
    getMenuProducts().catch(() => []),
    getPickupEta().catch(() => ({ depth: 0, label: "Usually ready in under 10 min" })),
    auth(),
    getActiveDeals().catch(() => []),
  ]);
  const status = getOrderingStatus();
  const signedIn = !!userId;

  return (
    <>
      {/* Premium page header */}
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
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">Pickup Menu</p>
            <h1 className="text-3xl font-extrabold tracking-tight">Order for Pickup</h1>
            <p className="text-green-300/70 text-sm">
              Browse · Add to cart · Pick up &amp; pay cash · Earn points
            </p>
            {/* Best-staff positioning per Doug 2026-05-02 ("wenatchee wont be
                locally owned, hone in on best staff"). Single line under the
                pickup-flow recap so the page doesn't read as a faceless
                e-com surface. */}
            <p className="text-green-200/70 text-xs">
              Hand-picked by the best crew in Wenatchee — walk in or call us if you want backup.
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
                ⚡ {eta.label}
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 text-green-300/60">
              <span className="w-1 h-1 rounded-full bg-green-400/60" />
              Cash only · 21+ ID required
            </span>
          </div>
        </div>
      </div>
      <OrderMenu products={products} signedIn={signedIn} activeDeals={activeDeals} />
    </>
  );
}
