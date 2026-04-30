import type { Metadata } from "next";
import Link from "next/link";
import { STORE, isOpenNow } from "@/lib/store";
import { getActiveBrands, getFeaturedProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${STORE.name} | Cannabis Dispensary Wenatchee, WA`,
  alternates: { canonical: "/" },
};

function OpenBadge() {
  const open = isOpenNow();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);
  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide ${open ? "bg-green-400/20 border border-green-400/40 text-green-200" : "bg-red-400/20 border border-red-400/40 text-red-200"}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-400 shadow-[0_0_6px_#4ade80]" : "bg-red-400"}`} />
      {open ? "Open Now" : "Closed"}
      {todayHours && <span className="opacity-70 font-normal">· {todayHours.open}–{todayHours.close}</span>}
    </div>
  );
}

const CATEGORIES = [
  { icon: "🌿", label: "Flower",       desc: "Indoor, outdoor & greenhouse",  href: "/menu" },
  { icon: "🍬", label: "Edibles",      desc: "Gummies, chocolates & more",     href: "/menu" },
  { icon: "💨", label: "Vapes",        desc: "Carts & all-in-ones",            href: "/menu" },
  { icon: "🧴", label: "Concentrates", desc: "Live resin, wax & shatter",      href: "/menu" },
  { icon: "🫙", label: "Pre-Rolls",    desc: "Singles & multi-packs",          href: "/menu" },
  { icon: "💊", label: "Tinctures",    desc: "Oils & capsules",                href: "/menu" },
];

export default async function HomePage() {
  const [brands, featured] = await Promise.all([
    getActiveBrands().catch(() => []),
    getFeaturedProducts(8).catch(() => []),
  ]);
  const featuredBrands = brands.filter((b) => b.logoUrl).slice(0, 10);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-green-950 text-white overflow-hidden">
        {/* layered background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full opacity-25"
            style={{ backgroundImage: "radial-gradient(ellipse 80% 60% at 20% 40%, #166534, transparent), radial-gradient(ellipse 60% 80% at 80% 10%, #14532d, transparent)" }} />
          <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full opacity-10"
            style={{ background: "radial-gradient(circle, #4ade80, transparent 70%)" }} />
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16 sm:pt-32 sm:pb-24">
          <div className="max-w-3xl space-y-6">
            <OpenBadge />
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
              Wenatchee&apos;s<br />
              <span className="text-green-300">Premier</span>{" "}
              <span className="text-green-100">Cannabis</span>
            </h1>
            <p className="text-green-100/75 text-lg sm:text-xl leading-relaxed max-w-xl">
              Premium flower, concentrates, edibles, vapes, and more — curated by experts who know Washington cannabis.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/order"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-bold text-base transition-all shadow-lg shadow-green-900/40 hover:shadow-green-900/60 hover:-translate-y-0.5">
                Order for Pickup
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/menu"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-base transition-all">
                Browse Menu
              </Link>
              <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-base transition-all">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Directions
              </a>
            </div>
          </div>
        </div>

        {/* bottom fade */}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-gradient-to-t from-[#fafaf9] to-transparent" />
      </section>

      {/* ─── Amenities bar ──────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
          {[...STORE.amenities, ...STORE.perks].map((item) => (
            <span key={item} className="flex items-center gap-1.5 text-xs text-stone-500 whitespace-nowrap">
              <svg className="w-3 h-3 text-green-600 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.285 6.709a1 1 0 00-1.414-1.418l-9.286 9.286-3.856-3.856a1 1 0 00-1.414 1.414l4.563 4.563a1 1 0 001.414 0l9.993-9.989z"/>
              </svg>
              {item}
            </span>
          ))}
          <span className="text-xs text-stone-400 font-medium">· Cash only · 21+ · Valid ID</span>
        </div>
      </section>

      {/* ─── Category cards ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">What We Carry</h2>
          <p className="text-stone-400 mt-2 text-sm">Carefully curated from Washington&apos;s best producers</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map(({ icon, label, desc, href }) => (
            <Link key={label} href={href}
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-100 bg-white hover:border-green-300 hover:bg-green-50 hover:shadow-md transition-all text-center">
              <span className="text-3xl group-hover:scale-110 transition-transform duration-200">{icon}</span>
              <div>
                <div className="font-bold text-stone-800 group-hover:text-green-800 transition-colors text-sm">{label}</div>
                <div className="text-xs text-stone-400 mt-0.5 leading-tight">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── How pickup works ──────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-y border-stone-100 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">How Pickup Works</h2>
            <p className="text-stone-400 mt-2 text-sm">Order ahead and skip the wait</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
            <div className="hidden sm:block absolute top-8 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-px bg-stone-200" />
            {[
              { step: "1", icon: "📱", title: "Browse & Order", body: "Shop our full menu from your phone. Add items to your cart and place your pickup order in minutes." },
              { step: "2", icon: "✅", title: "We Prepare It", body: "Your order goes straight to the counter. We'll have it bagged and ready before you walk in the door." },
              { step: "3", icon: "💵", title: "Pay Cash & Go", body: "Show your ID, pay cash at the counter, and you're on your way. No surprise charges, ever." },
            ].map(({ step, icon, title, body }) => (
              <div key={step} className="relative flex flex-col items-center text-center gap-4">
                <div className="relative z-10 w-16 h-16 rounded-2xl bg-white border-2 border-stone-200 flex items-center justify-center text-2xl shadow-sm">
                  {icon}
                  <span className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-green-600 text-white text-xs font-extrabold flex items-center justify-center">{step}</span>
                </div>
                <div>
                  <div className="font-extrabold text-stone-900 text-base">{title}</div>
                  <p className="text-stone-400 text-sm mt-1 leading-relaxed">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/order"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-green-700 hover:bg-green-600 text-white font-bold text-sm transition-all shadow-md hover:-translate-y-0.5">
              Start Your Order →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Featured products ──────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="bg-stone-50 border-y border-stone-100 py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">Today&apos;s Picks</h2>
                <p className="text-stone-400 mt-1 text-sm">Fresh arrivals &amp; staff favorites</p>
              </div>
              <Link href="/menu" className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-600 transition-colors">
                Full menu →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => (
                <Link key={p.id} href="/order"
                  className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-green-300 hover:shadow-lg transition-all">
                  <div className="aspect-square bg-stone-100 overflow-hidden relative">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-stone-100 to-stone-200">
                        {p.category === "Flower" ? "🌿" : p.category === "Edibles" ? "🍬" : p.category === "Vapes" ? "💨" : p.category === "Concentrates" ? "🧴" : p.category === "Pre-Rolls" ? "🫙" : "🌱"}
                      </div>
                    )}
                    {p.strainType && (
                      <span className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                        p.strainType === "Sativa" ? "bg-amber-100 text-amber-700" :
                        p.strainType === "Indica" ? "bg-purple-100 text-purple-700" :
                        "bg-green-100 text-green-700"
                      }`}>
                        {p.strainType}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    {p.brand && <div className="text-xs text-stone-400 font-medium uppercase tracking-wide truncate">{p.brand}</div>}
                    <div className="font-semibold text-stone-900 text-sm leading-tight line-clamp-2">{p.name}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-green-800">${p.unitPrice?.toFixed(2)}</span>
                      {p.thcPct != null && (
                        <span className="text-xs text-stone-400">THC {p.thcPct.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/order"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-green-800 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                Order for Pickup
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Why Green Life ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight text-center mb-10">Why Green Life?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🎓",
              title: "Expert Budtenders",
              body: "Our staff knows cannabis deeply — terpenes, effects, dosing, and perfect product pairings for every lifestyle.",
              accent: "bg-green-50 border-green-200",
            },
            {
              icon: "🌿",
              title: "Curated Selection",
              body: "We handpick every product on our shelves, prioritizing quality, value, and Washington-grown producers.",
              accent: "bg-emerald-50 border-emerald-200",
            },
            {
              icon: "📍",
              title: "Locally Rooted",
              body: "Born and raised in Wenatchee. We know our community and carry products you won't find everywhere else.",
              accent: "bg-teal-50 border-teal-200",
            },
          ].map(({ icon, title, body, accent }) => (
            <div key={title} className={`rounded-2xl border p-6 space-y-3 ${accent}`}>
              <span className="text-3xl">{icon}</span>
              <h3 className="font-bold text-stone-900 text-base">{title}</h3>
              <p className="text-stone-500 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Hours + Map ────────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Visit Us</h2>
              <p className="text-stone-400 text-sm mt-1">{STORE.address.full}</p>
            </div>
            <div className="rounded-2xl border border-stone-100 overflow-hidden divide-y divide-stone-50">
              {STORE.hours.map((h) => {
                const isToday = h.day === new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
                return (
                  <div key={h.day}
                    className={`flex justify-between items-center px-4 py-3 text-sm ${isToday ? "bg-green-50" : "bg-white hover:bg-stone-50 transition-colors"}`}>
                    <span className={`font-semibold ${isToday ? "text-green-800" : "text-stone-700"}`}>
                      {h.day}
                      {isToday && <span className="ml-2 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-medium">Today</span>}
                    </span>
                    <span className={`tabular-nums ${isToday ? "text-green-700 font-bold" : "text-stone-400"}`}>
                      {h.open} – {h.close}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3">
              <a href={`tel:${STORE.phoneTel}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 hover:bg-green-50 text-sm font-semibold text-stone-700 hover:text-green-700 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {STORE.phone}
              </a>
              <a href={`mailto:${STORE.email}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 hover:bg-green-50 text-sm font-semibold text-stone-700 hover:text-green-700 transition-all">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Email Us
              </a>
              <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-800 hover:bg-green-700 text-white text-sm font-semibold transition-all">
                Get Directions ↗
              </a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm aspect-[4/3]">
            <iframe
              title="Green Life Cannabis location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(STORE.address.full)}&output=embed`}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ─── Brands ─────────────────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">Top Brands</h2>
              <p className="text-stone-400 mt-1 text-sm">Washington&apos;s finest producers, on our shelves</p>
            </div>
            <Link href="/brands" className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-600 transition-colors">
              All {brands.length} brands →
            </Link>
          </div>
          {featuredBrands.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
              {featuredBrands.map((brand) => (
                <Link key={brand.id} href={`/brands/${brand.slug}`}
                  className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border border-stone-100 bg-white hover:border-green-300 hover:shadow-md transition-all aspect-square">
                  <img src={brand.logoUrl!} alt={brand.name}
                    className="max-h-14 max-w-full object-contain group-hover:scale-105 transition-transform duration-200" />
                  <span className="text-xs text-stone-400 group-hover:text-green-700 transition-colors text-center leading-tight font-medium">
                    {brand.name}
                  </span>
                </Link>
              ))}
              {brands.length > featuredBrands.length && (
                <Link href="/brands"
                  className="flex flex-col items-center justify-center gap-1 p-4 rounded-2xl border-2 border-dashed border-stone-200 hover:border-green-300 bg-stone-50 hover:bg-green-50 transition-all aspect-square">
                  <span className="text-2xl font-extrabold text-stone-300">+{brands.length - featuredBrands.length}</span>
                  <span className="text-xs text-stone-400 font-medium">more brands</span>
                </Link>
              )}
            </div>
          ) : (
            <Link href="/brands"
              className="block rounded-2xl border-2 border-dashed border-stone-200 hover:border-green-300 hover:bg-green-50 transition-all py-14 text-center group">
              <p className="text-stone-400 group-hover:text-green-600 transition-colors font-semibold">See all brands we carry →</p>
            </Link>
          )}
        </section>
      )}

      {/* ─── CTA band ───────────────────────────────────────────────────────── */}
      <section className="bg-green-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to order?</h2>
            <p className="text-green-300/80 text-sm">Skip the wait — order online and pick up in store.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/order"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-green-500 hover:bg-green-400 text-white font-bold text-base transition-all shadow-lg hover:-translate-y-0.5">
              Order for Pickup
            </Link>
            <Link href="/menu"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-base transition-all">
              Browse Menu
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
