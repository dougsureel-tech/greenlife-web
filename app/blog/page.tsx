import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { getPosts } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Cannabis Guides & Vendor Spotlights",
  description: `Long-form guides, education, and vendor spotlights from ${STORE.name} — the Wenatchee Valley's cannabis dispensary. Written by people who actually work the counter.`,
  alternates: { canonical: "/blog" },
};

const CATEGORY_TINT: Record<string, string> = {
  "Guide":            "bg-emerald-100 text-emerald-700 border-emerald-200",
  "Vendor Spotlight": "bg-amber-100 text-amber-700 border-amber-200",
  "Education":        "bg-blue-100 text-blue-700 border-blue-200",
  "Local":            "bg-rose-100 text-rose-700 border-rose-200",
};

export default function BlogIndex() {
  const posts = getPosts();

  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${STORE.website}/blog#blog`,
    name: `${STORE.name} Blog`,
    description: `Cannabis guides and vendor spotlights from ${STORE.name}.`,
    url: `${STORE.website}/blog`,
    publisher: { "@id": `${STORE.website}/#dispensary` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.description,
      url: `${STORE.website}/blog/${p.slug}`,
      datePublished: p.publishedAt,
      ...(p.updatedAt ? { dateModified: p.updatedAt } : {}),
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }} />

      {/* Header */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10 sm:py-14">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)" }} />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Field Notes</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Guides & Vendor Spotlights</h1>
          <p className="text-green-300/70 mt-2 max-w-xl text-sm sm:text-base">
            Long-form writing on cannabis, our producers, and the Wenatchee Valley — by the people who work the counter.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 space-y-4">
        {posts.length === 0 ? (
          <p className="text-stone-500 text-center py-12">More posts coming soon.</p>
        ) : (
          posts.map((p) => (
            <Link
              key={p.slug}
              href={`/blog/${p.slug}`}
              className="block group rounded-2xl border border-stone-100 bg-white hover:border-green-300 hover:shadow-md transition-all overflow-hidden"
            >
              <article className="px-6 py-5 space-y-2">
                <div className="flex items-center gap-3 text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold border ${CATEGORY_TINT[p.category] ?? "bg-stone-100 text-stone-600 border-stone-200"}`}>
                    {p.category}
                  </span>
                  <span className="text-stone-400 tabular-nums">
                    {new Date(p.publishedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </span>
                  <span className="text-stone-300">·</span>
                  <span className="text-stone-400">{p.readingMinutes} min read</span>
                </div>
                <h2 className="text-xl font-extrabold text-stone-900 group-hover:text-green-800 transition-colors leading-snug">{p.title}</h2>
                <p className="text-stone-500 text-sm leading-relaxed">{p.description}</p>
                <p className="text-sm font-semibold text-green-700 group-hover:text-green-600 pt-1">Read →</p>
              </article>
            </Link>
          ))
        )}
      </div>
    </>
  );
}
