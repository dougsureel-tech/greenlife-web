import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getClient } from "@/lib/db";
import {
  firstNameLastInitial,
  resolveFollowerTierFromCount,
  tierBadgeEmoji,
  type FollowerTier,
} from "@/lib/ambassador-apply";

// /community/ambassadors — Phase G public ambassador leaderboard.
//
// Per PLAN_AMBASSADOR_V0_2_INFLUENCER_REACH_2026_05_23.md §3 Phase G:
//   "Public-facing page on greenlifecannabis.com + seattlecannabis.co
//    listing approved ambassadors with their handle + tier badge + most-
//    recent-featured-content."
//
// Privacy posture:
//   - Only renders users with ambassador_public_listing_opt_in = true
//   - First name + last initial only ("Sarah K.")
//   - departed_at IS NULL gates inactive ambassadors out
//   - Ordered by thanked_by_name_count DESC, then created_at ASC
//
// Compliance: cannabis advertising under WSLCB. Surface carries the
// site-wide age-gate (already mounted in app/layout.tsx — same gate as
// /menu) + a top-of-page 21+ stripe.
//
// Doctrine: cannabis-web reads the per-store Neon DB directly via
// getClient() — same pattern as /api/heroes + /api/community/upload-video.
// Sister-mirrored in seattle-cannabis-web. STORE.* substitutions cover
// per-stack branding.

export const metadata: Metadata = {
  title: { absolute: `Our Ambassadors · ${STORE.name}` },
  description: `Meet the creators sharing their ${STORE.name} story. Opt-in public list of approved Ambassador Program participants.`,
  alternates: { canonical: "/community/ambassadors" },
  openGraph: {
    siteName: STORE.name,
    type: "website",
    locale: "en_US",
    title: `Our Ambassadors · ${STORE.name}`,
    description: `Meet the creators sharing their story.`,
    url: `${STORE.website}/community/ambassadors`,
    images: [
      {
        url: "/community/ambassador/opengraph-image",
        width: 1200,
        height: 630,
        alt: `Ambassadors · ${STORE.name}`,
      },
    ],
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${STORE.website}/community/ambassadors#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Community", item: `${STORE.website}/community` },
    {
      "@type": "ListItem",
      position: 3,
      name: "Ambassadors",
      item: `${STORE.website}/community/ambassadors`,
    },
  ],
};

type AmbassadorRow = {
  id: string;
  name: string | null;
  ambassador_public_handle: string | null;
  ambassador_public_bio: string | null;
  instagram_followers_attested: number | null;
  thanked_by_name_count: number | null;
  follower_tier: string | null;
};

async function fetchPublicAmbassadors(): Promise<AmbassadorRow[]> {
  const sql = getClient();
  try {
    const rows = await sql`
      SELECT
        id, name, ambassador_public_handle, ambassador_public_bio,
        instagram_followers_attested, thanked_by_name_count, follower_tier
      FROM users
      WHERE is_ambassador = true
        AND ambassador_public_listing_opt_in = true
        AND departed_at IS NULL
      ORDER BY thanked_by_name_count DESC NULLS LAST, created_at ASC
      LIMIT 200
    `;
    return rows as unknown as AmbassadorRow[];
  } catch {
    // Pre-migration / pre-data graceful empty render. Sister pattern of
    // every other Server Component that reads inv-App-shared DB.
    return [];
  }
}

export const dynamic = "force-dynamic";

export default async function AmbassadorsListingPage() {
  if (process.env.AMBASSADOR_PROGRAM_ENABLED !== "true") {
    return (
      <main className="min-h-[80vh] bg-stone-50">
        <Breadcrumb
          items={[
            { label: "Community", href: "/community" },
            { label: "Ambassadors" },
          ]}
        />
        <section className="mx-auto max-w-3xl px-6 py-16 text-center">
          <h1 className="text-3xl font-semibold text-stone-900">Our Ambassadors — coming soon</h1>
          <p className="mt-4 text-stone-700">
            We&apos;re building the public ambassador list. Check back shortly.
          </p>
          <p className="mt-6">
            <Link href="/community" className="text-green-700 underline">
              Back to {STORE.name} Community
            </Link>
          </p>
        </section>
      </main>
    );
  }

  const ambassadors = await fetchPublicAmbassadors();
  const count = ambassadors.length;

  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />

      <Breadcrumb
        items={[
          { label: "Community", href: "/community" },
          { label: "Ambassadors" },
        ]}
      />

      {/* WSLCB compliance stripe — sister of /menu age-gate posture */}
      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-900">
        21+ only. Cannabis advertising (WAC 314-55-155).
      </div>

      {/* Hero */}
      <section className="relative overflow-hidden bg-green-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Ambassador Program · {STORE.name}
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Meet our Ambassadors
          </h1>
          <p className="text-emerald-100/85 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            {count > 0
              ? `${count} approved creators sharing their ${STORE.name} story. First name + last initial only — privacy by default.`
              : `We're onboarding our first ambassadors now. Want to be on this page? Apply below.`}
          </p>
          <div className="mt-7">
            <Link
              href="/community/ambassador/apply"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-green-950 text-sm font-bold transition-all shadow-md"
            >
              Apply to join →
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        {count === 0 ? (
          <section className="rounded-2xl bg-white border border-stone-200 p-8 text-center">
            <p className="text-stone-700 text-sm leading-relaxed">
              No ambassadors are listed publicly yet. Approved ambassadors who&apos;ve opted in to
              the public list will appear here.
            </p>
          </section>
        ) : (
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {ambassadors.map((a) => {
              const displayName = firstNameLastInitial(a.name);
              const tier: FollowerTier =
                a.follower_tier === "silver" ||
                a.follower_tier === "gold" ||
                a.follower_tier === "platinum"
                  ? a.follower_tier
                  : resolveFollowerTierFromCount(a.instagram_followers_attested);
              const submissionCount = a.thanked_by_name_count ?? 0;
              const profileHref = a.ambassador_public_handle
                ? `/community/ambassadors/${a.ambassador_public_handle}`
                : null;
              return (
                <article
                  key={a.id}
                  className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-6 hover:border-green-300 transition-colors flex flex-col"
                >
                  <header className="flex items-start justify-between gap-2 mb-3">
                    <h2 className="font-bold text-stone-900 text-base leading-snug">
                      {displayName || "Ambassador"}
                    </h2>
                    <span
                      title={`Tier: ${tier}`}
                      className="text-xs font-bold text-green-700 bg-green-100 px-2 py-0.5 rounded-full inline-flex items-center gap-1"
                    >
                      <span aria-hidden="true">{tierBadgeEmoji(tier)}</span>
                      <span className="capitalize">{tier}</span>
                    </span>
                  </header>
                  <p className="text-stone-600 text-xs">
                    {submissionCount > 0
                      ? `${submissionCount} approved submission${submissionCount === 1 ? "" : "s"}`
                      : "Welcome aboard"}
                  </p>
                  {a.ambassador_public_bio && (
                    <p className="mt-3 text-stone-700 text-sm leading-relaxed flex-1">
                      {a.ambassador_public_bio}
                    </p>
                  )}
                  {profileHref && (
                    <Link
                      href={profileHref}
                      className="mt-4 text-xs font-semibold text-green-700 hover:text-green-900 inline-flex items-center gap-1 self-start"
                    >
                      See profile <span aria-hidden="true">→</span>
                    </Link>
                  )}
                </article>
              );
            })}
          </section>
        )}

        <section className="mt-12 rounded-2xl bg-green-950 text-white p-7 sm:p-9 space-y-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Want to be on this page?
          </p>
          <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Apply to the Ambassador Program — opt-in to the public list at the same time.
          </h2>
          <div className="pt-2">
            <Link
              href="/community/ambassador/apply"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-green-950 text-sm font-bold transition-all shadow-md"
            >
              Apply →
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
