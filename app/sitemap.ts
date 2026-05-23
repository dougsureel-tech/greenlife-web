import type { MetadataRoute } from "next";
import { getActiveBrands, getActiveDeals } from "@/lib/db";
import { STORE } from "@/lib/store";
import { getPosts, fetchDynamicPosts } from "@/lib/posts";
import { NEAR_TOWNS } from "@/lib/near-towns";
import { LEARN_HUB_TOPICS } from "@/lib/learn-hub";
import { STRAIN_TYPES } from "@/lib/strain-types";
import { getStrainsInCurrentWave } from "@/lib/strains";
import { STRAIN_FAMILIES } from "@/lib/strain-families";
import { isBannedLogoUrl } from "@/lib/banned-logo-url";

// Revalidate every 30 minutes at CDN edge — sitemap pulls from DB
// (brands, deals, posts) but those change rarely (deals daily at most;
// brands/posts even less). Pre-fix served `cache-control: public,
// max-age=0, must-revalidate` (Next.js default for metadata routes) →
// every Google/Bing/AI-bot crawl re-rendered + re-queried Postgres.
// 30-min cache cuts ~99% of repeat fetches without delaying real
// changes by more than 30 min. Sister of inv v342.605 cross-repo port.
export const revalidate = 1800;

// Vendor-logo source-of-truth guard lives in `lib/banned-logo-url.ts` —
// shared with `app/brands/[slug]/page.tsx` since v36.605. Drops aggregator
// hosts (weedmaps/leafly) + known-404 URLs (the420bar.com, agrocouture.com)
// before they hit any customer-facing surface. Doug-action: when a vendor
// row's logoUrl gets cleaned up in Postgres, remove the corresponding URL
// from `BROKEN_LOGO_URLS` in `lib/banned-logo-url.ts`.

// Static-page lastModified: hardcoded date string, NOT `new Date()`.
// Pre-fix every static page (/about, /contact, /faq, /heroes, etc.)
// stamped lastmod with the sitemap-build timestamp — every Googlebot
// crawl saw "this page changed today" even when the actual content
// hadn't changed in months. Wasted crawl budget on pages with truly
// static content. Per Google sitemap docs: "lastmod should reflect
// when the content of the page last changed in a meaningful way."
// Bump this constant manually when static page content actually
// changes (e.g., team-roster edit on /our-story, hours change on
// /visit, FAQ rewrite). For pages with truly dynamic content (live
// menu, active deals, new blog posts), keep `new Date()` or pull
// from the data model's actual updatedAt. Doug-action queue #3
// closure. Sister scc same-fix.
const STATIC_LASTMOD = new Date("2026-05-10");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, deals, dynamicPosts] = await Promise.all([
    getActiveBrands().catch(() => []),
    getActiveDeals().catch(() => []),
    fetchDynamicPosts().catch(() => []),
  ]);
  const staticPosts = getPosts();
  const seenSlugs = new Set(staticPosts.map((p) => p.slug));
  const posts = [...staticPosts, ...dynamicPosts.filter((p) => !seenSlugs.has(p.slug))];

  const staticPages: MetadataRoute.Sitemap = [
    { url: STORE.website, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    // /menu is the live-inventory Boost embed and customer CTAs all
    // route to it, but the brand-search ("Green Life") result MUST
    // land on / not /menu. Demoted from 0.95 → 0.85 so / clearly
    // outranks in sitemap priority signaling. Pairs with the new
    // Organization + WebSite JSON-LD in app/layout.tsx that anchors
    // / as the entity hub.
    { url: `${STORE.website}/menu`, lastModified: new Date(), changeFrequency: "daily", priority: 0.85 },
    // /order REMOVED from sitemap — proxy.ts 307-redirects /order/* → /menu
    // (per `feedback_customer_ctas_point_to_menu_only`). Listing redirected
    // URLs in sitemap wastes Google crawl budget. When the native menu
    // ships and the proxy redirect is removed, restore this entry.
    // (v7.665)
    { url: `${STORE.website}/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    // /treasure-chest = clearance-lane surface (v4.385). Was missing from
    // the sitemap → Google never indexed it. Daily changeFrequency since
    // products move in/out as inventory turns.
    { url: `${STORE.website}/treasure-chest`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${STORE.website}/visit`, lastModified: STATIC_LASTMOD, changeFrequency: "weekly", priority: 0.85 },
    {
      url: `${STORE.website}/find-your-strain`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // /strains directory + 4 per-type landing pages — SEO long-tail
    // intent capture ("indica strains Wenatchee", "sativa Wenatchee
    // Valley", etc.). priority 0.8 — peer with /find-your-strain.
    // changeFrequency "monthly" because the descriptive copy doesn't
    // turn over (live inventory lives at /menu). Sister scc v26.505.
    { url: `${STORE.website}/strains`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.8 },
    ...STRAIN_TYPES.map((t) => ({
      url: `${STORE.website}/strains/${t.slug}`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    // Per-strain pages — gated by SEO_STRAIN_WAVE env var (Doug 2026-05-15
    // cadence-gate doctrine, 6 net-new URLs/day/stack). All 50 pages
    // physically exist in the build; only those within the current wave
    // index appear in the sitemap (the rest carry noindex meta).
    ...getStrainsInCurrentWave().map((slug) => ({
      url: `${STORE.website}/strains/${slug}`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.65,
    })),
    // Strain Family Album — /strains/families hub + 10 per-family pages.
    // Gated by SEO_FAMILY_WAVE (separate lever from SEO_STRAIN_WAVE to
    // honor the 6/day/stack cadence doctrine — 11 net-new URLs roll out
    // over 2 days). The hub URL appears once SEO_FAMILY_WAVE>=1; each
    // numbered family slot appears when wave>=its position. Default 0 =
    // all pages physically exist + carry noindex meta + omitted from
    // sitemap.
    ...(() => {
      const familyWave = parseInt(process.env.SEO_FAMILY_WAVE ?? "0", 10);
      if (!Number.isFinite(familyWave) || familyWave <= 0) return [];
      const entries: MetadataRoute.Sitemap = [
        {
          url: `${STORE.website}/strains/families`,
          lastModified: STATIC_LASTMOD,
          changeFrequency: "monthly" as const,
          priority: 0.75,
        },
      ];
      STRAIN_FAMILIES.slice(0, familyWave).forEach((f) => {
        entries.push({
          url: `${STORE.website}/strains/families/${f.slug}`,
          lastModified: STATIC_LASTMOD,
          changeFrequency: "monthly" as const,
          priority: 0.7,
        });
      });
      return entries;
    })(),
    {
      url: `${STORE.website}/heroes`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Heroes cohort SEO landings (hack #7) — high priority because they
    // capture cohort-specific search traffic ("veteran cannabis discount
    // Wenatchee" etc.) before any other site does. Static-rendered.
    ...["veterans", "military", "first-responders", "healthcare", "teachers"].map((slug) => ({
      url: `${STORE.website}/heroes/${slug}`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${STORE.website}/community`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // Ambassador Program v0.1 — Phase 2 customer surfaces. Per
    // PLAN_AMBASSADOR_PROGRAM.md §6 — `/community/ambassador` is the
    // discovery + submission landing; `/community/feedback` is the
    // open-channel suggestion form. Both static + Doug-flag gated at
    // env (AMBASSADOR_PROGRAM_ENABLED) — sitemap entry is safe to
    // include even when the env is off (form gracefully no-ops, page
    // still renders explanation copy).
    {
      url: `${STORE.website}/community/ambassador`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${STORE.website}/community/feedback`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    // /alumni REMOVED 2026-05-10 (sister of cannagent v4.555 sitemap-vs-
    // canonical conflict fix): app/alumni/layout.tsx sets
    // `robots: { index: false, follow: false }` (privacy — exposes legacy
    // team roster + secret-prompt). Sitemap entry contradicted that
    // signal — Google would skip indexing per the noindex meta tag and
    // the sitemap entry was wasted crawl-budget noise. Per Google sitemap
    // docs: don't list URLs that the page-level robots meta excludes from
    // the index. v9.905 added this entry for "alumni discovery" intent;
    // the layout.tsx noindex (added later) overrode that intent. Privacy
    // wins — alumni who know to look can still navigate to /alumni
    // directly; Google just won't return it for "Green Life Cannabis
    // alumni" searches. If alumni-discovery becomes important again,
    // remove the layout.tsx noindex first, then re-add to sitemap.
    {
      url: `${STORE.website}/our-story`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${STORE.website}/blog`, lastModified: STATIC_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    { url: `${STORE.website}/about`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.6 },
    // v35.705 — priority demoted 0.6 → 0.5 to match the spec'd "static
    // support page" tier (/faq, /accessibility, /contact, /careers, /press).
    { url: `${STORE.website}/contact`, lastModified: STATIC_LASTMOD, changeFrequency: "yearly", priority: 0.5 },
    {
      url: `${STORE.website}/press`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    // v35.705 — /faq demoted 0.7 → 0.5 (support-page tier). /learn is the
    // educational HUB → bumped 0.75 → 0.8 to peer with other hub pages.
    { url: `${STORE.website}/faq`, lastModified: STATIC_LASTMOD, changeFrequency: "yearly", priority: 0.5 },
    { url: `${STORE.website}/learn`, lastModified: STATIC_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    {
      url: `${STORE.website}/accessibility`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.5,
    },
    {
      url: `${STORE.website}/careers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.5,
    },
    {
      url: `${STORE.website}/terms-of-use`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${STORE.website}/health-data-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${STORE.website}/vendor-access`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${STORE.website}/apply`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.5,
    },
    // /alumni intentionally excluded — gated soft-knock route, not for indexing.
    // /quiz, /stash intentionally excluded — robots:noindex (per-visitor views).
  ];

  // Per-deal deep pages — only currently-active deals, since /deals/[id]
  // 404s on expired ones and Google penalizes sitemaps with dead URLs.
  // lastModified = endDate when present (the date the page surface
  // genuinely settles on); falls back to today for endless deals so
  // search engines don't see a stable date and de-prioritize.
  const dealPages: MetadataRoute.Sitemap = deals.map((d) => ({
    url: `${STORE.website}/deals/${d.id}`,
    lastModified: d.endDate ? new Date(d.endDate) : new Date(),
    changeFrequency: "daily" as const,
    priority: 0.85,
  }));

  // Dedupe brand slugs — `getActiveBrands` groups by `v.id` but the slug is
  // derived from `v.name`, so two vendor rows with the same name produce
  // the same slug and the sitemap was emitting 56 duplicate `<loc>` entries
  // out of 231 (24% bloat). Search engines de-prioritize sitemaps with
  // dupes. Underlying data fix (merging duplicate vendor rows) is separate.
  const seenBrandSlugs = new Set<string>();
  const brandPages: MetadataRoute.Sitemap = brands
    .filter((b) => {
      if (seenBrandSlugs.has(b.slug)) return false;
      seenBrandSlugs.add(b.slug);
      return true;
    })
    .map((b) => ({
      url: `${STORE.website}/brands/${b.slug}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.7,
      // Image-extension entry — Google Image search picks the brand
      // logo as the canonical preview for the brand page. Skips brands
      // without a logo URL on file (typographic-wordmark brands etc.)
      // AND skips known-broken vendor CDN URLs flagged by the
      // 200-or-bust audit (Doug-action queue: update vendors.logoUrl
      // in glw Postgres to a working source or NULL when these get
      // verified). 404'd image:image entries are an SEO ding.
      ...(b.logoUrl && !isBannedLogoUrl(b.logoUrl) ? { images: [b.logoUrl] } : {}),
    }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${STORE.website}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /near/<town> service-area landing pages. Static, town-data driven
  // from `lib/near-towns.ts`. Detail-page tier per v35.705 sitemap tier
  // alignment (priority 0.7, parent hub /near at 0.8).
  const nearTownPages: MetadataRoute.Sitemap = NEAR_TOWNS.map((t) => ({
    url: `${STORE.website}/near/${t.slug}`,
    lastModified: STATIC_LASTMOD,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /near index page — hub for all /near/<town> pages, ItemList
  // JSON-LD eligible. v35.705 — priority 0.8 (hub tier).
  const nearIndexPage: MetadataRoute.Sitemap = [
    {
      url: `${STORE.website}/near`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    },
  ];

  // /learn/<slug> hub topic landing pages. Long-form educational SEO
  // surface (~400-600 words each), data-driven from `lib/learn-hub.ts`.
  // priority 0.7 — high-intent informational lane (cannabis tax, dosing,
  // first-visit) but sits below the canonical / + /menu + /near.
  const learnHubPages: MetadataRoute.Sitemap = LEARN_HUB_TOPICS.map((t) => ({
    url: `${STORE.website}/learn/${t.slug}`,
    lastModified: STATIC_LASTMOD,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...dealPages, ...brandPages, ...postPages, ...nearIndexPage, ...nearTownPages, ...learnHubPages];
}