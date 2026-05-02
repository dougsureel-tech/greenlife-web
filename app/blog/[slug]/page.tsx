import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPost, getPosts } from "@/lib/posts";
import { STORE } from "@/lib/store";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt,
      ...(post.updatedAt ? { modifiedTime: post.updatedAt } : {}),
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
        {bulletBuffer.map((b, idx) => <li key={idx}>{renderInline(b)}</li>)}
      </ul>
    );
    bulletBuffer = [];
  }

  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("### ")) {
      flushBullets();
      blocks.push(<h3 key={blocks.length} className="text-xl font-bold text-stone-900 mt-8 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      flushBullets();
      blocks.push(<h2 key={blocks.length} className="text-2xl font-extrabold text-stone-900 mt-10 mb-3 tracking-tight">{line.slice(3)}</h2>);
    } else if (line.startsWith("- ")) {
      bulletBuffer.push(line.slice(2));
    } else if (line.trim() === "") {
      flushBullets();
    } else {
      flushBullets();
      blocks.push(<p key={blocks.length} className="text-stone-700 leading-relaxed">{renderInline(line)}</p>);
    }
    i++;
  }
  flushBullets();
  return blocks;
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
      <Link key={`l-${match.index}`} href={match[2]} className="text-green-700 underline underline-offset-2 hover:text-green-600">
        {boldify(match[1], `lt-${match.index}`)}
      </Link>
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
    parts.push(<strong key={`${key}-${match.index}`} className="font-bold text-stone-900">{match[1]}</strong>);
    cursor = match.index + match[0].length;
  }
  if (cursor < text.length) parts.push(text.slice(cursor));
  return <span key={key}>{parts}</span>;
}

export default async function BlogPost({ params }: Props) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const url = `${STORE.website}/blog/${slug}`;
  const articleSchema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${url}#article`,
    headline: post.title,
    description: post.description,
    url,
    datePublished: post.publishedAt,
    ...(post.updatedAt ? { dateModified: post.updatedAt } : {}),
    inLanguage: "en-US",
    isPartOf: { "@id": `${STORE.website}/blog#blog` },
    publisher: { "@id": `${STORE.website}/#dispensary` },
    author: { "@type": "Organization", name: STORE.name, url: STORE.website },
    articleSection: post.category,
    wordCount: post.body.split(/\s+/).length,
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Blog", item: `${STORE.website}/blog` },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      {/* Header */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10 sm:py-14">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)" }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 space-y-3">
          <Link href="/blog" className="text-green-400 text-xs font-bold uppercase tracking-widest hover:text-green-300 transition-colors inline-block">
            ← Field Notes
          </Link>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">{post.title}</h1>
          <div className="flex items-center gap-3 text-xs text-green-300/70 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-green-900/60 border border-green-800 text-green-200 font-semibold">{post.category}</span>
            <span className="tabular-nums">
              {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
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
            <Link href="/menu" className="px-4 py-2 rounded-xl bg-green-400 hover:bg-green-300 text-green-950 text-sm font-bold transition-colors">
              Browse Menu
            </Link>
            <Link href="/menu" className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-sm font-semibold transition-colors">
              Order for Pickup
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
