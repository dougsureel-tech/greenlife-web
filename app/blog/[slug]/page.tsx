import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts, fetchDynamicPosts, fetchDynamicPost } from "@/lib/posts";
import { STORE, STORE_TZ } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import { RelatedShopLinks } from "@/components/RelatedShopLinks";

type Props = { params: Promise<{ slug: string }> };

// dynamicParams=false means only the slugs from generateStaticParams() are
// served — unknown slugs return a real 404 (not the soft-404 / 200-with-
// "not found"-content that Next.js 16 emits by default when dynamicParams=true).
// SEO impact: Google distinguishes 200-with-error-content from real 404; soft
// 404s on /blog/[slug] hurt the blog index's authority.
// New slugs from the inv CMS appear here after the next deploy (or after
// Next.js ISR re-runs generateStaticParams on a revalidation cycle).
export const dynamicParams = false;
export const revalidate = 300;

export async function generateStaticParams() {
  const [staticPosts, dynamicPosts] = await Promise.all([
    Promise.resolve(getPosts()),
    fetchDynamicPosts(),
  ]);
  const seen = new Set(staticPosts.map((p) => p.slug));
  return [...staticPosts, ...dynamicPosts.filter((p) => !seen.has(p.slug))].map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug) ?? (await fetchDynamicPost(slug));
  if (!post) return {};
  return {
    // title.absolute drops the template's ` | Green Life Cannabis` suffix
    // so the article title alone fills the SERP slot. Pre-fix titles like
    // "The Complete Guide to Cannabis in Wenatchee Valley" rendered at
    // 72 chars after suffix — Google truncated mid-word. Brand attribution
    // moves to BreadcrumbList JSON-LD which Google shows above the
    // article-level snippet on /blog SERPs anyway. Sister GW v2.94.05
    // title trim arc.
    title: { absolute: post.title },
    // Auto-trunc post.description over Google ~160 mobile SERP cap.
    description: post.description.length > 160 ? post.description.slice(0, 157).trimEnd() + "…" : post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      siteName: STORE.name,
      locale: "en_US",
      title: post.title,
      description: post.description,
      type: "article",
      // og:url added 2026-05-10 (T21) — pre-fix /blog/[slug] openGraph
      // had no `url:` field so Next 16 fell back to layout default
      // (homepage URL). Facebook/LinkedIn share-card "site URL" footer
      // pointed at homepage instead of the article. Sister of T19
      // og:type + T20 og:site_name shallow-overwrite class.
      url: `${STORE.website}/blog/${slug}`,
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
      // article:section + article:tag — Facebook/LinkedIn render the
      // section as a small pill above the share-card title; tags help
      // taxonomic clustering when posts get re-shared at scale. Pre-fix
      // /blog/[slug] declared og:type=article + publishedTime but
      // OMITTED section + tags — share cards rendered without the
      // category context. Sister GW /learn/[slug] same fix v2.95.50.
      section: post.category,
      tags: [post.category],
      // Per-post OG image at /blog/{slug}/opengraph-image (file convention
      // co-located in this directory). Pre-v17 the page set
      // `images: [DEFAULT_OG_IMAGE]` (homepage OG) which OVERRODE Next's
      // per-route convention — every blog post share-card on Twitter/
      // Facebook/LinkedIn rendered the generic homepage card instead of
      // the per-post custom one (with post title + category eyebrow).
      // Verified pre-fix via curl: `<meta og:image>` was `/opengraph-image`,
      // not `/blog/{slug}/opengraph-image`. Now: explicit per-route URL
      // matches what the convention would auto-inject. Width/height/alt
      // pulled from the per-route file's `size` export + post title.
      // Sister scc same-fix. Caught 2026-05-10 by /loop tick 48 cross-
      // stack OG-image-vs-per-route audit (curl-confirmed dead-code
      // status of the per-route opengraph-image.tsx files).
      images: [
        {
          url: `/blog/${slug}/opengraph-image`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  };
}

// Tiny markdown renderer — only handles what we use in posts.ts: ##/### headings,
// **bold**, [link](url), bullet lists, and paragraph breaks. Anything fancier
// would justify pulling in remark/rehype, which we don't need yet.
function renderMarkdown(md: string): React.ReactElement[] {
  const lines = md.split("\n");
  const blocks: React.ReactElement[] = [];
  let i = 0;
  let bulletBuffer: string[] = [];

  function flushBullets() {
    if (bulletBuffer.length === 0) return;
    blocks.push(
      <ul key={`ul-${blocks.length}`} className="list-disc pl-6 space-y-1.5 text-stone-700 leading-relaxed">
        {bulletBuffer.map((b, idx) => (
          <li key={idx}>{renderInline(b)}</li>
        ))}
      </ul>,
    );
    bulletBuffer = [];
  }

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      flushBullets();
      blocks.push(
        <h3 key={blocks.length} className="text-xl font-bold text-stone-900 mt-8 mb-2">
          {line.slice(4)}
        </h3>,
      );
    } else if (line.startsWith("## ")) {
      flushBullets();
      blocks.push(
        <h2 key={blocks.length} className="text-2xl font-extrabold text-stone-900 mt-10 mb-3 tracking-tight">
          {line.slice(3)}
        </h2>,
      );
    } else if (line.startsWith("- ")) {
      bulletBuffer.push(line.slice(2));
    } else if (line.trim() === "") {
      flushBullets();
    } else {
      flushBullets();
      blocks.push(
        <p key={blocks.length} className="text-stone-700 leading-relaxed">
          {renderInline(line)}
        </p>,
      );
    }
    i++;
  }
  flushBullets();
  return blocks;
}

function safeLinkHref(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("/") || trimmed.startsWith("#")) return trimmed;
  try {
    const u = new URL(trimmed);
    if (["https:", "http:", "tel:", "mailto:"].includes(u.protocol)) return trimmed;
  } catch {
    // invalid URL — fall through
  }
  return "#";
}

function renderInline(text: string): React.ReactNode {
  // Order matters: parse links first, then bold.
  const parts: React.ReactNode[] = [];
  let cursor = 0;
  const linkRe = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match: RegExpExecArray | null;
  while ((match = linkRe.exec(text)) !== null) {
    if (match.index > cursor) parts.push(boldify(text.slice(cursor, match.index), `t-${cursor}`));
    parts.push(
      <Link
        key={`l-${match.index}`}
        href={safeLinkHref(match[2])}
        className="text-green-700 underline underline-offset-2 hover:text-green-600"
      >
        {boldify(match[1], `lt-${match.index}`)}
      </Link>,
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(boldify(text.slice(cursor), `tail-${cursor}`));
  return parts;
}

function boldify(text: string, key: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let cursor = 0;
  let match: RegExpExecArray | null;
  while ((match = re.exec(text)) !== null) {
    if (match.index > cursor) parts.push(text.slice(cursor, match.index));
    parts.push(
      <strong key={`${key}-${match.index}`} className="font-bold text-stone-900">
        {match[1]}
      </strong>,
    );
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <span key={key}>{parts}</span>;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug) ?? (await fetchDynamicPost(slug));
  if (!post) notFound();

  const url = `${STORE.website}/blog/${slug}`;
  // SEO audit 2026-05-14 Tier-1 #4: Article JSON-LD rigor.
  //
  // (a) `dateModified` — Google uses this as a freshness ranking signal for
  //     news/blog SERP categories. Pre-fix we only emitted it when the post
  //     SSoT carried an explicit `updatedAt`. Now we always emit, defaulting
  //     to `datePublished` when no real modification has occurred — Google
  //     treats publication date as the freshness signal in that case, which
  //     is correct and not a fabrication.
  // (b) `author` Person schema — pre-fix this was Organization (the store
  //     itself), which is technically valid but ranks lower than a real
  //     Person author for Google's "About this result" panel + Anthropic /
  //     Perplexity AI source-citation weighting. Now: prefer per-post
  //     `post.author` if SSoT carries one; otherwise default to the store
  //     owner (Doug) as a Person pointing at `/about#owner`. The default is
  //     a known-true author of record (Doug or store staff write every post)
  //     not a fabrication — but the changelog calls out that this is the
  //     store-owner default pending per-post authorship metadata.
  // (c) `publisher` Organization reference retained separately (Article
  //     schema requires both `author` + `publisher`).
  const DEFAULT_AUTHOR = { name: "Doug Cundiff", url: `${STORE.website}/about#owner` };
  const author = post.author
    ? { "@type": "Person", name: post.author.name, ...(post.author.url ? { url: post.author.url } : {}) }
    : { "@type": "Person", name: DEFAULT_AUTHOR.name, url: DEFAULT_AUTHOR.url };

  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt ?? post.publishedAt,
    inLanguage: "en-US",
    isPartOf: { "@id": `${STORE.website}/blog#blog` },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    publisher: { "@id": `${STORE.website}/#dispensary` },
    author,
    articleSection: post.category,
    wordCount: post.body.split(/\s+/).length,
    // Article rich-result eligibility requires `image`. Points at the
    // per-route opengraph-image (1200x630) so each post gets its own
    // SERP card art, not a shared homepage image (GSC "Missing field
    // 'image'" was previously flagging because the conditional shape
    // here could resolve to undefined for some posts; per-route URL
    // always resolves via the file-convention OG handler).
    image: [`${STORE.website}/blog/${slug}/opengraph-image`],
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    // Stable @id — sister of the buildBreadcrumbLd helper @id (T91 same-fix).
    "@id": `${url}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${STORE.website}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbSchema) }}
      />

      <Breadcrumb items={[{ label: "Blog", href: "/blog" }, { label: post.title }]} />

      {/* Header */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10 sm:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 space-y-3">
          <Link
            href="/blog"
            className="text-green-400 text-xs font-bold uppercase tracking-widest hover:text-green-300 transition-colors inline-block"
          >
            ← Field Notes
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 text-xs text-green-300/70 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-green-900/60 border border-green-800 text-green-200 font-semibold">
              {post.category}
            </span>
            <span className="tabular-nums">
              {new Date(post.publishedAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
                timeZone: STORE_TZ,
              })}
            </span>
            <span className="opacity-50">·</span>
            <span>{post.readingMinutes} min read</span>
          </div>
        </div>
      </div>

      {/* Body */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-3">
        {renderMarkdown(post.body)}
      </article>

      {/* Footer CTA */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-16">
        <div className="rounded-2xl bg-green-950 text-white p-6 text-center space-y-3">
          <p className="font-bold text-lg">Come visit us in {STORE.address.city}</p>
          <p className="text-green-300/70 text-sm max-w-sm mx-auto">
            {STORE.address.full} · Open daily · Cash only · 21+ with valid ID
          </p>
          <div className="flex justify-center gap-3 flex-wrap pt-1">
            <Link
              href="/menu"
              className="px-4 py-2 rounded-xl bg-green-400 hover:bg-green-300 text-green-950 text-sm font-bold transition-colors"
            >
              Browse Menu
            </Link>
            <Link
              href="/menu"
              className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-sm font-semibold transition-colors"
            >
              Order for Pickup
            </Link>
          </div>
        </div>
      </div>

      {/* ── RELATED SHOP LINKS — SEO internal-link refactor 2026-05-17 ──
          Pipes PageRank from /blog/[slug] long-tail to commercial-intent
          /brands + /strains pages. Cross-stack mirror in seattle-cannabis-web. */}
      <RelatedShopLinks />
    </>
  );
}
