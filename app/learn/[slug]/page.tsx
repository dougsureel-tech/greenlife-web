import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { STORE, DEFAULT_OG_IMAGE } from "@/lib/store";
import { LEARN_HUB_TOPICS, getLearnHubTopic } from "@/lib/learn-hub";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";

// /learn/<slug> — long-form educational hub pages. One page per topic
// in LEARN_HUB_TOPICS, keyed off slug. Static (force-static) — content
// is data-driven, no per-request DB calls.
//
// SEO audit Tier-2: builds /learn into a `/learn/{topic}` hub with topic
// landing pages that capture high-intent educational searches. Same
// SoT pattern as /near/[town] and /strains/[type]: data in lib/, dynamic
// route renders, sitemap.ts iterates LEARN_HUB_TOPICS for per-topic URLs.

export const dynamic = "force-static";
export const revalidate = false;
// dynamicParams=false: unknown slugs return proper HTTP 404 instead of
// rendering a 200-status "Not found" page (soft-404). Same defense as
// /near/[town] — Google penalizes soft-404s and customers searching for
// a /learn/<slug> URL that doesn't exist deserve a real 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return LEARN_HUB_TOPICS.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const topic = getLearnHubTopic(slug);
  if (!topic) return { title: "Not found" };

  // title.absolute drops the layout's template suffix so /learn/<slug>
  // stays under Google ~60-char SERP cap. Sister of /near/[town] pattern.
  const title = { absolute: `${topic.title} — ${STORE.name}` } as const;

  return {
    title,
    description: topic.description,
    alternates: { canonical: `/learn/${topic.slug}` },
    openGraph: {
      type: "article",
      locale: "en_US",
      title,
      description: topic.description,
      url: `${STORE.website}/learn/${topic.slug}`,
      siteName: STORE.name,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export default async function LearnTopicPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const topic = getLearnHubTopic(slug);
  if (!topic) notFound();

  // LocalBusiness JSON-LD references the canonical `#dispensary` @id
  // from app/layout.tsx so Google merges the topic page with the
  // home-page LocalBusiness instead of treating each /learn/<slug>
  // as a separate store. mainEntityOfPage keeps per-page binding.
  const businessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    "@id": `${STORE.website}/#dispensary`,
    mainEntityOfPage: { "@id": `${STORE.website}/learn/${topic.slug}` },
    name: STORE.name,
    url: STORE.website,
    address: {
      "@type": "PostalAddress",
      streetAddress: STORE.address.street,
      addressLocality: STORE.address.city,
      addressRegion: STORE.address.state,
      postalCode: STORE.address.zip,
      addressCountry: "US",
    },
    telephone: STORE.phoneTel,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${STORE.website}/learn/${topic.slug}#breadcrumb`,
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
      { "@type": "ListItem", position: 2, name: "Cannabis 101", item: `${STORE.website}/learn` },
      { "@type": "ListItem", position: 3, name: topic.title, item: `${STORE.website}/learn/${topic.slug}` },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${STORE.website}/learn/${topic.slug}#faq`,
    mainEntity: topic.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: f.a,
      },
    })),
  };

  // Article-style wrapper that ties the long-form copy to the
  // LocalBusiness @id from layout.tsx so AI engines treat the topic
  // content as authored by our store entity (E-E-A-T).
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${STORE.website}/learn/${topic.slug}#article`,
    headline: topic.title,
    description: topic.description,
    inLanguage: "en-US",
    url: `${STORE.website}/learn/${topic.slug}`,
    isPartOf: { "@id": `${STORE.website}/learn` },
    publisher: { "@id": `${STORE.website}/#dispensary` },
    about: { "@id": `${STORE.website}/#dispensary` },
  };

  // Body renderer — markdown-like: `## ` lines become <h2>, blank-line
  // separated paragraphs render as <p>. `- ` list lines collapse into a
  // <ul>. Minimal parser — copy is owned by us, syntax is predictable.
  const sections = renderBody(topic.body);

  const otherTopics = LEARN_HUB_TOPICS.filter((t) => t.slug !== topic.slug);

  return (
    <main className="bg-zinc-950 text-zinc-100 min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(businessLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(articleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqLd) }}
      />

      <Breadcrumb
        items={[
          { label: "Cannabis 101", href: "/learn" },
          { label: topic.title },
        ]}
      />

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-emerald-900/40 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-950">
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 pt-8 pb-10 sm:pt-12 sm:pb-14">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400 mb-3">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{topic.eyebrow}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-[1.1] mb-4">
            {topic.title}
          </h1>
          <p className="text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl">
            {topic.description}
          </p>
        </div>
      </section>

      {/* ── LONG-FORM BODY ────────────────────────────────────────────── */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="prose prose-invert prose-zinc prose-lg max-w-none
          prose-headings:text-white prose-headings:tracking-tight
          prose-h2:text-2xl sm:prose-h2:text-3xl prose-h2:font-bold prose-h2:mt-10 prose-h2:mb-4
          prose-p:text-zinc-300 prose-p:leading-relaxed prose-p:mb-5
          prose-strong:text-zinc-100
          prose-ul:my-5 prose-li:text-zinc-300 prose-li:my-1
          prose-a:text-emerald-400 hover:prose-a:text-emerald-300">
          {sections}
        </div>
      </article>

      {/* ── FAQ ───────────────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-10 sm:pb-14">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-6">
          Frequently asked
        </h2>
        <dl className="space-y-4">
          {topic.faqs.map((f, i) => (
            <details
              key={i}
              className="group rounded-2xl border border-zinc-800 bg-zinc-900/50 px-5 py-4 open:border-emerald-700/50 transition-colors"
            >
              <summary className="cursor-pointer list-none flex items-start justify-between gap-3 text-base sm:text-lg font-semibold text-zinc-100">
                <span>{f.q}</span>
                <span
                  aria-hidden="true"
                  className="shrink-0 text-emerald-400 transition-transform group-open:rotate-45 text-xl leading-none"
                >
                  +
                </span>
              </summary>
              <dd className="mt-3 text-zinc-300 text-sm sm:text-base leading-relaxed">
                {f.a}
              </dd>
            </details>
          ))}
        </dl>
      </section>

      {/* ── CTA BAND ──────────────────────────────────────────────────── */}
      <section className="border-y border-emerald-900/40 bg-gradient-to-br from-emerald-950 to-zinc-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 mb-2">
            Ready to put it into practice?
          </p>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-3">
            Browse the live menu.
          </h2>
          <p className="text-zinc-300 leading-relaxed mb-5 max-w-xl">
            Our budtenders read the same lab panels and ride the same conversations every day. Stop by, ask anything, and we’ll match you to something that fits.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition-colors"
            >
              Browse the menu →
            </Link>
            <Link
              href="/visit"
              className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 hover:border-zinc-500 px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-900 transition-colors"
            >
              Plan a visit
            </Link>
          </div>
        </div>
      </section>

      {/* ── OTHER TOPICS ──────────────────────────────────────────────── */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-emerald-400 mb-2">
          Keep reading
        </p>
        <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white mb-6">
          Other Cannabis 101 topics
        </h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {otherTopics.map((t) => (
            <li key={t.slug}>
              <Link
                href={`/learn/${t.slug}`}
                className="group block rounded-xl border border-zinc-800 hover:border-emerald-700 bg-zinc-900/40 hover:bg-zinc-900 px-4 py-3 transition-colors"
              >
                <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/80 mb-1">
                  {t.eyebrow}
                </div>
                <div className="text-sm sm:text-base font-semibold text-zinc-100 group-hover:text-white leading-snug">
                  {t.title}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      {/* ── DISCLAIMER ────────────────────────────────────────────────── */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        <p className="text-xs text-zinc-600 text-center leading-relaxed">
          General education only — not medical advice. If you have a medical condition or take medications,
          consult your doctor before using cannabis. 21+. Always consume responsibly.
        </p>
      </div>
    </main>
  );
}

/** Minimal markdown-like renderer for the body field. Owned content,
 * predictable syntax: `## ` → h2, blank-line-separated paragraphs → p,
 * `- ` consecutive lines → ul. No bold/italic parsing yet (kept simple). */
function renderBody(body: string): React.ReactNode {
  const blocks: React.ReactNode[] = [];
  const lines = body.split("\n");
  let para: string[] = [];
  let list: string[] = [];
  let key = 0;

  const flushPara = () => {
    if (para.length === 0) return;
    blocks.push(<p key={`p-${key++}`}>{renderInline(para.join(" "))}</p>);
    para = [];
  };
  const flushList = () => {
    if (list.length === 0) return;
    blocks.push(
      <ul key={`ul-${key++}`} className="list-disc pl-6">
        {list.map((item, i) => (
          <li key={i}>{renderInline(item)}</li>
        ))}
      </ul>,
    );
    list = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (line.startsWith("## ")) {
      flushPara();
      flushList();
      blocks.push(<h2 key={`h2-${key++}`}>{line.slice(3)}</h2>);
    } else if (line.startsWith("- ")) {
      flushPara();
      list.push(line.slice(2));
    } else if (line === "") {
      flushPara();
      flushList();
    } else {
      flushList();
      para.push(line);
    }
  }
  flushPara();
  flushList();
  return blocks;
}

/** Inline `**bold**` → <strong>. No other inline syntax. */
function renderInline(text: string): React.ReactNode {
  if (!text.includes("**")) return text;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((p, i) => {
    if (p.startsWith("**") && p.endsWith("**")) {
      return <strong key={i}>{p.slice(2, -2)}</strong>;
    }
    return <span key={i}>{p}</span>;
  });
}
