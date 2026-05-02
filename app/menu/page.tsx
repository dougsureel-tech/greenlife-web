import type { Metadata } from "next";
import { STORE } from "@/lib/store";
import { JaneMenu } from "./JaneMenu";

// /menu = iHeartJane Jane Boost (iframeless) embed. Customer stays on
// greenlifecannabis.com — the Boost JS module hydrates the menu inline.
// Naive iframe is blocked (iHeartJane sets X-Frame-Options: SAMEORIGIN).
//
// Config + script tags live in JaneMenu.tsx; values were recovered from
// the WordPress site archive on web.archive.org (2026-01-12 snapshot).
// See also INCIDENTS.md (2026-05-01 entry) for the regression history.

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Cannabis Menu — Live Inventory",
  description: `Live cannabis menu at ${STORE.name} in ${STORE.address.city}, WA. Flower, pre-rolls, vapes, concentrates, edibles, tinctures, and topicals from 100+ Washington-state producers. Order ahead for cash pickup. 21+, ID required.`,
  alternates: { canonical: "/menu" },
  openGraph: {
    title: `Cannabis Menu | ${STORE.name}`,
    description: `Live cannabis menu — prices, THC/CBD, lab data. ${STORE.address.full}.`,
    url: `${STORE.website}/menu`,
    type: "website",
  },
};

// Wenatchee config recovered from the WP archive. embedConfigId is provisioned
// per-partner-store on iHeartJane's side; Seattle (5295) needs its own.
const IHEARTJANE_STORE_ID = 5294;
const IHEARTJANE_EMBED_CONFIG_ID = 234;

export default function MenuPage() {
  return (
    <div className="bg-stone-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-3">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-stone-900">Live Menu</h1>
        <p className="text-sm text-stone-600">
          Real-time inventory from {STORE.name}. Pickup orders open daily 8 AM–{STORE.hours[0]?.close ?? "9 PM"}. Cash only at the counter, 21+ with valid ID.
        </p>
      </div>
      <JaneMenu storeId={IHEARTJANE_STORE_ID} embedConfigId={IHEARTJANE_EMBED_CONFIG_ID} />
    </div>
  );
}
