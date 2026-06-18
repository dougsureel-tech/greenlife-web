// /account/tree-growth — C2 of
// /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
//
// Customer-facing surface for the 15-second time-lapse share video.
// Mounts at /account/tree-growth as the plan specifies.
//
// Feature flag: TREE_TIMELAPSE_ENABLED. Default OFF — surface returns
// notFound() when unset so it's invisible until Doug flips it on per
// Vercel env in scc + glw projects.
//
// Mock-data mode: reads from lib/tree-timelapse-mock until verified-
// purchase ships in Phase 1A of strain-pages-V2. The one-line swap
// recipe is documented inside lib/tree-timelapse-mock.ts.
//
// WAC posture: process + experience vocabulary only. Customer's
// display name on share card, no photos of people, no efficacy claims.

import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { getPortalUserForRequest } from "@/lib/portal-request";
import {
  buildTimelapseFrames,
  type PurchaseTimelineEntry,
} from "@/lib/tree-timelapse";
import { mockPurchaseTimeline } from "@/lib/tree-timelapse-mock";
import { TreeTimelapseExporter } from "@/components/TreeTimelapseExporter";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Strain Journey",
  // 21+ regulated surface + customer-personal data — keep out of indexes.
  robots: { index: false, follow: false },
};

export default async function TreeGrowthPage({
  searchParams,
}: {
  searchParams: Promise<{ preview?: string }>;
}) {
  // ?preview=1 escape — sister of wrapped page's preview pattern (v38.345).
  // Doug eyes mock-fixture render before flipping the customer-facing flag.
  // Middleware (proxy.ts) exempts ?preview=1 from Clerk auth.protect();
  // the in-page Clerk check below is also skipped in preview mode.
  const { preview } = await searchParams;
  const previewMode = preview === "1" || preview === "true";

  // Feature-flag gate FIRST — Doug-flipped per Vercel env, default OFF.
  // Preview-mode escape lets Doug see the page even when the flag is OFF.
  if (process.env.TREE_TIMELAPSE_ENABLED !== "true" && !previewMode) {
    notFound();
  }

  // Customer-only surface. Pass current path as ?redirect_url so
  // post-sign-in lands them back here — matches the /account guard
  // shape in /app/account/page.tsx + /app/account/orders/page.tsx
  // (sister of the safe-redirect pattern from v29.065).
  // In preview mode, skip the Clerk session check + portal-user lookup;
  // render anonymously with a neutral "preview" display name.
  let portalDisplayName = "Friend of the shop";
  if (!previewMode) {
    const { user: portalUser } = await getPortalUserForRequest();
    if (!portalUser) redirect("/sign-in?redirect_url=/account/tree-growth");

    portalDisplayName = portalUser.name ?? "Friend of the shop";
  }

  // Mock-data mode — see lib/tree-timelapse-mock for the swap recipe.
  // When verified-purchase ships, this line becomes:
  //   const timeline = await getCustomerPurchaseTimeline(portalUser.id);
  const timeline: readonly PurchaseTimelineEntry[] = mockPurchaseTimeline();
  const sequence = buildTimelapseFrames(timeline, { durationSec: 15 });

  // Display-name resolution mirrors the welcome-email + LoyaltyCard
  // pattern — Clerk first, then portal_users.name, then a neutral
  // fallback. Never PII-leak the email address. In preview mode the
  // portalDisplayName was set above without touching Clerk.
  const displayName = previewMode
    ? portalDisplayName.split(/\s+/)[0]
    : (portalDisplayName.split(/\s+/)[0] || "friend");

  const visitCount = timeline.length;
  const distinctStrainCount = sequence.nodes.length;

  return (
    <main className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href="/account"
          className="text-sm text-emerald-300 hover:text-emerald-200 underline-offset-2"
        >
          ← Back to your account
        </Link>
      </div>

      <header className="mb-6">
        <h1 className="text-3xl font-bold text-white mb-2">Your strain journey</h1>
        <p className="text-slate-300">
          A 15-second time-lapse of the strains you've tried at Green Life Cannabis,
          filling in chronologically by purchase date. Built from your receipt-verified
          history — share it however you like.
        </p>
      </header>

      <section aria-label="Tree-growth animation and export controls">
        <TreeTimelapseExporter
          displayName={displayName}
          yearRange={sequence.yearRange}
          visitCount={visitCount}
          distinctStrainCount={distinctStrainCount}
        />
      </section>

      <section className="mt-10 rounded-lg border border-emerald-500/20 bg-slate-950/40 p-4 text-sm text-slate-300">
        <h2 className="font-semibold text-emerald-200 mb-2">What's this?</h2>
        <p className="mb-2">
          Every strain you've bought here lights up on the tree in the order you tried it.
          Strains you came back to grow a little each time you visit. The tree IS the share
          card — open the share view above and screen-record from your phone, or use the
          Download button to save a video to your device.
        </p>
        <p className="opacity-80">
          Preview-mode runs from a sample purchase history while we finish wiring real
          purchase data. The look + feel matches the final shipping render — only the
          underlying purchase list will swap.
        </p>
      </section>

      <p className="mt-6 text-xs text-slate-500">
        WA state · 21+ only · process and experience only ·
        no medical or efficacy claims · WAC 314-55-155 compliant
      </p>
    </main>
  );
}
