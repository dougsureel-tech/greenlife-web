import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { ALUMNI_TEAM, initialOf } from "@/lib/team";
import { withAttr } from "@/lib/attribution";

// ISR — content rarely changes; today-row highlight is the only dynamic
// bit and a 5-minute cache window is plenty.
export const revalidate = 300;

export const metadata: Metadata = {
  title: "About — Wenatchee's Best Cannabis Staff Since 2014",
  description: `${STORE.name} — Wenatchee's cannabis dispensary, founded 2014, same building since opening. Knowledgeable budtenders, curated Washington-state cannabis, education-first. ${STORE.address.full}.`,
  alternates: { canonical: "/about" },
  keywords: [
    "Wenatchee cannabis dispensary",
    "Wenatchee best dispensary",
    "Green Life Cannabis history",
    "Wenatchee cannabis staff",
    "Sunnyslope dispensary",
    "Wenatchee dispensary since 2014",
    "best budtenders Wenatchee",
  ],
  openGraph: {
    title: `About ${STORE.name} — Wenatchee's best cannabis staff`,
    description: `Wenatchee cannabis dispensary, founded 2014. Knowledgeable budtenders, curated catalog, education first.`,
    url: `${STORE.website}/about`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

// AboutPage JSON-LD — links 'mainEntity' to the LocalBusiness @id from
// layout.tsx so AI engines + Google connect this page to the same store
// entity. Big GEO add for queries like 'who owns Green Life Cannabis' or
// 'is Green Life locally owned'.
const aboutSchema = {
  "@context": "https://schema.org",
  "@type": "AboutPage",
  name: `About ${STORE.name}`,
  url: `${STORE.website}/about`,
  description: `Wenatchee cannabis dispensary — founded 2014, same building since opening, the Valley's best cannabis staff, education-first.`,
  mainEntity: { "@id": `${STORE.website}/#dispensary` },
  inLanguage: "en-US",
  isPartOf: { "@id": `${STORE.website}/#website` },
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "About", item: `${STORE.website}/about` },
  ],
};

export default function AboutPage() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      {/* Page header */}
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
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Our Story</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">About Green Life Cannabis</h1>
          <p className="text-green-300/70 mt-2 text-sm sm:text-base">
            The Valley&apos;s best cannabis staff · since 2014
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 space-y-12 sm:space-y-16">
        {/* Mission */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Who We Are</h2>
            <p className="text-stone-600 leading-relaxed">
              Green Life Cannabis has been a Wenatchee dispensary since 2014 — same building, same
              standards, same crew you&apos;ll see again. We believe cannabis should be approachable,
              educational, and enjoyable — for everyone from first-time customers to seasoned enthusiasts.
            </p>
            <p className="text-stone-600 leading-relaxed">
              Our team of knowledgeable budtenders takes time to understand what you&apos;re looking for and
              guide you toward the right product. Whether you&apos;re seeking relief, relaxation, creativity,
              or just exploring — we&apos;re here to help.
            </p>
            <p className="text-stone-600 leading-relaxed">
              We handpick every product on our shelves, prioritizing quality, value, and Washington-grown
              producers. When you walk in, you&apos;re getting a curated experience, not just a store shelf.
            </p>
          </div>
          <div className="rounded-3xl bg-gradient-to-br from-green-900 to-green-950 text-white p-8 space-y-6">
            {[
              { stat: "21+", label: "Age requirement", note: "Valid government ID required every visit" },
              { stat: "Cash", label: "Only payment", note: "ATM available on-site" },
              { stat: "WA", label: "Licensed retailer", note: `License #${STORE.wslcbLicense ?? "—"}` },
              {
                stat: "Daily",
                label: "We're open",
                note: `${STORE.hours.find((h) => h.day === "Monday")?.open ?? "8:00 AM"} every morning`,
              },
            ].map(({ stat, label, note }) => (
              <div key={label} className="flex items-center gap-4">
                <div className="w-14 text-right shrink-0">
                  <span className="text-2xl font-extrabold text-green-300">{stat}</span>
                </div>
                <div className="h-8 w-px bg-green-700 shrink-0" />
                <div>
                  <div className="font-bold text-white text-sm">{label}</div>
                  <div className="text-green-300/70 text-xs">{note}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Values */}
        <section className="space-y-6">
          <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">What We Stand For</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: "🎓",
                title: "Education First",
                body: "We don't just sell cannabis — we help you understand it. Our budtenders know terpenes, effects, dosing, and product pairings inside and out.",
                color: "bg-green-50 border-green-200",
              },
              {
                icon: "🌿",
                title: "Quality Curation",
                body: "Every product on our shelves was chosen deliberately. We try everything before it hits the shelf and drop what doesn't meet our standard.",
                color: "bg-emerald-50 border-emerald-200",
              },
              {
                icon: "📍",
                title: "Community Rooted",
                body: "We're a Wenatchee business first. We know our customers by name, support local events, and carry products made by Washington producers.",
                color: "bg-teal-50 border-teal-200",
              },
            ].map(({ icon, title, body, color }) => (
              <div key={title} className={`rounded-2xl border p-6 space-y-3 ${color}`}>
                <span className="text-3xl">{icon}</span>
                <h3 className="font-bold text-stone-900">{title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Featured alumni — standout past staff who shaped the shop. Doug
            asked these be featured here (in addition to the full roster on
            /our-story) so first-time visitors landing on /about see the
            crew that built the staff reputation. Deep-link out to /our-story
            for the full team. */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">
                The crew that built our reputation
              </h2>
              <p className="text-stone-500 text-sm mt-1.5 max-w-xl">
                Twelve years of standout budtenders. A few who&apos;ve moved on, but the standards they set
                are still on the floor every day.
              </p>
            </div>
            <div className="flex items-center gap-4 flex-wrap">
              <Link
                href="/alumni"
                className="text-sm font-semibold text-green-700 hover:text-green-600 transition-colors"
              >
                Past staff: claim your profile →
              </Link>
              <Link
                href="/our-story"
                className="text-sm font-semibold text-stone-500 hover:text-green-600 transition-colors"
              >
                Full team roster →
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {ALUMNI_TEAM.map((m) => (
              <div
                key={m.name}
                className="rounded-2xl bg-white border border-stone-200 p-5 flex items-start gap-4"
              >
                <div className="shrink-0">
                  {m.photoSrc ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={m.photoSrc}
                      alt={`${m.name} — ${m.role}`}
                      className="w-12 h-12 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-800 font-bold text-sm tracking-wide">
                      {initialOf(m.name)}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-stone-900 text-sm leading-tight">{m.name}</div>
                  <div className="text-green-700 text-xs font-semibold mt-0.5">{m.role}</div>
                  <p className="text-stone-600 text-xs leading-relaxed mt-2">{m.oneLine}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Amenities */}
        <section className="rounded-3xl bg-stone-50 border border-stone-100 p-8 space-y-5">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">When You Visit</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[...STORE.amenities, ...STORE.perks].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-stone-600">
                <svg className="w-4 h-4 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.285 6.709a1 1 0 00-1.414-1.418l-9.286 9.286-3.856-3.856a1 1 0 00-1.414 1.414l4.563 4.563a1 1 0 001.414 0l9.993-9.989z" />
                </svg>
                {item}
              </div>
            ))}
          </div>
        </section>

        {/* Location */}
        <section className="space-y-5">
          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Come See Us</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-stone-100 bg-white p-6 space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0 mt-0.5">
                  <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                </div>
                <div>
                  <div className="font-bold text-stone-900">{STORE.address.street}</div>
                  <div className="text-stone-500 text-sm">
                    {STORE.address.city}, {STORE.address.state} {STORE.address.zip}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-green-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                </div>
                <a
                  href={`tel:${STORE.phoneTel}`}
                  className="font-bold text-green-700 hover:text-green-600 transition-colors"
                >
                  {STORE.phone}
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center shrink-0">
                  <svg
                    className="w-5 h-5 text-green-700"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <a
                  href={`mailto:${STORE.email}`}
                  className="font-bold text-green-700 hover:text-green-600 transition-colors text-sm"
                >
                  {STORE.email}
                </a>
              </div>
              <div className="pt-1 flex gap-3">
                <a
                  href={STORE.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-xl bg-green-800 hover:bg-green-700 text-white text-sm font-bold transition-colors"
                >
                  Get Directions ↗
                </a>
                <Link
                  href={withAttr("/contact", "header", "about-location")}
                  className="px-4 py-2 rounded-xl border border-stone-200 hover:border-green-300 text-sm font-semibold text-stone-700 hover:text-green-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                >
                  Contact Us
                </Link>
              </div>
            </div>

            {/* Hours */}
            <div className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
              <div className="px-5 py-3 bg-green-950 text-white">
                <span className="font-bold text-sm">Store Hours</span>
              </div>
              {STORE.hours.map((h) => {
                const isToday =
                  h.day ===
                  new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    timeZone: "America/Los_Angeles",
                  });
                return (
                  <div
                    key={h.day}
                    className={`flex justify-between px-5 py-2.5 text-sm border-b border-stone-50 ${isToday ? "bg-green-50" : ""}`}
                  >
                    <span className={`font-medium ${isToday ? "text-green-800" : "text-stone-600"}`}>
                      {h.day}
                      {isToday && (
                        <span className="ml-2 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full">
                          Today
                        </span>
                      )}
                    </span>
                    <span
                      className={`tabular-nums ${isToday ? "text-green-700 font-bold" : "text-stone-400"}`}
                    >
                      {h.open} – {h.close}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
        {/* Subtle handoff to the team-roster page. Doesn't shout — sits as
            a quiet link before the bottom CTA for readers who want more. */}
        <section className="text-center">
          <Link
            href="/our-story"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green-700 hover:text-green-600 transition-colors"
          >
            Meet the people who built this place →
          </Link>
        </section>

        {/* Internal-link mesh — surfaces highest-converting next pages so
            the about-page reader has a clear next move. */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link
            href={withAttr("/heroes", "header", "about-mesh-heroes")}
            className="group rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div className="text-2xl mb-2" aria-hidden="true">🎖️</div>
            <h3 className="font-bold text-stone-900 text-sm">Heroes 20% off</h3>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Military, vets, first responders, healthcare, K-12 teachers.
            </p>
            <span className="text-green-700 group-hover:text-green-600 text-xs font-bold mt-3 inline-flex items-center gap-1">
              Eligibility
              <span aria-hidden="true">→</span>
            </span>
          </Link>
          <Link
            href={withAttr("/brands", "header", "about-mesh-brands")}
            className="group rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div className="text-2xl mb-2" aria-hidden="true">🌿</div>
            <h3 className="font-bold text-stone-900 text-sm">Brands we curate</h3>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Hand-picked Washington-state producers across every category.
            </p>
            <span className="text-green-700 group-hover:text-green-600 text-xs font-bold mt-3 inline-flex items-center gap-1">
              See the lineup
              <span aria-hidden="true">→</span>
            </span>
          </Link>
          <Link
            href={withAttr("/find-your-strain", "quiz", "about-mesh")}
            className="group rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
          >
            <div className="text-2xl mb-2" aria-hidden="true">🧭</div>
            <h3 className="font-bold text-stone-900 text-sm">Find your strain</h3>
            <p className="text-xs text-stone-500 mt-1.5 leading-relaxed">
              Tell us how you want to feel — we&apos;ll match you to the right cultivar.
            </p>
            <span className="text-green-700 group-hover:text-green-600 text-xs font-bold mt-3 inline-flex items-center gap-1">
              Take the quiz
              <span aria-hidden="true">→</span>
            </span>
          </Link>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-3xl bg-green-950 text-white p-8 text-center space-y-4">
          <p className="font-bold text-xl">Come see us in Wenatchee</p>
          <p className="text-green-300/70 text-sm max-w-sm mx-auto">
            Open every day. No appointment needed. Walk-ins always welcome.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link
              href={withAttr("/menu", "menu", "about-bottom")}
              className="px-5 py-2.5 rounded-xl bg-green-400 hover:bg-green-300 text-green-950 text-sm font-bold transition-all shadow-md hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300 focus-visible:ring-offset-2 focus-visible:ring-offset-green-950"
            >
              Order for Pickup
            </Link>
            <Link
              href={withAttr("/contact", "header", "about-bottom")}
              className="px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-sm font-semibold transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-green-300"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
