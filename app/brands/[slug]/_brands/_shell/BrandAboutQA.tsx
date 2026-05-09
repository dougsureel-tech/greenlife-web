import type { BrandPalette } from "./types";
import { safeJsonLd } from "@/lib/json-ld-safe";

export type BrandAboutQAItem = { q: string; a: string };

// Bottom-of-page "About {brand}" Q&A list with FAQPage JSON-LD. Schema
// is derived from the same `items` array that renders, so the structured
// data and the visible page can never drift — keeping us inside Google's
// FAQ-rich-result rules (visible content must match marked-up content).
//
// Open by default to avoid the "click to reveal" UX tax on first-time
// visitors who scrolled this far specifically to read the Q&A. The
// `<details>` arrow still works for collapsing.
export function BrandAboutQA({
  palette,
  brandName,
  headline = "Quick facts",
  items,
}: {
  palette: BrandPalette;
  brandName: string;
  headline?: string;
  items: BrandAboutQAItem[];
}) {
  const dark3 = palette.dark3 ?? palette.accent;
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map(({ q, a }) => ({
      "@type": "Question",
      name: q,
      acceptedAnswer: { "@type": "Answer", text: a },
    })),
  };

  return (
    <section className="bg-white border-t border-slate-200">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(faqSchema) }}
      />
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
          style={{ color: palette.dark }}
        >
          About {brandName}
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          {headline}
        </h2>
        <div className="space-y-3">
          {items.map(({ q, a }) => (
            <details
              key={q}
              open
              className="group rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden open:bg-white open:shadow-sm transition-all"
              style={
                {
                  // CSS custom prop drives the open-state border so the JIT
                  // doesn't need to see arbitrary-value classes for every
                  // brand's accent.
                  "--brand-open-border": dark3,
                } as React.CSSProperties
              }
            >
              <summary className="flex items-center justify-between gap-4 px-5 py-4 cursor-pointer list-none select-none transition-colors">
                <span
                  className="font-semibold text-slate-800 text-sm leading-snug transition-colors group-open:[color:var(--brand-open-border)]"
                  style={{}}
                >
                  {q}
                </span>
                <svg
                  className="w-5 h-5 shrink-0 text-slate-300 group-open:rotate-180 transition-all duration-200 group-open:[color:var(--brand-open-border)]"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div
                className="px-5 pb-5 pt-1 text-slate-600 text-sm leading-relaxed"
                style={{ borderTop: `1px solid ${dark3}33` }}
              >
                {a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
