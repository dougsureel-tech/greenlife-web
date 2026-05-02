import { NextRequest, NextResponse } from "next/server";
import { getProductsByIds } from "@/lib/db";

// Public, read-only product lookup keyed by ID. Used by the home-page
// "Recently looking at" strip so it can hydrate localStorage IDs into
// real product cards without forcing the home server-render to ship the
// full menu (500+ products) to every visitor.
//
// Lean by design:
//  - Hard cap on requested IDs (16) so a malicious client can't fan
//    out the SELECT.
//  - Strict ID-shape filter (alphanumeric + dash/underscore) so we
//    don't pass arbitrary user input through to the SQL ANY(...) cast.
//  - 60s edge cache + stale-while-revalidate so the same ID set hits
//    the DB at most once a minute regardless of traffic.
export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("ids") ?? "";
  const ids = raw
    .split(",")
    .map((s) => s.trim())
    .filter((s) => /^[A-Za-z0-9_-]{1,64}$/.test(s))
    .slice(0, 16);

  if (ids.length === 0) return NextResponse.json({ products: [] });

  const products = await getProductsByIds(ids);
  return NextResponse.json(
    { products },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
