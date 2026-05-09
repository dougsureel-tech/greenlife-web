import type { MetadataRoute } from "next";
import { getActiveBrands, getActiveDeals } from "@/lib/db";
import { STORE } from "@/lib/store";
import { getPosts } from "@/lib/posts";
import { NEAR_TOWNS } from "@/lib/near-towns";

// Revalidate every 30 minutes at CDN edge — sitemap pulls from DB
// (brands, deals, posts) but those change rarely (deals daily at most;
// brands/posts even less). Pre-fix served `cache-control: public,
// max-age=0, must-revalidate` (Next.js default for metadata routes) →
// every Google/Bing/AI-bot crawl re-rendered + re-queried Postgres.
// 30-min cache cuts ~99% of repeat fetches without delaying real
// changes by more than 30 min. Sister of inv v342.605 cross-repo port.
export const revalidate = 1800;

// Known-broken vendor CDN URLs surfaced by the 200-or-bust audit on
// 2026-05-09. These vendors appear in glw Postgres `vendors.logoUrl`
// pointing to external WordPress uploads that 404 or sit behind a
// SiteGround captcha challenge (so Google bot can't fetch). Filtering
// them out of <image:image> entries keeps the sitemap clean. The
// `/brands/<slug>` page entry itself stays in — there's a real page,
// just no preferred image. Doug-action: update vendors.logoUrl in glw
// Postgres to a working source (self-hosted under /public/images/brands/
// or verified vendor CDN) — then remove the URL from this set.
const BROKEN_LOGO_URLS = new Set<string>([
  // Evergreen Herbal — 404 on the420bar.com WP upload (2026-05-09)
  "https://the420bar.com/wp-content/uploads/2022/04/420-logo-alpha.png",
  // Agro Couture — 202 captcha challenge on agrocouture.com (SiteGround)
  "https://agrocouture.com/wp-content/uploads/2024/01/Agro-Couture_Logo-gold.png",
]);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [brands, deals] = await Promise.all([
    getActiveBrands().catch(() => []),
    getActiveDeals().catch(() => []),
  ]);
  const posts = getPosts();

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
    { url: `${STORE.website}/visit`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    {
      url: `${STORE.website}/find-your-strain`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${STORE.website}/heroes`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // Heroes cohort SEO landings (hack #7) — high priority because they
    // capture cohort-specific search traffic ("veteran cannabis discount
    // Wenatchee" etc.) before any other site does. Static-rendered.
    ...["veterans", "military", "first-responders", "healthcare", "teachers"].map((slug) => ({
      url: `${STORE.website}/heroes/${slug}`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
    {
      url: `${STORE.website}/community`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      // Wenatchee-specific alumni self-serve onboarding page (per memory
      // `project_alumni_self_serve` — Wen-only). Pre-fix this page existed
      // but wasn't in the sitemap → Google didn't crawl it → SEO loss for
      // anyone Googling "Green Life Cannabis alumni".
      url: `${STORE.website}/alumni`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${STORE.website}/our-story`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    { url: `${STORE.website}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${STORE.website}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${STORE.website}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${STORE.website}/press`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${STORE.website}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${STORE.website}/learn`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
    {
      url: `${STORE.website}/accessibility`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${STORE.website}/careers`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${STORE.website}/terms-of-use`,
      lastModified: new Date(),
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
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${STORE.website}/apply`,
      lastModified: new Date(),
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
      ...(b.logoUrl && !BROKEN_LOGO_URLS.has(b.logoUrl) ? { images: [b.logoUrl] } : {}),
    }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${STORE.website}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  // /near/<town> service-area landing pages. Static, town-data driven
  // from `lib/near-towns.ts`. priority 0.8 — geo-search lift target;
  // sits below the canonical / + /menu but above generic info pages.
  const nearTownPages: MetadataRoute.Sitemap = NEAR_TOWNS.map((t) => ({
    url: `${STORE.website}/near/${t.slug}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.8,
  }));

  // /near index page — hub for all /near/<town> pages, ItemList
  // JSON-LD eligible. priority 0.85 — slightly above per-town
  // pages since it's the parent hub.
  const nearIndexPage: MetadataRoute.Sitemap = [
    {
      url: `${STORE.website}/near`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.85,
    },
  ];

  return [...staticPages, ...dealPages, ...brandPages, ...postPages, ...nearIndexPage, ...nearTownPages];
}
