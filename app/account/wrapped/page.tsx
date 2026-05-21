import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

import {
  CURRENT_WRAPPED_YEAR,
  getPreviewRecap,
  getWrappedRecap,
  isWrappedEnabled,
} from "@/lib/wrapped";
import { STORE } from "@/lib/store";
import { WrappedShareCard } from "@/components/WrappedShareCard";
import { WrappedReveal } from "@/components/WrappedReveal";

// `/account/wrapped` — annual Spotify-Wrapped-class recap.
//
// Plan: /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md §C1.
//
// Surface lifecycle:
//   - Feature-flagged via WRAPPED_ENABLED=true on Vercel.
//   - When flag is OFF: page is 404 EXCEPT when ?preview=1 is present
//     (Doug + Kat + Austin can sanity-check the render pre-flip).
//   - When flag is ON: signed-in customers see their personal recap;
//     signed-out customers get redirected to sign-in with redirect_url
//     back here.
//
// Mock-data mode:
//   - Until receipt-verified-purchase + strain-reviews infra ships
//     (Phase 1 strain pages V2), every render uses the fixture from
//     `lib/wrapped-mock-data.ts`. Real-data wiring is a 1-line swap in
//     `lib/wrapped.ts`.

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  // Drop the brand from the body — title.template at app/layout.tsx
  // appends "| Green Life Cannabis" automatically. Without this drop
  // the SERP/tab title would read "...| Green Life Cannabis | Green Life
  // Cannabis" (brand twice) per the check-duplicate-brand-title
  // gate at scripts/check-duplicate-brand-title.mjs.
  title: `Year ${CURRENT_WRAPPED_YEAR} in Strains`,
  description: `Your personal Year-${CURRENT_WRAPPED_YEAR} recap — top strains, top family, and your aroma palette.`,
  robots: { index: false, follow: false },
};

type Props = {
  searchParams: Promise<{ preview?: string; year?: string }>;
};

export default async function WrappedPage({ searchParams }: Props) {
  const { preview, year: yearParam } = await searchParams;
  const previewMode = preview === "1" || preview === "true";
  const enabled = isWrappedEnabled();

  // Flag OFF + no preview query → page does not exist.
  if (!enabled && !previewMode) {
    notFound();
  }

  const year = (() => {
    const parsed = Number.parseInt(yearParam ?? "", 10);
    if (Number.isFinite(parsed) && parsed >= 2020 && parsed <= 2099) {
      return parsed;
    }
    return CURRENT_WRAPPED_YEAR;
  })();

  // In preview mode we don't require a Clerk session — Doug eyes the
  // mock fixture render before the customer-facing flip.
  if (previewMode) {
    const recap = getPreviewRecap();
    return <WrappedSurface recap={recap} storeName={STORE.name} previewBanner />;
  }

  // Real-customer path (flag ON only — guarded above).
  const { userId } = await auth();
  if (!userId) {
    redirect(`/sign-in?redirect_url=/account/wrapped`);
  }

  const user = await currentUser();
  const displayName =
    user?.firstName ?? user?.fullName ?? user?.username ?? "Friend of the shop";

  const recap = await getWrappedRecap(userId, year, {
    preview: false,
    displayName,
  });

  if (!recap) {
    return <WrappedEmptyState storeName={STORE.name} year={year} />;
  }

  return <WrappedSurface recap={recap} storeName={STORE.name} />;
}

function WrappedSurface({
  recap,
  storeName,
  previewBanner = false,
}: {
  recap: ReturnType<typeof getPreviewRecap>;
  storeName: string;
  previewBanner?: boolean;
}) {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-16">
      {previewBanner ? (
        <div className="mb-6 rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-900">
          Preview render · Mock data. Flip <code className="font-mono">WRAPPED_ENABLED=true</code>{" "}
          in Vercel env to ship the customer-facing surface.
        </div>
      ) : null}

      <WrappedReveal>
        <WrappedShareCard recap={recap} storeName={storeName} />

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <a
            href={`/api/wrapped/share-card?year=${recap.year}&shape=portrait`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-800"
          >
            Download IG story (1080×1920)
          </a>
          <a
            href={`/api/wrapped/share-card?year=${recap.year}&shape=square`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-800 transition hover:bg-emerald-50"
          >
            Download square (1080×1080)
          </a>
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:bg-stone-50"
          >
            Back to my account
          </Link>
        </div>

        <p className="mt-6 max-w-2xl text-xs text-stone-500">
          Every stat above is built from your receipt history at {storeName}. Share
          only what you want shared — the share-card download is yours to post or
          keep private.
        </p>
      </WrappedReveal>
    </main>
  );
}

function WrappedEmptyState({
  storeName,
  year,
}: {
  storeName: string;
  year: number;
}) {
  return (
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center shadow-sm sm:p-12">
        <div className="text-xs font-bold uppercase tracking-[0.3em] text-emerald-700">
          {storeName} · Year {year} in Strains
        </div>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-stone-900 sm:text-4xl">
          Your {year} recap is brewing.
        </h1>
        <p className="mt-3 text-base text-stone-600">
          We build your Year-in-Strains card from your visits across the
          calendar year. Come back in mid-December — your card will be waiting.
        </p>
        <div className="mt-6">
          <Link
            href="/account"
            className="inline-flex items-center gap-2 rounded-full bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            Back to my account
          </Link>
        </div>
      </div>
    </main>
  );
}
