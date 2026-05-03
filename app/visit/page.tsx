import type { Metadata } from "next";
import Link from "next/link";
import { STORE, isOpenNow, nextOpenLabel } from "@/lib/store";
import { withAttr } from "@/lib/attribution";

// ISR: only dynamic data is "is the store open NOW" + which day-row to
// highlight. 5-minute revalidate keeps that fresh enough that customers
// looking up hours pre-visit get the right "Open / Closed" state without
// a per-visit Neon round-trip (this page doesn't even use Neon).
export const revalidate = 300;

export const metadata: Metadata = {
  title: "Visit — Hours, Directions, What to Bring",
  description: `Visit ${STORE.name} at ${STORE.address.full}. Hours, parking, ID requirements, and directions. ATM on-site, free parking, ADA accessible. Open daily, ${STORE.phone}.`,
  alternates: { canonical: "/visit" },
  keywords: [
    `cannabis dispensary near me Wenatchee`,
    `Wenatchee dispensary hours`,
    `cannabis store directions ${STORE.address.city}`,
    `dispensary parking ${STORE.address.city}`,
    `weed shop ${STORE.address.zip}`,
  ],
  openGraph: {
    title: `Visit ${STORE.name}`,
    description: `${STORE.address.full} · ${STORE.phone} · Free parking, ATM on-site.`,
    url: `${STORE.website}/visit`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

// Schema — reference the LocalBusiness @id from layout.tsx so this page
// reinforces the same store entity rather than declaring a new one.
const visitSchema = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${STORE.website}/visit#page`,
  name: `Visit ${STORE.name}`,
  url: `${STORE.website}/visit`,
  about: { "@id": `${STORE.website}/#dispensary` },
  mainEntity: { "@id": `${STORE.website}/#dispensary` },
  description: `Hours, address, parking, what to bring. ${STORE.address.full}.`,
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Visit", item: `${STORE.website}/visit` },
  ],
};

const PARKING_NEARBY = [
  "Free dedicated parking right out front",
  "Side-street overflow on Center Road",
  "Easy ADA-accessible entrance — no curb step",
];

const WHAT_TO_BRING = [
  {
    emoji: "🪪",
    label: "Valid government ID",
    note: "21+ to enter — passports + out-of-state DLs both work",
  },
  {
    emoji: "💵",
    label: "Cash for the order",
    note: "Cannabis is federally illegal so banks won't process card payments",
  },
  { emoji: "🏧", label: "Or use our on-site ATM", note: "If you forgot — no judgment, happens daily" },
  { emoji: "📱", label: "Your phone", note: "For order pickup, loyalty lookup, and the menu" },
];

const NEARBY = [
  { name: "Pybus Public Market", direction: "5 min south" },
  { name: "Apple Capital Recreation Loop", direction: "7 min east" },
  { name: "US-2 west to Cascades", direction: "Direct on-ramp" },
  { name: "US-97 north to Lake Chelan", direction: "Direct on-ramp" },
];

export default function VisitPage() {
  const open = isOpenNow();
  const statusLabel = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(visitSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Hero */}
      <section className="relative bg-green-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade8033, transparent)" }}
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 sm:py-20">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-400">Visit Us</p>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-2">{STORE.address.street}</h1>
          <p className="text-green-300/80 mt-2">
            {STORE.address.city}, {STORE.address.state} {STORE.address.zip}
          </p>

          <div className="mt-5 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold border bg-white/5 border-white/15">
            <span
              className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-400 animate-pulse shadow-[0_0_6px_#4ade80]" : "bg-red-400"}`}
            />
            <span className={open ? "text-green-300" : "text-red-300"}>
              {statusLabel || (open ? "Open today" : "Closed today")}
            </span>
            {todayHours && (
              <span className="text-green-300/60 font-normal">
                · {todayHours.open}–{todayHours.close}
              </span>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 mt-7">
            <a
              href={STORE.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Get directions to ${STORE.name} on Google Maps (opens in new tab)`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-sm transition-all shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5a2.5 2.5 0 110-5 2.5 2.5 0 010 5z" />
              </svg>
              Get Directions
            </a>
            <Link
              href={withAttr("/menu", "menu", "visit-hero")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              Order Ahead
            </Link>
            <a
              href={`tel:${STORE.phoneTel}`}
              aria-label={`Call ${STORE.name} at ${STORE.phone}`}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              <span aria-hidden="true">📞</span> {STORE.phone}
            </a>
          </div>
        </div>
      </section>

      {/* Trust strip — reinforces Wenatchee positioning between hero + hours.
          Keeps the page from being purely transactional. Per memory
          `project_wenatchee_positioning_best_staff` — best-staff framing,
          NOT locally-owned. */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-7 sm:py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-8 text-center sm:text-left">
            <div className="flex sm:items-center sm:gap-3 flex-col sm:flex-row gap-1.5">
              <span className="text-2xl shrink-0" aria-hidden="true">⭐</span>
              <div>
                <div className="font-bold text-stone-900 text-sm">The Valley&apos;s best staff</div>
                <div className="text-stone-500 text-xs leading-snug">
                  Twelve years curating cannabis, training budtenders, knowing regulars.
                </div>
              </div>
            </div>
            <div className="flex sm:items-center sm:gap-3 flex-col sm:flex-row gap-1.5">
              <span className="text-2xl shrink-0" aria-hidden="true">🏠</span>
              <div>
                <div className="font-bold text-stone-900 text-sm">Same building since 2014</div>
                <div className="text-stone-500 text-xs leading-snug">
                  On Sunnyslope, on the corner of Center Rd. You&apos;ve probably driven past us.
                </div>
              </div>
            </div>
            <div className="flex sm:items-center sm:gap-3 flex-col sm:flex-row gap-1.5">
              <span className="text-2xl shrink-0" aria-hidden="true">🪪</span>
              <div>
                <div className="font-bold text-stone-900 text-sm">WSLCB licensed</div>
                <div className="text-stone-500 text-xs leading-snug">
                  License #{STORE.wslcbLicense}. Cash-only, 21+ with valid ID.
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Hours + Amenities */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Hours</h2>
            <p className="text-stone-600 text-sm mt-1">Open every day of the year, including holidays.</p>
            <table className="mt-5 w-full text-sm">
              <tbody className="divide-y divide-stone-100">
                {STORE.hours.map((h) => {
                  const isToday = h.day === today;
                  return (
                    <tr
                      key={h.day}
                      className={isToday ? "bg-green-50" : ""}
                      aria-current={isToday ? "date" : undefined}
                    >
                      <td className={`py-3 font-semibold ${isToday ? "text-green-800" : "text-stone-700"}`}>
                        {h.day}
                        {isToday && (
                          <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-green-700">
                            today
                          </span>
                        )}
                      </td>
                      <td
                        className={`py-3 text-right tabular-nums ${isToday ? "text-green-800 font-semibold" : "text-stone-600"}`}
                      >
                        {h.open}–{h.close}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">On-site amenities</h2>
            <p className="text-stone-600 text-sm mt-1">
              Everything you&apos;d expect from a neighborhood shop.
            </p>
            <ul className="mt-5 space-y-2.5">
              {STORE.amenities.map((a) => (
                <li key={a} className="flex items-start gap-2.5 text-sm text-stone-700">
                  <span className="text-green-600 shrink-0 mt-0.5">
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  </span>
                  {a}
                </li>
              ))}
            </ul>

            <div className="mt-7 rounded-2xl border border-stone-200 bg-stone-50 p-4 space-y-2">
              <p className="text-xs font-bold uppercase tracking-widest text-green-700">Parking</p>
              <ul className="space-y-1.5 text-sm text-stone-700">
                {PARKING_NEARBY.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* What to bring */}
      <section className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">First time?</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              What to bring
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {WHAT_TO_BRING.map((b) => (
              <div key={b.label} className="rounded-2xl border border-stone-200 bg-white p-5 space-y-2">
                <div className="text-2xl">{b.emoji}</div>
                <h3 className="font-bold text-stone-900 text-sm">{b.label}</h3>
                <p className="text-xs text-stone-600 leading-relaxed">{b.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map embed + nearby */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-14 grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-10">
          <div className="lg:col-span-2">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Find us</h2>
            <p className="text-stone-600 text-sm mt-1">{STORE.address.full}</p>
            <div className="mt-5 rounded-2xl border border-stone-200 overflow-hidden aspect-[16/10] bg-stone-100">
              <iframe
                title={`Map of ${STORE.name}`}
                src={`https://www.google.com/maps?q=${encodeURIComponent(STORE.address.full)}&output=embed`}
                width="100%"
                height="100%"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                style={{ border: 0 }}
              />
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Nearby</h2>
            <p className="text-stone-600 text-sm mt-1">For when you&apos;re making a trip of it.</p>
            <ul className="mt-5 divide-y divide-stone-100 border-y border-stone-100">
              {NEARBY.map((n) => (
                <li key={n.name} className="py-3 flex items-start justify-between gap-3 text-sm">
                  <span className="text-stone-700 font-medium">{n.name}</span>
                  <span className="text-stone-500 shrink-0">{n.direction}</span>
                </li>
              ))}
            </ul>
            <p className="text-[11px] text-stone-500 leading-relaxed mt-5">
              On the corner of Center Rd, about 4 minutes off US-2 and 5 minutes from downtown Wenatchee. Easy
              stop on the way to Lake Chelan or Leavenworth.
            </p>
          </div>
        </div>
      </section>

      {/* Internal-link mesh — quick pivot to the highest-converting next
          surfaces. Helps PageRank flow + gives customers a clear "what
          else" beyond the visit-info brief. */}
      <section className="bg-stone-50 border-b border-stone-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <div className="text-center mb-6">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Before you stop in</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Plan your trip
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href={withAttr("/deals", "deal", "visit-mesh")}
              className="group rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <div className="text-2xl mb-2" aria-hidden="true">🏷️</div>
              <h3 className="font-bold text-stone-900 text-sm">Live deals today</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Brand-day pricing, % off categories, weekly recurring specials.
              </p>
              <span className="text-green-700 group-hover:text-green-600 text-xs font-bold mt-3 inline-flex items-center gap-1">
                See what&apos;s on
                <span aria-hidden="true">→</span>
              </span>
            </Link>
            <Link
              href={withAttr("/heroes", "header", "visit-mesh-heroes")}
              className="group rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <div className="text-2xl mb-2" aria-hidden="true">🎖️</div>
              <h3 className="font-bold text-stone-900 text-sm">Heroes 20% off</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Active military, veterans, first responders, healthcare, K-12 teachers.
              </p>
              <span className="text-green-700 group-hover:text-green-600 text-xs font-bold mt-3 inline-flex items-center gap-1">
                Check eligibility
                <span aria-hidden="true">→</span>
              </span>
            </Link>
            <Link
              href={withAttr("/brands", "header", "visit-mesh-brands")}
              className="group rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
            >
              <div className="text-2xl mb-2" aria-hidden="true">🌿</div>
              <h3 className="font-bold text-stone-900 text-sm">Brands we carry</h3>
              <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
                Hand-curated Washington-state producers — flower, vapes, edibles, concentrates.
              </p>
              <span className="text-green-700 group-hover:text-green-600 text-xs font-bold mt-3 inline-flex items-center gap-1">
                Browse the lineup
                <span aria-hidden="true">→</span>
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bg-green-950 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div>
            <h2 className="text-xl font-extrabold">See you soon.</h2>
            <p className="text-green-300/70 text-sm mt-1">
              Order ahead and skip the line, or just walk in. Either way — bring cash + ID.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href={withAttr("/menu", "menu", "visit-bottom-browse")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-sm transition-all shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
            >
              Browse Menu
            </Link>
            <Link
              href={withAttr("/menu", "menu", "visit-bottom-order")}
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-sm transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              Order Ahead
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
