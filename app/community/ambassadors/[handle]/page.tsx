import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import { getClient } from "@/lib/db";
import {
  firstNameLastInitial,
  normalizeHandle,
  resolveFollowerTierFromCount,
  tierBadgeEmoji,
  verifyHandleUrl,
  type FollowerTier,
} from "@/lib/ambassador-apply";

// /community/ambassadors/[handle] — Phase G per-ambassador profile.
//
// Lookup by ambassador_public_handle (NEW column on users; set on
// approval by the admin queue). Falls back to 404 if no row matches.
//
// Privacy posture: first name + last initial only. Social handles render
// as CLICKABLE LINKS to the external platforms (no iframe embed — Meta
// doesn't permit oembed for cannabis brands).
//
// Featured content (3-6 URLs) defer to Phase G.5; v0.2 only shows the
// handle list as clickable verify-links. Bio paragraph is the
// ambassador_public_bio column populated by manager at approval.

type AmbassadorProfileRow = {
  id: string;
  name: string | null;
  ambassador_public_handle: string | null;
  ambassador_public_bio: string | null;
  instagram_followers_attested: number | null;
  tiktok_followers_attested: number | null;
  youtube_followers_attested: number | null;
  follower_tier: string | null;
  thanked_by_name_count: number | null;
};

async function fetchAmbassadorByHandle(
  handle: string,
): Promise<AmbassadorProfileRow | null> {
  const norm = normalizeHandle(handle);
  if (!norm) return null;
  const sql = getClient();
  try {
    const rows = await sql`
      SELECT
        id, name,
        ambassador_public_handle, ambassador_public_bio,
        instagram_followers_attested, tiktok_followers_attested, youtube_followers_attested,
        follower_tier, thanked_by_name_count
      FROM users
      WHERE ambassador_public_handle = ${norm}
        AND is_ambassador = true
        AND ambassador_public_listing_opt_in = true
        AND departed_at IS NULL
      LIMIT 1
    `;
    if (rows.length === 0) return null;
    return rows[0] as unknown as AmbassadorProfileRow;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  const row = await fetchAmbassadorByHandle(handle);
  if (!row) {
    return {
      title: { absolute: `Ambassador · ${STORE.name}` },
      description: `Ambassador profile on ${STORE.name}.`,
      robots: { index: false, follow: false },
    };
  }
  const displayName = firstNameLastInitial(row.name) || "Ambassador";
  return {
    title: { absolute: `${displayName} · Ambassadors · ${STORE.name}` },
    description: `Ambassador ${displayName} on the ${STORE.name} Ambassador Program.`,
    alternates: { canonical: `/community/ambassadors/${handle}` },
    openGraph: {
      siteName: STORE.name,
      type: "profile",
      locale: "en_US",
      title: `${displayName} · ${STORE.name} Ambassador`,
      description: `Meet ${displayName} — ${STORE.name} Ambassador.`,
      url: `${STORE.website}/community/ambassadors/${handle}`,
      images: [
        {
          url: "/community/ambassador/opengraph-image",
          width: 1200,
          height: 630,
          alt: `${displayName} · ${STORE.name} Ambassador`,
        },
      ],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function AmbassadorProfilePage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  if (process.env.AMBASSADOR_PROGRAM_ENABLED !== "true") notFound();

  const { handle } = await params;
  const row = await fetchAmbassadorByHandle(handle);
  if (!row) notFound();

  const displayName = firstNameLastInitial(row.name) || "Ambassador";
  const tier: FollowerTier =
    row.follower_tier === "silver" ||
    row.follower_tier === "gold" ||
    row.follower_tier === "platinum"
      ? row.follower_tier
      : resolveFollowerTierFromCount(row.instagram_followers_attested);

  const submissionCount = row.thanked_by_name_count ?? 0;
  const igUrl = verifyHandleUrl("instagram", row.ambassador_public_handle);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/community/ambassadors/${handle}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Community", item: `${STORE.website}/community` },
      {
        "@type": "ListItem",
        position: 3,
        name: "Ambassadors",
        item: `${STORE.website}/community/ambassadors`,
      },
      {
        "@type": "ListItem",
        position: 4,
        name: displayName,
        item: `${STORE.website}/community/ambassadors/${handle}`,
      },
    ],
  };

  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />

      <Breadcrumb
        items={[
          { label: "Community", href: "/community" },
          { label: "Ambassadors", href: "/community/ambassadors" },
          { label: displayName },
        ]}
      />

      <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-center text-xs font-semibold text-amber-900">
        21+ only. Cannabis advertising (WAC 314-55-155).
      </div>

      <section className="relative overflow-hidden bg-green-950 text-white">
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            {STORE.name} Ambassador
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight inline-flex items-center gap-3 flex-wrap">
            <span>{displayName}</span>
            <span
              title={`Tier: ${tier}`}
              className="text-xs font-bold text-green-100 bg-green-800 px-2.5 py-1 rounded-full inline-flex items-center gap-1 align-middle"
            >
              <span aria-hidden="true">{tierBadgeEmoji(tier)}</span>
              <span className="capitalize">{tier}</span>
            </span>
          </h1>
          <p className="text-emerald-100/85 mt-4 text-base leading-relaxed max-w-2xl">
            {submissionCount > 0
              ? `${submissionCount} approved submission${submissionCount === 1 ? "" : "s"} to the program.`
              : `New to the program — welcome.`}
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-8">
        {row.ambassador_public_bio && (
          <section className="rounded-2xl bg-white border border-stone-200 p-6 sm:p-8">
            <p className="text-stone-800 text-base leading-relaxed">
              {row.ambassador_public_bio}
            </p>
          </section>
        )}

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-stone-900 uppercase tracking-[0.18em]">
            Where to find {displayName}
          </h2>
          <ul className="rounded-2xl bg-white border border-stone-200 p-5 space-y-3">
            {igUrl && (
              <li>
                <a
                  href={igUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-green-700 underline hover:text-green-800 text-sm font-semibold"
                >
                  Instagram: @{row.ambassador_public_handle}
                </a>
                {row.instagram_followers_attested != null && (
                  <span className="text-stone-500 text-xs ml-2">
                    ({row.instagram_followers_attested.toLocaleString("en-US")} followers attested)
                  </span>
                )}
              </li>
            )}
            {!igUrl && (
              <li className="text-stone-500 text-sm">
                Social links coming soon.
              </li>
            )}
          </ul>
        </section>

        <section className="rounded-2xl bg-green-950 text-white p-6 sm:p-8 space-y-3 text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Want to join {displayName} on this page?
          </p>
          <Link
            href="/community/ambassador/apply"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-green-950 text-sm font-bold transition-all shadow-md"
          >
            Apply →
          </Link>
        </section>

        <p>
          <Link
            href="/community/ambassadors"
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to all ambassadors
          </Link>
        </p>
      </div>
    </main>
  );
}
