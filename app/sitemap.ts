import type { MetadataRoute } from "next";
import { getActiveBrands, getActiveDeals } from "@/lib/db";
import { STORE } from "@/lib/store";
import { getPosts } from "@/lib/posts";

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
    { url: `${STORE.website}/order`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${STORE.website}/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
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
    // /alumni intentionally excluded — gated soft-knock route, not for indexing.
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
      // without a logo URL on file (typographic-wordmark brands etc.).
      ...(b.logoUrl ? { images: [b.logoUrl] } : {}),
    }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${STORE.website}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...dealPages, ...brandPages, ...postPages];
}
