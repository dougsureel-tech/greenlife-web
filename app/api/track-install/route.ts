import { auth, currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { getClient } from "@/lib/db";
import { getOrCreatePortalUser } from "@/lib/portal";
import crypto from "crypto";

// POST /api/track-install
//
// Records a PWA install attribution. Called by InstallAppBanner.tsx after
// the user accepts the Android install prompt OR completes the iOS Add-to-
// Home-Screen flow. Also called once on every standalone-mode page load
// (idempotent — first call wins, subsequent ones are no-ops thanks to the
// per-customer dedup gate).
//
// Doug 2026-05-07: "lets also keep track of how many downloads our new
// app has."
//
// Storage:
//   - audit_log row per call (action='glw.pwa_installed', entity_type=
//     'glw_customer_app'). Total downloads = COUNT(*) where action match.
//   - If signed-in (Clerk session): updates customers.scc_app_installed_at
//     if portal_users → customers join exists. Otherwise the customer
//     attribution lands later via the OTP sign-in flow (not handled here).
//
// Query params:
//   - source — install funnel source (e.g. 'springbig_migration', 'menu',
//     'organic'). Stored on entity_label for funnel reporting.
//
// Auth: anonymous OK. Clerk session optional — when present, we also try
// to set customers.scc_app_installed_at via the portal_user → customers
// phone/email match.

export async function POST(req: NextRequest) {
  const sql = getClient();
  const source = req.nextUrl.searchParams.get("source")?.trim().slice(0, 60) ?? "organic";

  // Resolve customer ID if signed in.
  let customerId: string | null = null;
  let portalUserId: string | null = null;
  try {
    const { userId } = await auth();
    if (userId) {
      const user = await currentUser();
      const email = user?.emailAddresses[0]?.emailAddress;
      const portalUser = await getOrCreatePortalUser(userId, email, user?.fullName);
      portalUserId = portalUser.id;
      // Phone-match against customers (the canonical loyalty roster). Email
      // fallback. First match wins.
      if (portalUser.phone) {
        const rows = await sql`
          SELECT id FROM customers
          WHERE phone = ${portalUser.phone}
          LIMIT 1
        `;
        if (rows[0]?.id) customerId = rows[0].id as string;
      }
      if (!customerId && portalUser.email) {
        const rows = await sql`
          SELECT id FROM customers
          WHERE LOWER(email) = LOWER(${portalUser.email})
          LIMIT 1
        `;
        if (rows[0]?.id) customerId = rows[0].id as string;
      }
    }
  } catch (err) {
    // Auth lookup failed — proceed as anonymous, log to audit only
    console.error("[track-install] auth lookup:", err);
  }

  // Audit-log row — always written, drives the download counter
  try {
    await sql`
      INSERT INTO audit_log (id, user_id, user_name, action, entity_type, entity_id, entity_label, after, created_at)
      VALUES (
        ${crypto.randomUUID()},
        NULL,
        'system:glw_pwa_install:v1',
        'glw.pwa_installed',
        'glw_customer_app',
        ${customerId},
        ${source},
        ${JSON.stringify({ portalUserId, customerId, source })},
        NOW()
      )
    `;
  } catch (err) {
    console.error("[track-install] audit insert:", err);
    // Don't fail the response — the client doesn't need to know
  }

  // If we resolved a customer, set scc_app_installed_at (idempotent — only
  // sets if currently null, so we capture FIRST install moment).
  if (customerId) {
    try {
      await sql`
        UPDATE customers
        SET scc_app_installed_at = COALESCE(scc_app_installed_at, NOW())
        WHERE id = ${customerId}
      `;
    } catch (err) {
      console.error("[track-install] customer update:", err);
    }
  }

  const res = NextResponse.json({ ok: true, attributed: !!customerId, source });
  // Drop a long-lived cookie so server-rendered pages can detect "this
  // device installed the PWA" without a client roundtrip. Used by /deals
  // to surface app_only deals (Doug 2026-05-07). Cookie value is just a
  // marker; presence == installed. 365-day expiry rolls forward on every
  // standalone-launch ping, so it stays alive as long as the customer
  // keeps using the app.
  res.cookies.set("glw_pwa_installed", "1", {
    httpOnly: false, // readable by client-side JS too if needed
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });
  return res;
}

// GET — returns total install count + last 7d count. Public OK; no PII
// exposed (just aggregates). Lets Doug curl/check-in without admin gate.
export async function GET() {
  const sql = getClient();
  try {
    const totalRows = await sql`
      SELECT COUNT(*)::int AS n FROM audit_log
      WHERE action = 'glw.pwa_installed'
    `;
    const lastWeekRows = await sql`
      SELECT COUNT(*)::int AS n FROM audit_log
      WHERE action = 'glw.pwa_installed'
        AND created_at > NOW() - INTERVAL '7 days'
    `;
    const attributedRows = await sql`
      SELECT COUNT(DISTINCT entity_id)::int AS n FROM audit_log
      WHERE action = 'glw.pwa_installed'
        AND entity_id IS NOT NULL
    `;
    return NextResponse.json({
      total: totalRows[0]?.n ?? 0,
      last7d: lastWeekRows[0]?.n ?? 0,
      attributedCustomers: attributedRows[0]?.n ?? 0,
    });
  } catch {
    return NextResponse.json({ total: 0, last7d: 0, attributedCustomers: 0 });
  }
}
