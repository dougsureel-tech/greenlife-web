import type { Metadata } from "next";
import Link from "next/link";
import { STORE, isOpenNow } from "@/lib/store";

export const metadata: Metadata = {
  title: `${STORE.name} | Cannabis Dispensary Wenatchee, WA`,
  alternates: { canonical: "/" },
};

function HoursWidget() {
  const open = isOpenNow();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
  const todayHours = STORE.hours.find((h) => h.day === today);
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur text-white text-sm">
      <span className={`w-2 h-2 rounded-full ${open ? "bg-green-400" : "bg-red-400"}`} />
      <span className="font-medium">{open ? "Open Now" : "Closed"}</span>
      {todayHours && (
        <span className="text-white/70">· Today {todayHours.open}–{todayHours.close}</span>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-green-950 via-green-900 to-green-800 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 30% 50%, #4ade80, transparent 60%), radial-gradient(circle at 80% 20%, #86efac, transparent 50%)" }}
        />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-32">
          <div className="max-w-2xl space-y-6">
            <HoursWidget />
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
              Wenatchee&apos;s<br />
              <span className="text-green-300">Premier Cannabis</span><br />
              Dispensary
            </h1>
            <p className="text-green-100/80 text-lg sm:text-xl leading-relaxed">
              Premium flower, concentrates, edibles, vapes, and more. Serving the Wenatchee Valley with knowledgeable budtenders who help you find exactly what you need.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Link href="/menu" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-green-500 hover:bg-green-400 text-white font-semibold text-base transition-colors">
                Shop Our Menu
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-white/20 hover:border-white/40 text-white font-medium text-base transition-colors">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Get Directions
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Info bar */}
      <section className="bg-green-800 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-300 shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
            </svg>
            <span className="text-green-200">{STORE.address.full}</span>
          </div>
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-green-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <a href={`tel:${STORE.phoneTel}`} className="text-green-200 hover:text-white transition-colors">{STORE.phone}</a>
          </div>
          <span className="text-green-400 text-xs">Cash only · Must be 21+ · Valid ID required</span>
        </div>
      </section>

      {/* Categories */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">What We Carry</h2>
          <p className="text-stone-500 mt-2">Carefully curated products from Washington&apos;s best producers</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { icon: "🌿", label: "Flower",       desc: "Indoor, outdoor & greenhouse" },
            { icon: "🍬", label: "Edibles",      desc: "Gummies, chocolates & more" },
            { icon: "💨", label: "Vapes",        desc: "Cartridges & all-in-ones" },
            { icon: "🧴", label: "Concentrates", desc: "Live resin, wax & shatter" },
            { icon: "🫙", label: "Pre-Rolls",    desc: "Singles & multi-packs" },
            { icon: "💊", label: "Tinctures",    desc: "Oils & capsules" },
          ].map(({ icon, label, desc }) => (
            <Link key={label} href="/menu"
              className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:bg-green-50 transition-all text-center">
              <span className="text-3xl">{icon}</span>
              <div>
                <div className="font-semibold text-stone-800 group-hover:text-green-800 transition-colors text-sm">{label}</div>
                <div className="text-xs text-stone-400 mt-0.5 leading-tight">{desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Hours + Map */}
      <section className="bg-white border-y border-stone-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-stone-900">Store Hours</h2>
              <p className="text-stone-500 text-sm mt-1">{STORE.address.full}</p>
            </div>
            <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 overflow-hidden">
              {STORE.hours.map((h) => {
                const isToday = h.day === new Date().toLocaleDateString("en-US", { weekday: "long" });
                return (
                  <div key={h.day} className={`flex justify-between items-center px-4 py-3 text-sm ${isToday ? "bg-green-50" : "bg-white"}`}>
                    <span className={`font-medium ${isToday ? "text-green-800" : "text-stone-700"}`}>
                      {h.day}{isToday && <span className="ml-2 text-xs text-green-600 font-normal">Today</span>}
                    </span>
                    <span className={`tabular-nums ${isToday ? "text-green-700 font-semibold" : "text-stone-500"}`}>
                      {h.open} – {h.close}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-3">
              <a href={`tel:${STORE.phoneTel}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 text-sm font-medium text-stone-700 hover:text-green-700 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                {STORE.phone}
              </a>
              <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition-colors">
                Directions ↗
              </a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm aspect-[4/3]">
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

      {/* Brands teaser */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-stone-900">Featured Brands</h2>
            <p className="text-stone-500 mt-1 text-sm">We partner with Washington&apos;s top producers</p>
          </div>
          <Link href="/brands" className="shrink-0 text-sm font-medium text-green-700 hover:text-green-600 transition-colors">
            View all brands →
          </Link>
        </div>
        <Link href="/brands"
          className="block rounded-2xl border-2 border-dashed border-stone-200 hover:border-green-300 bg-stone-50 hover:bg-green-50 transition-all py-14 text-center group">
          <p className="text-stone-400 group-hover:text-green-600 transition-colors font-medium">See all brands we carry →</p>
        </Link>
      </section>

      {/* Why us */}
      <section className="bg-green-950 text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-10">Why Green Life?</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { icon: "🎓", title: "Expert Budtenders", body: "Our staff knows cannabis deeply — terpenes, effects, dosing, and perfect product pairings for your lifestyle." },
              { icon: "🌿", title: "Curated Selection", body: "We handpick every product on our shelves, prioritizing quality, value, and Washington-grown producers." },
              { icon: "📍", title: "Serving Wenatchee", body: "Locally rooted since day one. We know our community and carry products you won't find everywhere else." },
            ].map(({ icon, title, body }) => (
              <div key={title} className="text-center space-y-3">
                <span className="text-4xl">{icon}</span>
                <h3 className="font-semibold text-lg text-white">{title}</h3>
                <p className="text-green-300/80 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
