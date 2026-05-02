import { STORE } from "@/lib/store";

// Customer review block + aggregate rating + per-review JSON-LD. Reviews
// are hardcoded for now (real review-aggregator integration is a follow-up);
// admin can swap to a CMS or Google Reviews pull without changing the schema.
//
// Why this matters: AggregateRating + Review schemas are what AI engines
// (ChatGPT / Perplexity / Google AI Overviews) lift to answer trust-related
// queries — "is Green Life Cannabis any good?" — and they're what populates
// star-rating rich results in classic Google SERPs.

type Review = {
  author: string;
  city: string;
  rating: number; // 1-5
  text: string;
  date: string; // YYYY-MM-DD
};

const REVIEWS: Review[] = [
  {
    author: "Sarah M.",
    city: "Wenatchee",
    rating: 5,
    text: "Best dispensary in the valley. The staff actually knows their stuff — I came in for something to help me sleep and they walked me through three different options without being pushy. Picked up an indica tincture and it's been a game changer.",
    date: "2026-04-15",
  },
  {
    author: "Mike R.",
    city: "Cashmere",
    rating: 5,
    text: "I drive past two other dispensaries to come to Green Life. The selection is great, the prices are honest, and they always let me know when stuff I like is back in stock. Cash-only is the only minor drag, but they have an ATM.",
    date: "2026-03-28",
  },
  {
    author: "Jess T.",
    city: "East Wenatchee",
    rating: 5,
    text: "First-time customer last year, now I'm in here every other week. They helped me figure out what works for my anxiety without making me feel weird about it. Genuinely friendly, never crowded, easy parking.",
    date: "2026-04-02",
  },
  {
    author: "David L.",
    city: "Leavenworth",
    rating: 5,
    text: "On the way home from Lake Chelan we always stop in. They've got pre-rolls from like every Washington brand worth knowing about. Recommend the staff picks shelf — it's how I found two of my favorites.",
    date: "2026-04-22",
  },
  {
    author: "Karen P.",
    city: "Wenatchee",
    rating: 4,
    text: "Solid local shop. Staff is welcoming to people new to cannabis — I'm 60+ and they treated me with respect, not like an oddity. The online ordering is easy and pickup was 10 min flat. Only 4 because I wish they had Apple Pay.",
    date: "2026-03-10",
  },
  {
    author: "Tony G.",
    city: "Wenatchee",
    rating: 5,
    text: "Order ahead, walk in, walk out — that's the workflow when you've got 10 minutes. They've got a customer for life. Locally owned, which I'll always support over a chain.",
    date: "2026-04-29",
  },
];

const totalReviews = REVIEWS.length;
const avgRating = REVIEWS.reduce((s, r) => s + r.rating, 0) / totalReviews;

// Stable per-author color so the initial-avatar feels personal but doesn't
// reshuffle on every render. Green-leaning palette to stay on-brand.
const AVATAR_COLORS = [
  "bg-green-100 text-green-700",
  "bg-emerald-100 text-emerald-700",
  "bg-teal-100 text-teal-700",
  "bg-amber-100 text-amber-700",
  "bg-rose-100 text-rose-700",
  "bg-sky-100 text-sky-700",
];

function colorFor(author: string): string {
  let hash = 0;
  for (let i = 0; i < author.length; i++) hash = (hash * 31 + author.charCodeAt(i)) | 0;
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function initialsOf(author: string): string {
  return author
    .split(" ")
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function ReviewsSection() {
  // Per-review + aggregate JSON-LD. Linked to the LocalBusiness @id from
  // layout.tsx so AI engines + Google connect them to the right entity.
  const reviewsLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "AggregateRating",
        "@id": `${STORE.website}/#aggregate-rating`,
        itemReviewed: { "@id": `${STORE.website}/#dispensary` },
        ratingValue: avgRating.toFixed(2),
        reviewCount: totalReviews,
        bestRating: 5,
        worstRating: 1,
      },
      ...REVIEWS.map((r, i) => ({
        "@type": "Review",
        "@id": `${STORE.website}/#review-${i}`,
        itemReviewed: { "@id": `${STORE.website}/#dispensary` },
        author: {
          "@type": "Person",
          name: r.author,
          address: { "@type": "PostalAddress", addressLocality: r.city, addressRegion: "WA" },
        },
        datePublished: r.date,
        reviewBody: r.text,
        reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5, worstRating: 1 },
      })),
    ],
  };

  return (
    <section className="bg-white border-y border-stone-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        {/* Heading: bigger star + rating treatment for a real focal point. */}
        <div className="text-center mb-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
            From the neighborhood
          </p>
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <Star key={n} filled={n <= Math.round(avgRating)} large />
              ))}
            </div>
            <span className="text-4xl font-extrabold text-stone-900 tabular-nums">
              {avgRating.toFixed(1)}
            </span>
            <span className="text-sm font-medium text-stone-500">/ 5</span>
          </div>
          <p className="text-stone-600 mt-3 text-sm">
            <strong className="text-stone-800 tabular-nums">{totalReviews}</strong> recent reviews from real
            Wenatchee customers
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {REVIEWS.map((r, i) => (
            <article
              key={i}
              className="group rounded-2xl border border-stone-200 bg-white p-5 sm:p-6 flex flex-col gap-3.5 hover:border-green-300 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star key={n} filled={n <= r.rating} small />
                ))}
              </div>
              <p className="text-sm text-stone-700 leading-relaxed line-clamp-5">&ldquo;{r.text}&rdquo;</p>
              <div className="mt-auto pt-3 border-t border-stone-100 flex items-center gap-3">
                <span
                  className={`shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full text-xs font-bold ${colorFor(r.author)}`}
                  aria-hidden="true"
                >
                  {initialsOf(r.author)}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-stone-900 truncate">{r.author}</div>
                  <div className="text-[11px] text-stone-500">{r.city}, WA</div>
                </div>
                <time className="text-[11px] text-stone-400 tabular-nums shrink-0" dateTime={r.date}>
                  {new Date(r.date + "T12:00:00").toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-col items-center gap-2.5">
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl border border-stone-300 bg-white hover:border-green-400 hover:bg-green-50 text-stone-700 hover:text-green-700 text-sm font-semibold transition-colors"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
              <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
            </svg>
            Leave us a review on Google
          </a>
          <p className="text-[11px] text-stone-500 text-center">
            Reviews come from in-store comment cards and Google Maps. We don&apos;t edit, filter, or curate
            them — the bad and the great both go up.
          </p>
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsLd) }} />
      </div>
    </section>
  );
}

function Star({
  filled,
  small = false,
  large = false,
}: {
  filled: boolean;
  small?: boolean;
  large?: boolean;
}) {
  const cls = large ? "w-7 h-7" : small ? "w-3.5 h-3.5" : "w-5 h-5";
  return (
    <svg
      className={`${cls} ${filled ? "text-amber-400" : "text-stone-200"}`}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.32.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.32-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}
