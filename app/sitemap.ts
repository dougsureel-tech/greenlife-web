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

// Domains we will NEVER emit as <image:image> in the sitemap, even if
// the vendors.logoUrl DB field points at one. Per memory
// `feedback_vendor_logo_sources`: vendor logos must come from the
// brand's own site/CDN, NOT from third-party aggregators (Weedmaps,
// Leafly, etc.). Using an aggregator's CDN signals to Google that we
// don't own the brand's identity + risks the URL going dark when the
// aggregator changes their image-hosting structure (Weedmaps in
// particular has migrated their image URLs multiple times in the
// last few years). Caught 2026-05-10 by /loop tick 15 brand-page
// health audit on glw — `1555-industrial-llc` had a weedmaps.com
// logoUrl that was getting emitted to sitemap. Doug-action: update
// `1555 Industrial LLC` vendors.logoUrl in glw Postgres to a self-
// hosted (`/public/images/brands/1555-industrial.png`) or
// vendor-CDN source. Other vendors with aggregator logos will be
// silently filtered until DB-level cleanup happens.
const BANNED_LOGO_DOMAINS = ["weedmaps.com", "leafly.com", "leafly.ca"];

function isBannedLogoUrl(url: string): boolean {
  if (BROKEN_LOGO_URLS.has(url)) return true;
  try {
    const host = new URL(url).hostname.toLowerCase();
    return BANNED_LOGO_DOMAINS.some((banned) => host === banned || host.endsWith(`.${banned}`));
  } catch {
    // Malformed URL — drop it from sitemap. Sitemap with garbage URLs
    // is worse than sitemap missing an image entry.
    return true;
  }
}

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
    { url: `${STORE.website}/visit`, lastModified: STATIC_LASTMOD, changeFrequency: "weekly", priority: 0.85 },
    {
      url: `${STORE.website}/find-your-strain`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "weekly",
      priority: 0.8,
    },
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
      priority: 0.75,
    })),
    {
      url: `${STORE.website}/community`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.7,
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
    { url: `${STORE.website}/contact`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.6 },
    {
      url: `${STORE.website}/press`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    { url: `${STORE.website}/faq`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.7 },
    { url: `${STORE.website}/learn`, lastModified: STATIC_LASTMOD, changeFrequency: "monthly", priority: 0.75 },
    {
      url: `${STORE.website}/accessibility`,
      lastModified: STATIC_LASTMOD,
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
  // from `lib/near-towns.ts`. priority 0.8 — geo-search lift target;
  // sits below the canonical / + /menu but above generic info pages.
  const nearTownPages: MetadataRoute.Sitemap = NEAR_TOWNS.map((t) => ({
    url: `${STORE.website}/near/${t.slug}`,
    lastModified: STATIC_LASTMOD,
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