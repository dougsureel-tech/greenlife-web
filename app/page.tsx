import type { Metadata } from "next";
import Link from "next/link";
import { STORE, isOpenNow } from "@/lib/store";
import { getActiveBrands, getFeaturedProducts } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${STORE.name} | Cannabis Dispensary Wenatchee, WA`,
  description: `${STORE.name} at ${STORE.address.full}. Wenatchee's premier cannabis shop — flower, edibles, vapes, concentrates, pre-rolls. Open daily 8am–10pm. Cash only, 21+.`,
  alternates: { canonical: "/" },
};

const CATEGORIES = [
  { icon: "🌿", label: "Flower",       desc: "Indoor, outdoor & greenhouse", href: "/menu", color: "from-green-600 to-emerald-800" },
  { icon: "🍬", label: "Edibles",      desc: "Gummies, chocolates & more",    href: "/menu", color: "from-orange-500 to-rose-700" },
  { icon: "💨", label: "Vapes",        desc: "Carts & all-in-ones",           href: "/menu", color: "from-sky-500 to-blue-800" },
  { icon: "🧴", label: "Concentrates", desc: "Wax, live resin & shatter",     href: "/menu", color: "from-purple-500 to-violet-800" },
  { icon: "🫙", label: "Pre-Rolls",    desc: "Singles & multi-packs",         href: "/menu", color: "from-amber-500 to-orange-700" },
  { icon: "💧", label: "Tinctures",    desc: "Oils & capsules",               href: "/menu", color: "from-teal-500 to-green-700" },
];

const STATS = [
  { val: "Open Daily",    label: "8 AM – 10 PM" },
  { val: "Free Parking",  label: "Right out front" },
  { val: "Veteran-Owned", label: "& community-first" },
  { val: "Cash Only",     label: "ATM on-site" },
];

export default async function HomePage() {
  const [brands, featured] = await Promise.all([
    getActiveBrands().catch(() => []),
    getFeaturedProducts(8).catch(() => []),
  ]);
  const featuredBrands = brands.filter((b) => b.logoUrl).slice(0, 10);
  const open = isOpenNow();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-green-950 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }} />
        <div className="absolute inset-0"
          style={{ backgroundImage: "radial-gradient(ellipse 70% 80% at 15% 50%, #14532d44, transparent), radial-gradient(ellipse 50% 60% at 90% 20%, #16a34a22, transparent)" }} />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none"
          style={{ background: "radial-gradient(circle, #4ade80, transparent 70%)" }} />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">

            {/* Left: content */}
            <div className="flex-1 space-y-7">
              <div className="flex items-center gap-3 flex-wrap">
                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                  open
                    ? "bg-green-400/15 border-green-400/30 text-green-300"
                    : "bg-red-400/15 border-red-400/30 text-red-300"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${open ? "bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" : "bg-red-400"}`} />
                  {open ? "Open Now" : "Closed"}
                  {todayHours && <span className="opacity-70 font-normal">· {todayHours.open}–{todayHours.close}</span>}
                </div>
                <span className="text-green-400/60 text-xs font-medium uppercase tracking-widest">Wenatchee, WA</span>
              </div>

              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                  Wenatchee&apos;s<br />
                  <span className="text-green-300">Favorite</span>{" "}
                  <span className="text-white/90">Cannabis</span><br />
                  <span className="text-green-100/70 font-light">Shop.</span>
                </h1>
                <p className="text-green-100/60 text-lg sm:text-xl leading-relaxed max-w-lg mt-5">
                  Expert budtenders, top brands, and a welcoming space — whether it&apos;s your first time or your fiftieth.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/order"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-green-400 hover:bg-green-300 active:bg-green-500 text-green-950 font-bold text-base transition-all shadow-lg shadow-green-900/40 hover:-translate-y-0.5">
                  Order for Pickup
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link href="/menu"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-base transition-all">
                  Browse Menu
                </Link>
              </div>

              <div className="flex items-center gap-5 text-xs text-green-400/55 font-medium pt-1 flex-wrap">
                {["Cash only", "21+ with valid ID", "Free parking"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.285 6.709a1 1 0 00-1.414-1.418l-9.286 9.286-3.856-3.856a1 1 0 00-1.414 1.414l4.563 4.563a1 1 0 001.414 0l9.993-9.989z"/>
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: store info card (desktop only) */}
            <div className="hidden lg:block shrink-0">
              <div className="rounded-3xl border border-white/15 p-6 w-72 space-y-5" style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}>
                <div className="flex items-center gap-3">
                  <span className={`w-3 h-3 rounded-full shrink-0 ${open ? "bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" : "bg-red-400"}`} />
                  <div>
                    <div className="text-white font-bold text-sm">{open ? "Open Now" : "Currently Closed"}</div>
                    {todayHours && <div className="text-green-300/70 text-xs">{todayHours.open} – {todayHours.close} today</div>}
                  </div>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-start gap-3">
                  <svg className="w-4 h-4 mt-0.5 text-green-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                  <div>
                    <div className="text-white text-sm font-medium">{STORE.address.street}</div>
                    <div className="text-white/50 text-xs">{STORE.address.city}, WA {STORE.address.zip}</div>
                  </div>
                </div>
                <div className="h-px bg-white/10" />
                <div className="grid grid-cols-2 gap-y-3 gap-x-3">
                  {[
                    { icon: "🅿️", text: "Free Parking" },
                    { icon: "💵", text: "Cash Only" },
                    { icon: "🏧", text: "ATM On-Site" },
                    { icon: "🪪", text: "21+ Required" },
                  ].map(({ icon, text }) => (
                    <div key={text} className="flex items-center gap-2 text-white/60 text-xs">
                      <span className="text-base leading-none">{icon}</span>
                      {text}
                    </div>
                  ))}
                </div>
                <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all">
                  Get Directions ↗
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-stone-50 to-transparent" />
      </section>

      {/* ─── Stats strip ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-stone-100">
            {STATS.map(({ val, label }) => (
              <div key={val} className="py-5 px-4 sm:px-6 text-center">
                <div className="text-sm sm:text-base font-extrabold text-green-900 leading-tight">{val}</div>
                <div className="text-xs text-stone-400 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Category grid ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">What We Carry</h2>
          <p className="text-stone-400 mt-2 text-sm">Premium products from the Pacific Northwest&apos;s top producers</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map(({ icon, label, desc, href, color }) => (
            <Link key={label} href={href}
              className={`group relative flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br ${color} hover:scale-[1.03] hover:shadow-xl transition-all duration-200 overflow-hidden`}>
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/10" />
              <span className="text-3xl relative">{icon}</span>
              <div className="relative">
                <div className="font-bold text-white text-sm">{label}</div>
                <div className="text-white/65 text-xs mt-0.5 leading-tight">{desc}</div>
              </div>
              <svg className="absolute bottom-3.5 right-3.5 w-4 h-4 text-white/25 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all duration-200"
                fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── How Pickup Works ───────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">How Pickup Works</h2>
            <p className="text-stone-400 mt-2 text-sm">Order ahead, skip the wait</p>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="hidden sm:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-green-100" />
            {[
              { icon: "📱", step: "1", title: "Browse & Order", body: "Shop our full menu and place a pickup order — pay nothing until you arrive." },
              { icon: "✅", step: "2", title: "We Prepare It",  body: "Our team gets your order ready. Track status updates right in your account." },
              { icon: "💵", step: "3", title: "Pay Cash & Go",  body: "Head to the counter, pay cash, and you're out the door. Fast and easy." },
            ].map(({ icon, step, title, body }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3 relative">
                <div className="w-20 h-20 rounded-3xl bg-white border-2 border-green-100 flex items-center justify-center text-3xl shadow-sm z-10">
                  {icon}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-green-500 uppercase tracking-widest">Step {step}</div>
                  <div className="font-bold text-stone-900 text-base">{title}</div>
                  <p className="text-stone-500 text-sm leading-relaxed max-w-xs mx-auto">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/order"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-green-800 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
              Start Your Order →
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Featured products ──────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-16">
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
                <Link key={p.id} href="/menu"
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
                        p.strainType === "Sativa"  ? "bg-amber-100 text-amber-700" :
                        p.strainType === "Indica"  ? "bg-purple-100 text-purple-700" :
                                                     "bg-green-100 text-green-700"
                      }`}>{p.strainType}</span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    {p.brand && <div className="text-xs text-stone-400 font-medium uppercase tracking-wide truncate">{p.brand}</div>}
                    <div className="font-semibold text-stone-900 text-sm leading-tight line-clamp-2">{p.name}</div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-green-800">${p.unitPrice?.toFixed(2)}</span>
                      {p.thcPct != null && <span className="text-xs text-stone-400">THC {p.thcPct.toFixed(1)}%</span>}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/menu"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-green-800 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                View Full Menu →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Why Green Life ─────────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight text-center mb-10">Why Green Life?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {[
              {
                icon: "🌿",
                title: "Handpicked Products",
                body: "Every item on our shelves is chosen for quality and value. Washington-grown, expertly curated.",
                accent: "bg-green-50 border-green-200",
                iconBg: "bg-green-100",
              },
              {
                icon: "👋",
                title: "Welcoming to Everyone",
                body: "First-timer or regular, our budtenders give you real answers — no pressure, no judgment, just good guidance.",
                accent: "bg-amber-50 border-amber-200",
                iconBg: "bg-amber-100",
              },
              {
                icon: "📍",
                title: "Right in Wenatchee",
                body: "Easy to find, free parking, and always stocked. Your neighborhood dispensary.",
                accent: "bg-blue-50 border-blue-200",
                iconBg: "bg-blue-100",
              },
            ].map(({ icon, title, body, accent, iconBg }) => (
              <div key={title} className={`rounded-2xl border p-6 space-y-4 ${accent}`}>
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center text-2xl`}>{icon}</div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed mt-1">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Hours + Map ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Visit Us</h2>
              <p className="text-stone-400 text-sm mt-1">{STORE.address.full}</p>
            </div>
            <div className="rounded-2xl border border-stone-100 overflow-hidden">
              <div className="px-5 py-4 bg-green-950 text-white flex justify-between items-center">
                <span className="font-bold text-sm">Store Hours</span>
                <div className={`inline-flex items-center gap-1.5 text-xs font-semibold ${open ? "text-green-300" : "text-red-300"}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                  {open ? "Open Now" : "Closed"}
                </div>
              </div>
              <div className="divide-y divide-stone-50">
                {STORE.hours.map((h, i) => {
                  const isToday = h.day === today;
                  return (
                    <div key={h.day} className={`px-5 py-3 flex justify-between text-sm ${isToday ? "bg-green-50 font-semibold" : i % 2 === 0 ? "bg-white" : "bg-stone-50/50"}`}>
                      <span className={isToday ? "text-green-800" : "text-stone-600"}>{h.day}</span>
                      <span className={isToday ? "text-green-700" : "text-stone-500"}>{h.open} – {h.close}</span>
                    </div>
                  );
                })}
              </div>
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
            <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to shop?</h2>
            <p className="text-green-300/80 text-sm">Order ahead or walk in — we&apos;re here every day, 8 AM to 10 PM.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link href="/order"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-base transition-all shadow-lg hover:-translate-y-0.5">
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
