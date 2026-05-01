import type { MetadataRoute } from "next";
import { getActiveBrands } from "@/lib/db";
import { STORE } from "@/lib/store";
import { getPosts } from "@/lib/posts";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const brands = await getActiveBrands().catch(() => []);
  const posts = getPosts();

  const staticPages: MetadataRoute.Sitemap = [
    { url: STORE.website, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${STORE.website}/menu`, lastModified: new Date(), changeFrequency: "daily", priority: 0.95 },
    { url: `${STORE.website}/order`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${STORE.website}/find-your-strain`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${STORE.website}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${STORE.website}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${STORE.website}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${STORE.website}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${STORE.website}/faq`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${STORE.website}/learn`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.75 },
  ];

  const brandPages: MetadataRoute.Sitemap = brands.map((b) => ({
    url: `${STORE.website}/brands/${b.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const postPages: MetadataRoute.Sitemap = posts.map((p) => ({
    url: `${STORE.website}/blog/${p.slug}`,
    lastModified: new Date(p.updatedAt ?? p.publishedAt),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...brandPages, ...postPages];
}
