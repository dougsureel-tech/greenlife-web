import { NextResponse } from "next/server";
import { getActiveDeals } from "@/lib/db";

// Tiny public endpoint that returns just the top active deal (or null).
// Used by the mobile sticky CTA so it can light up with deal-aware copy
// without forcing a full server roundtrip on every visitor or making the
// root layout async (which would cost the SSR cache).
//
// 60s edge cache + stale-while-revalidate=300 — same posture as the
// /api/products/by-ids endpoint. Deals roll over by date so a 1-min
// cache is fine; the worst case is the bar showing yesterday's promo
// for a single minute past midnight.
export async function GET() {
  const deals = await getActiveDeals().catch(() => []);
  const top = deals[0]
    ? {
        id: deals[0].id,
        short: deals[0].short,
        endDate: deals[0].endDate,
      }
    : null;
  return NextResponse.json(
    { deal: top },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
