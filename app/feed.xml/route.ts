import { STORE } from "@/lib/store";
import { getPosts } from "@/lib/posts";

// RSS 2.0 feed for the /blog content. Pre-fix the site published 12+
// blog posts with no machine-readable feed — RSS readers (Feedly,
// NewsBlur, Inoreader), AI-training crawlers (GPTBot, ClaudeBot,
// PerplexityBot all probe /feed.xml + /rss.xml), and the dwindling-but-
// real Old Reader / Old Reader-class set all 404'd. /feed → /blog 308
// served HTML to feed parsers — useless. /feed.xml + /rss.xml + /atom.xml
// were all 404. This restores the canonical RSS 2.0 endpoint at
// /feed.xml and lets crawlers/aggregators ingest blog content properly.
//
// Content-Type: application/rss+xml is the RFC 4287 / RSS 2.0 canonical
// MIME type. Some parsers also accept text/xml — we use the strict form.
//
// Cache: 30-min edge cache (sister of sitemap.xml at v8.165). Blog posts
// rarely change post-publish; 30 min cuts ~99% of repeat-fetcher cost
// for the same pattern of crawl behavior.
export const revalidate = 1800;

// Minimal HTML/XML escape — RSS spec requires title + description to be
// escaped (or wrapped in CDATA). The 5 entities here cover the cases we
// emit (title contains apostrophes/ampersands; description contains
// the same plus quotes).
function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET(): Promise<Response> {
  const posts = getPosts();
  // Most-recently-published first — RSS convention. Some readers honor
  // pubDate ordering inside the feed body too, but most rely on first-
  // listed-is-newest.
  const sorted = [...posts].sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  const lastBuildDate =
    sorted.length > 0
      ? new Date(sorted[0].publishedAt).toUTCString()
      : new Date().toUTCString();

  const items = sorted
    .map((post) => {
      const url = `${STORE.website}/blog/${post.slug}`;
      const pubDate = new Date(post.publishedAt).toUTCString();
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${pubDate}</pubDate>
      <category>${escapeXml(post.category)}</category>
    </item>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${STORE.name} — Blog`)}</title>
    <link>${STORE.website}/blog</link>
    <atom:link href="${STORE.website}/feed.xml" rel="self" type="application/rss+xml" />
    <description>${escapeXml(`Cannabis education, vendor spotlights, and dispatches from ${STORE.address.city}, WA — written by the counter team at ${STORE.name}. 21+.`)}</description>
    <language>en-US</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      // Match metadata-route cache config (sitemap.xml). 30-min edge
      // cache + 1-hour stale-while-revalidate = at most 30 min lag for
      // a new blog post to surface to feed readers.
      "Cache-Control": "public, max-age=0, s-maxage=1800, stale-while-revalidate=3600",
    },
  });
}
