import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { STORE, isOpenNow, nextOpenLabel } from "@/lib/store";
import { getActiveBrands, getFeaturedProducts } from "@/lib/db";
import { MobileStickyCta } from "@/components/MobileStickyCta";
import { DropTicker } from "@/components/DropTicker";
import { ReviewsSection } from "@/components/Reviews";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: `${STORE.name} | Cannabis Dispensary Wenatchee, WA`,
  description: `${STORE.name} at ${STORE.address.full}. Wenatchee's premier cannabis shop — flower, edibles, vapes, concentrates, pre-rolls. Open 8 AM daily, later on Fri & Sat. Cash only, 21+.`,
  alternates: { canonical: "/" },
};

const CATEGORIES = [
  {
    icon: "🌿",
    label: "Flower",
    desc: "Indoor, outdoor & greenhouse",
    href: "/menu",
    color: "from-green-600 to-emerald-800",
  },
  {
    icon: "🍬",
    label: "Edibles",
    desc: "Gummies, chocolates & more",
    href: "/menu",
    color: "from-orange-500 to-rose-700",
  },
  {
    icon: "💨",
    label: "Vapes",
    desc: "Carts & all-in-ones",
    href: "/menu",
    color: "from-sky-500 to-blue-800",
  },
  {
    icon: "🧴",
    label: "Concentrates",
    desc: "Wax, live resin & shatter",
    href: "/menu",
    color: "from-purple-500 to-violet-800",
  },
  {
    icon: "🫙",
    label: "Pre-Rolls",
    desc: "Singles & multi-packs",
    href: "/menu",
    color: "from-amber-500 to-orange-700",
  },
  {
    icon: "💧",
    label: "Tinctures",
    desc: "Oils & capsules",
    href: "/menu",
    color: "from-teal-500 to-green-700",
  },
];

const STATS = [
  { val: "Open Daily", label: "8 AM · later Fri & Sat" },
  { val: "Free Parking", label: "Right out front" },
  { val: "Veteran-Owned", label: "& community-first" },
  { val: "Cash Only", label: "ATM on-site" },
];

export default async function HomePage() {
  const [brands, featured] = await Promise.all([
    getActiveBrands().catch(() => []),
    getFeaturedProducts(8).catch(() => []),
  ]);
  const featuredBrands = brands.filter((b) => b.logoUrl).slice(0, 10);
  const open = isOpenNow();
  const statusLabel = nextOpenLabel();
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
  const todayHours = STORE.hours.find((h) => h.day === today);

  return (
    <>
      {/* ─── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative bg-green-950 text-white overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 70% 80% at 15% 50%, #14532d44, transparent), radial-gradient(ellipse 50% 60% at 90% 20%, #16a34a22, transparent)",
          }}
        />
        <div
          className="absolute top-0 right-0 w-[600px] h-[600px] opacity-10 translate-x-1/4 -translate-y-1/4 pointer-events-none"
          style={{ background: "radial-gradient(circle, #4ade80, transparent 70%)" }}
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 lg:py-32">
          <div className="flex flex-col lg:flex-row lg:items-center gap-12 lg:gap-16">
            {/* Left: content */}
            <div className="flex-1 space-y-7">
              <div className="flex items-center gap-3 flex-wrap">
                <div
                  className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${
                    open
                      ? "bg-green-400/15 border-green-400/30 text-green-300"
                      : "bg-red-400/15 border-red-400/30 text-red-300"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full shrink-0 ${open ? "bg-green-400 shadow-[0_0_6px_#4ade80] animate-pulse" : "bg-red-400"}`}
                  />
                  {open ? "Open Now" : "Closed"}
                  {todayHours && (
                    <span className="opacity-70 font-normal">
                      · {todayHours.open}–{todayHours.close}
                    </span>
                  )}
                </div>
                <span className="text-green-400/60 text-xs font-medium uppercase tracking-widest">
                  Wenatchee, WA
                </span>
              </div>

              {/* Live drop ticker — cycles through newest products */}
              {featured.length > 0 && (
                <DropTicker
                  drops={featured
                    .slice(0, 5)
                    .map((p) => ({ name: p.name, brand: p.brand, category: p.category }))}
                />
              )}

              <div>
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[1.05] tracking-tight">
                  Wenatchee&apos;s
                  <br />
                  <span className="text-green-300">Favorite</span>{" "}
                  <span className="text-white/90">Cannabis</span>
                  <br />
                  <span className="text-green-100/70 font-light">Shop.</span>
                </h1>
                <p className="text-green-100/60 text-lg sm:text-xl leading-relaxed max-w-lg mt-5">
                  Right off Sunnyslope. Pybus to Lake Chelan, Saddlerock to the Cascades — pull up, pick what
                  fits the day. Top WA brands, real budtenders, five-minute pickup.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-green-400 hover:bg-green-300 active:bg-green-500 text-green-950 font-bold text-base transition-all shadow-lg shadow-green-900/40 hover:-translate-y-0.5"
                >
                  Order for Pickup
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/menu"
                  className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-base transition-all"
                >
                  Browse Menu
                </Link>
              </div>

              <div className="flex items-center gap-5 text-xs text-green-400/55 font-medium pt-1 flex-wrap">
                {["Cash only", "21+ with valid ID", "Free parking"].map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.285 6.709a1 1 0 00-1.414-1.418l-9.286 9.286-3.856-3.856a1 1 0 00-1.414 1.414l4.563 4.563a1 1 0 001.414 0l9.993-9.989z" />
                    </svg>
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {/* Right: store info card (desktop only) */}
            <div className="hidden lg:block shrink-0">
              <div
                className="rounded-3xl border border-white/15 p-6 w-72 space-y-5"
                style={{ background: "rgba(255,255,255,0.06)", backdropFilter: "blur(12px)" }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-3 h-3 rounded-full shrink-0 ${open ? "bg-green-400 shadow-[0_0_8px_#4ade80] animate-pulse" : "bg-red-400"}`}
                  />
                  <div>
                    <div className="text-white font-bold text-sm">
                      {statusLabel || (open ? "Open today" : "Closed today")}
                    </div>
                    {todayHours && (
                      <div className="text-green-300/70 text-xs">
                        Today {todayHours.open} – {todayHours.close}
                      </div>
                    )}
                  </div>
                </div>
                <div className="h-px bg-white/10" />
                <div className="flex items-start gap-3">
                  <svg
                    className="w-4 h-4 mt-0.5 text-green-400 shrink-0"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <div>
                    <div className="text-white text-sm font-medium">{STORE.address.street}</div>
                    <div className="text-white/50 text-xs">
                      {STORE.address.city}, WA {STORE.address.zip}
                    </div>
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
                <a
                  href={STORE.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/15 text-white text-xs font-semibold transition-all"
                >
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
                <div className="text-xs text-stone-600 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Mood / effect shortcut ─────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
          <div className="text-center mb-7">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">How can we help?</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              What are you in the mood for?
            </h2>
            <p className="text-stone-600 mt-1.5 text-sm">
              Pick a vibe — we&apos;ll show you what&apos;s in stock today.
            </p>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 sm:gap-3">
            {[
              // Vibe slugs match VIBES.value in MenuSearch, so the menu filter
              // panel preselects the right chip when these deep-link in.
              {
                emoji: "⚡️",
                label: "Energize",
                vibe: "energize",
                gradient: "from-amber-50 to-orange-100",
                accent: "text-amber-700",
              },
              {
                emoji: "🌊",
                label: "Chill",
                vibe: "chill",
                gradient: "from-sky-50 to-blue-100",
                accent: "text-sky-700",
              },
              {
                emoji: "💤",
                label: "Sleep",
                vibe: "sleep",
                gradient: "from-indigo-50 to-purple-100",
                accent: "text-indigo-700",
              },
              {
                emoji: "🎨",
                label: "Creative",
                vibe: "creative",
                gradient: "from-fuchsia-50 to-pink-100",
                accent: "text-fuchsia-700",
              },
              {
                emoji: "🥂",
                label: "Social",
                vibe: "social",
                gradient: "from-teal-50 to-emerald-100",
                accent: "text-teal-700",
              },
              {
                emoji: "🩹",
                label: "Relief",
                vibe: "relief",
                gradient: "from-rose-50 to-red-100",
                accent: "text-rose-700",
              },
            ].map((m) => (
              <Link
                key={m.label}
                href={`/menu?vibe=${m.vibe}`}
                className={`group flex flex-col items-center justify-center gap-1.5 py-5 rounded-2xl border border-stone-100 bg-gradient-to-br ${m.gradient} hover:scale-[1.04] hover:shadow-md transition-all duration-200`}
              >
                <span className="text-3xl">{m.emoji}</span>
                <span className={`text-xs sm:text-sm font-bold ${m.accent}`}>{m.label}</span>
              </Link>
            ))}
          </div>
          <p className="text-[11px] text-stone-500 text-center mt-4">
            Effect labels come from cultivator notes — they&apos;re a starting point, not a guarantee. Your
            tolerance, dose, and the moment all matter. Talk to a budtender for a tailored pick.
          </p>
          <div className="text-center mt-3">
            <Link
              href="/find-your-strain"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-green-700 hover:text-green-600 transition-colors"
            >
              Or take the 3-question quiz <span aria-hidden>→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── First-timer reassurance ────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">First time?</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              No judgment, just answers.
            </h2>
            <p className="text-stone-600 mt-1.5 text-sm">
              A lot of our regulars started right where you are. Here&apos;s the cheat sheet.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-2">
              <div className="text-2xl">💵</div>
              <h3 className="font-bold text-stone-900 text-base">Bring cash + ID</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Cannabis is federally illegal so banks won&apos;t process card payments — every WA dispensary
                is cash only. Bring a valid government ID; we card every visitor at the door (21+).
              </p>
              <p className="text-xs text-stone-500 pt-1">ATM on-site if you forget.</p>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-2">
              <div className="text-2xl">🌿</div>
              <h3 className="font-bold text-stone-900 text-base">Not sure what you want?</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Use the &ldquo;What are you in the mood for?&rdquo; chips above to filter the menu by feel —
                Energize, Chill, Sleep, etc. Or walk in and ask a budtender; they&apos;ll talk through what
                fits without being pushy.
              </p>
              <Link
                href="/learn"
                className="inline-block text-xs font-bold text-green-700 hover:text-green-600 pt-1"
              >
                Cannabis 101 guide →
              </Link>
            </div>
            <div className="rounded-2xl border border-stone-200 bg-stone-50 p-5 space-y-2">
              <div className="text-2xl">⏱️</div>
              <h3 className="font-bold text-stone-900 text-base">Plan ~15 minutes</h3>
              <p className="text-stone-600 text-sm leading-relaxed">
                Walk-in browse usually runs 10–15 min. Order ahead at{" "}
                <Link href="/menu" className="font-semibold text-green-700 hover:text-green-600">
                  /menu
                </Link>{" "}
                and pickup is closer to 5 — pay cash at the counter and you&apos;re out the door.
              </p>
              <p className="text-xs text-stone-500 pt-1">
                Tax is baked into shelf price. What you see is what you pay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Category grid ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">What We Carry</h2>
          <p className="text-stone-600 mt-2 text-sm">
            Premium products from the Pacific Northwest&apos;s top producers
          </p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {CATEGORIES.map(({ icon, label, desc, href, color }) => (
            <Link
              key={label}
              href={href}
              className={`group relative flex flex-col gap-3 p-5 rounded-2xl bg-gradient-to-br ${color} hover:scale-[1.03] hover:shadow-xl transition-all duration-200 overflow-hidden`}
            >
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-white/10" />
              <span className="text-3xl relative">{icon}</span>
              <div className="relative">
                <div className="font-bold text-white text-sm">{label}</div>
                <div className="text-white/65 text-xs mt-0.5 leading-tight">{desc}</div>
              </div>
              <svg
                className="absolute bottom-3.5 right-3.5 w-4 h-4 text-white/25 group-hover:text-white/60 group-hover:translate-x-0.5 transition-all duration-200"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          ))}
        </div>
      </section>

      {/* ─── Lake-day vibes — summer-leaning section between categories and pickup-how-to.
              Wenatchee is on the Columbia, Lake Chelan an hour north, the Methow another
              hour past that. Most of our customers are picking something up on the way
              out of town, not after work. The category grid above is functional ("what we
              carry") — this section is the inverse: pick the trip, we'll point at the
              shelf. Always-on for now; if winter copy starts feeling stale we can gate
              by month, but Chelan stays warm through October and the framing also
              works for fall hikes, hot tubs, and ski cabins. */}
      <section className="relative overflow-hidden bg-gradient-to-br from-sky-50 via-amber-50/60 to-rose-50 border-y border-stone-100">
        {/* Subtle horizon line — soft mountain silhouette and water ripple gesture. */}
        <svg
          className="absolute inset-x-0 bottom-0 w-full h-24 sm:h-32 text-sky-100/60 pointer-events-none"
          viewBox="0 0 1200 120"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 80 C 200 40, 400 100, 600 70 C 800 40, 1000 90, 1200 60 L1200 120 L0 120 Z" />
        </svg>
        <svg
          className="absolute inset-x-0 top-12 w-full h-16 text-stone-200/50 pointer-events-none"
          viewBox="0 0 1200 60"
          preserveAspectRatio="none"
          fill="currentColor"
          aria-hidden="true"
        >
          <path d="M0 40 L150 10 L260 25 L380 5 L520 30 L660 12 L820 35 L960 15 L1080 28 L1200 18 L1200 60 L0 60 Z" />
        </svg>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <div className="text-center mb-10 sm:mb-12">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-amber-700/80 mb-3">
              <span className="text-sm">☀️</span> Hangin&apos; in the valley
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              Pick the move. We&apos;ll cover the shelf.
            </h2>
            <p className="text-stone-600 mt-2 text-sm sm:text-base max-w-xl mx-auto">
              Right off Sunnyslope. Pybus to Chelan, Saddlerock to the Cascades — pull up, grab what fits the
              day, hit it.
            </p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[
              {
                emoji: "🚤",
                label: "Lake day",
                pitch: "Pre-rolls — Chelan, Wapato, the docks. No grinder, dock-ready.",
                href: "/menu",
                ring: "ring-sky-200/80 hover:ring-sky-400",
                accent: "text-sky-700",
              },
              {
                emoji: "🍎",
                label: "Pybus & the riverfront",
                pitch: "Edibles & drinks — Saturday market, river loop, low-key, no smell",
                href: "/menu",
                ring: "ring-amber-200/80 hover:ring-amber-400",
                accent: "text-amber-700",
              },
              {
                emoji: "🥾",
                label: "Saddlerock & the loop",
                pitch: "Vapes & carts — Apple Capital Loop or up the rock, pocket-sized",
                href: "/menu",
                ring: "ring-emerald-200/80 hover:ring-emerald-400",
                accent: "text-emerald-700",
              },
              {
                emoji: "🔥",
                label: "Cabin & Cascades",
                pitch: "Sealed flower — Stehekin, Methow, Stevens Pass. Stays fresh, smells like home.",
                href: "/menu",
                ring: "ring-rose-200/80 hover:ring-rose-400",
                accent: "text-rose-700",
              },
            ].map((v) => (
              <Link
                key={v.label}
                href={v.href}
                className={`group flex flex-col rounded-2xl bg-white/85 backdrop-blur-sm p-5 sm:p-6 ring-1 ${v.ring} shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200`}
              >
                <span className="text-3xl mb-3" aria-hidden="true">
                  {v.emoji}
                </span>
                <div className={`text-[11px] font-bold uppercase tracking-widest ${v.accent}`}>{v.label}</div>
                <p className="text-sm text-stone-700 leading-snug mt-1.5 flex-1">{v.pitch}</p>
                <span className="text-xs text-stone-500 group-hover:text-stone-800 mt-3 transition-colors">
                  Browse menu →
                </span>
              </Link>
            ))}
          </div>

          <p className="text-center text-xs text-stone-500 mt-8 sm:mt-10">
            21+ with the ID · cash at the counter · keep it sealed in the ride · drive sober, every time
          </p>
        </div>
      </section>

      {/* ─── How Pickup Works ───────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
              How Pickup Works
            </h2>
            <p className="text-stone-600 mt-2 text-sm">Order ahead, skip the wait</p>
          </div>
          <div className="relative grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="hidden sm:block absolute top-10 left-[calc(16.67%+1rem)] right-[calc(16.67%+1rem)] h-0.5 bg-green-100" />
            {[
              {
                icon: "📱",
                step: "1",
                title: "Browse & Order",
                body: "Shop our full menu and place a pickup order — pay nothing until you arrive.",
              },
              {
                icon: "✅",
                step: "2",
                title: "We Prepare It",
                body: "Our team gets your order ready. Track status updates right in your account.",
              },
              {
                icon: "💵",
                step: "3",
                title: "Pay Cash & Go",
                body: "Head to the counter, pay cash, and you're out the door. Fast and easy.",
              },
            ].map(({ icon, step, title, body }) => (
              <div key={step} className="flex flex-col items-center text-center gap-3 relative">
                <div className="w-20 h-20 rounded-3xl bg-white border-2 border-green-100 flex items-center justify-center text-3xl shadow-sm z-10">
                  {icon}
                </div>
                <div className="space-y-1">
                  <div className="text-xs font-bold text-green-500 uppercase tracking-widest">
                    Step {step}
                  </div>
                  <div className="font-bold text-stone-900 text-base">{title}</div>
                  <p className="text-stone-600 text-sm leading-relaxed max-w-xs mx-auto">{body}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link
              href="/menu"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-green-800 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
            >
              Start Your Order →
            </Link>
          </div>

          {/* HowTo JSON-LD — AI engines + Google rich-result fuel for "how
              do I order from Green Life" type queries. Mirrors the visible
              3-step block above. */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "HowTo",
                name: `How to order cannabis for pickup at ${STORE.name}`,
                description:
                  "Three-step pickup flow: build your cart online, we prep it, you pay cash and walk out. Most orders ready in 10–20 minutes.",
                totalTime: "PT15M",
                supply: [
                  { "@type": "HowToSupply", name: "Valid government ID (21+)" },
                  { "@type": "HowToSupply", name: "Cash" },
                ],
                step: [
                  {
                    "@type": "HowToStep",
                    position: 1,
                    name: "Browse & Order",
                    text: "Shop the menu at greenlifecannabis.com/menu and place a pickup order — pay nothing until you arrive.",
                    url: `${STORE.website}/order`,
                  },
                  {
                    "@type": "HowToStep",
                    position: 2,
                    name: "We Prepare It",
                    text: "Our team gets your order ready. You'll get a status update when it's packed and waiting at the counter.",
                    url: `${STORE.website}/order`,
                  },
                  {
                    "@type": "HowToStep",
                    position: 3,
                    name: "Pay Cash & Go",
                    text: "Show valid ID at the door, head to the counter, pay cash, and you're out. Most pickups are 10–20 minutes from order to in-hand.",
                    url: STORE.website,
                  },
                ],
              }),
            }}
          />
        </div>
      </section>

      {/* ─── Featured products ──────────────────────────────────────────────── */}
      {featured.length > 0 && (
        <section className="py-12 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-end justify-between mb-8 gap-4">
              <div>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                  Today&apos;s Picks
                </h2>
                <p className="text-stone-600 mt-1 text-sm">Fresh arrivals &amp; staff favorites</p>
              </div>
              <Link
                href="/menu"
                className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-600 transition-colors"
              >
                Full menu →
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {featured.map((p) => (
                <Link
                  key={p.id}
                  href="/menu"
                  className="group bg-white rounded-2xl border border-stone-100 overflow-hidden hover:border-green-300 hover:shadow-lg transition-all"
                >
                  <div className="aspect-square bg-stone-100 overflow-hidden relative">
                    {p.imageUrl ? (
                      <Image
                        src={p.imageUrl}
                        alt={p.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl bg-gradient-to-br from-stone-100 to-stone-200">
                        {p.category === "Flower"
                          ? "🌿"
                          : p.category === "Edibles"
                            ? "🍬"
                            : p.category === "Vapes"
                              ? "💨"
                              : p.category === "Concentrates"
                                ? "🧴"
                                : p.category === "Pre-Rolls"
                                  ? "🫙"
                                  : "🌱"}
                      </div>
                    )}
                    {p.strainType && (
                      <span
                        className={`absolute top-2 left-2 text-xs px-2 py-0.5 rounded-full font-semibold ${
                          p.strainType === "Sativa"
                            ? "bg-amber-100 text-amber-700"
                            : p.strainType === "Indica"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-green-100 text-green-700"
                        }`}
                      >
                        {p.strainType}
                      </span>
                    )}
                  </div>
                  <div className="p-3 space-y-1">
                    {p.brand && (
                      <div className="text-xs text-stone-600 font-medium uppercase tracking-wide truncate">
                        {p.brand}
                      </div>
                    )}
                    <div className="font-semibold text-stone-900 text-sm leading-tight line-clamp-2">
                      {p.name}
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="font-bold text-green-800">
                        {p.unitPrice != null && p.unitPrice > 0 ? (
                          `$${p.unitPrice.toFixed(2)}`
                        ) : (
                          <span className="text-stone-600 font-medium">In store</span>
                        )}
                      </span>
                      {p.thcPct != null && (
                        <span className="text-xs text-stone-600">THC {p.thcPct.toFixed(1)}%</span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link
                href="/menu"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-green-800 hover:bg-green-700 text-white font-bold text-sm transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5"
              >
                View Full Menu →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ─── Why Green Life ─────────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-y border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight text-center mb-10">
            Why Green Life?
          </h2>
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
                <div className={`w-12 h-12 rounded-2xl ${iconBg} flex items-center justify-center text-2xl`}>
                  {icon}
                </div>
                <div>
                  <h3 className="font-bold text-stone-900 text-base">{title}</h3>
                  <p className="text-stone-500 text-sm leading-relaxed mt-1">{body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Reviews + AggregateRating schema ───────────────────────────────── */}
      <ReviewsSection />

      {/* ─── Hours + Map ────────────────────────────────────────────────────── */}
      <section className="bg-white border-b border-stone-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-6">
            <div>
              <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight">Visit Us</h2>
              <p className="text-stone-600 text-sm mt-1">{STORE.address.full}</p>
            </div>
            <div className="rounded-2xl border border-stone-100 overflow-hidden">
              <div className="px-5 py-4 bg-green-950 text-white flex justify-between items-center">
                <span className="font-bold text-sm">Store Hours</span>
                <div
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold ${open ? "text-green-300" : "text-red-300"}`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-400 animate-pulse" : "bg-red-400"}`}
                  />
                  {open ? "Open Now" : "Closed"}
                </div>
              </div>
              <div className="divide-y divide-stone-50">
                {STORE.hours.map((h, i) => {
                  const isToday = h.day === today;
                  return (
                    <div
                      key={h.day}
                      className={`px-5 py-3 flex justify-between text-sm ${isToday ? "bg-green-50 font-semibold" : i % 2 === 0 ? "bg-white" : "bg-stone-50/50"}`}
                    >
                      <span className={isToday ? "text-green-800" : "text-stone-600"}>{h.day}</span>
                      <span className={isToday ? "text-green-700" : "text-stone-500"}>
                        {h.open} – {h.close}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="flex flex-wrap gap-3">
              <a
                href={`tel:${STORE.phoneTel}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 hover:bg-green-50 text-sm font-semibold text-stone-700 hover:text-green-700 transition-all"
              >
                <svg
                  className="w-4 h-4"
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
                {STORE.phone}
              </a>
              <a
                href={`mailto:${STORE.email}`}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 hover:bg-green-50 text-sm font-semibold text-stone-700 hover:text-green-700 transition-all"
              >
                <svg
                  className="w-4 h-4"
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
                Email Us
              </a>
              <a
                href={STORE.googleMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-green-800 hover:bg-green-700 text-white text-sm font-semibold transition-all"
              >
                Get Directions ↗
              </a>
            </div>
          </div>
          <div className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm aspect-[4/3]">
            <iframe
              title="Green Life Cannabis location"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(STORE.address.full)}&output=embed`}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* ─── Brands ─────────────────────────────────────────────────────────── */}
      {brands.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
                Top Brands
              </h2>
              <p className="text-stone-600 mt-1 text-sm">
                Washington&apos;s finest producers, on our shelves
              </p>
            </div>
            <Link
              href="/brands"
              className="shrink-0 text-sm font-semibold text-green-700 hover:text-green-600 transition-colors"
            >
              All {brands.length} brands →
            </Link>
          </div>
          {featuredBrands.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {featuredBrands.map((brand) => (
                <Link
                  key={brand.id}
                  href={`/brands/${brand.slug}`}
                  className="group flex flex-col rounded-2xl border border-stone-200 bg-white hover:border-green-400 hover:shadow-lg transition-all overflow-hidden"
                >
                  {/* Logo well — soft contrast bg + generous space so the
                      brand mark reads at a glance, like in the case. */}
                  <div className="aspect-[5/3] bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center p-6 border-b border-stone-100">
                    <Image
                      src={brand.logoUrl!}
                      alt={brand.name}
                      width={240}
                      height={144}
                      className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
                      unoptimized
                    />
                  </div>
                  <div className="px-3 py-3 text-center">
                    <span className="text-xs sm:text-sm font-bold text-stone-900 group-hover:text-green-700 transition-colors leading-tight block truncate">
                      {brand.name}
                    </span>
                  </div>
                </Link>
              ))}
              {brands.length > featuredBrands.length && (
                <Link
                  href="/brands"
                  className="group flex flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-stone-300 hover:border-green-400 bg-stone-50 hover:bg-green-50 transition-all"
                >
                  <span className="text-3xl font-extrabold text-stone-500 group-hover:text-green-700 transition-colors">
                    +{brands.length - featuredBrands.length}
                  </span>
                  <span className="text-xs text-stone-600 font-medium group-hover:text-green-700 transition-colors px-2 text-center">
                    See all brands →
                  </span>
                </Link>
              )}
            </div>
          ) : (
            <Link
              href="/brands"
              className="block rounded-2xl border-2 border-dashed border-stone-200 hover:border-green-300 hover:bg-green-50 transition-all py-14 text-center group"
            >
              <p className="text-stone-600 group-hover:text-green-600 transition-colors font-semibold">
                See all brands we carry →
              </p>
            </Link>
          )}
        </section>
      )}

      {/* ─── FAQ — AI Overview / Google rich-result fuel ────────────────────── */}
      <FaqSection />

      {/* Mobile sticky CTA — appears after scrolling past the hero */}
      <MobileStickyCta />

      {/* ─── CTA band ───────────────────────────────────────────────────────── */}
      <section className="bg-green-950 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-2 text-center sm:text-left">
            <h2 className="text-2xl sm:text-3xl font-extrabold">Ready to shop?</h2>
            <p className="text-green-300/80 text-sm">
              Order ahead or walk in — open every day at 8 AM, later on Fri &amp; Sat.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl bg-green-400 hover:bg-green-300 text-green-950 font-bold text-base transition-all shadow-lg hover:-translate-y-0.5"
            >
              Order for Pickup
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white font-semibold text-base transition-all"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// FAQ section — answers the questions ChatGPT / Perplexity / Google AI
// Overviews actually get asked about local dispensaries, paired with a
// FAQPage JSON-LD payload. This is one of the highest-ROI GEO moves: AI
// engines lift answers verbatim from FAQPage schema when they trust the
// source, and Google's standard SERP can render a rich-result expander
// from the same payload.
// ──────────────────────────────────────────────────────────────────────────
function FaqSection() {
  const faqs: { q: string; a: string }[] = [
    {
      q: "Where is the best dispensary in Wenatchee?",
      a: "Green Life Cannabis is on Sunnyslope at 3001 N Sunnyslope Rd, Wenatchee WA — the closest dispensary to Lake Chelan, the orchards, and US-2 west into the Cascades. Open every day from 8 AM, with Friday and Saturday hours running later. We carry 100+ Washington brands, all WSLCB-licensed.",
    },
    {
      q: "What time does Green Life Cannabis open?",
      a: "8 AM daily. Friday and Saturday close later than the rest of the week — the live status badge at the top of this page shows today's exact hours. We're open every day of the year, including holidays.",
    },
    {
      q: "Do I need cash to buy cannabis at Green Life?",
      a: "Yes — cannabis retailers in Washington can't accept credit or debit cards because cannabis is still federally illegal, so banks won't process card payments for plant-touching businesses. We have an ATM on-site, and free parking right at the door.",
    },
    {
      q: "What's the legal age to buy cannabis in Washington?",
      a: "21 with a valid government ID. WA also recognizes medical authorizations from age 18 with a parent or guardian for qualifying conditions. We card every customer at the door — please bring your ID before you walk in.",
    },
    {
      q: "Can I order cannabis online for pickup at Green Life?",
      a: "Yes. Build your cart on /order, pay in-store when you arrive (cash only). Most orders are ready in 10–20 minutes. You'll get a text when it's packed and waiting at the counter.",
    },
    {
      q: "What's the difference between sativa, indica, and hybrid?",
      a: "Sativa is associated with uplift and focus, indica with relaxation and sleep, hybrids land somewhere in between. The truth is more about each strain's terpene profile and your individual response than the label — pick a vibe above (Energize / Chill / Sleep / Creative / Focus / Relief) and we'll show you what's in stock that fits.",
    },
    {
      q: "Do you sell cannabis edibles, vapes, and concentrates?",
      a: "All of the above, plus pre-rolls, tinctures, and topicals. Browse the full menu at /menu — every product is sourced from a WSLCB-licensed Washington producer and lab-tested for potency and contaminants.",
    },
    {
      q: "How are cannabis taxes handled at the register?",
      a: "WA state cannabis excise tax (37%) and local sales tax (~8.8% in Wenatchee) are baked into the shelf price you see — what's on the tag is what you pay at the counter. Medical patients with a valid card get exemptions on certified medical products.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <section className="bg-stone-50 border-y border-stone-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="text-center mb-10">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">FAQ</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
            Common questions
          </h2>
          <p className="text-stone-600 mt-1.5 text-sm">
            First-time? Returning? Either way, here&apos;s what people ask most.
          </p>
        </div>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <details
              key={i}
              className="group bg-white rounded-2xl border border-stone-200 hover:border-green-300 transition-colors open:shadow-md"
            >
              <summary className="cursor-pointer list-none px-5 py-4 flex items-start justify-between gap-3">
                <span className="font-semibold text-stone-900 text-sm sm:text-base">{f.q}</span>
                <span className="shrink-0 mt-0.5 text-green-700 font-bold text-lg leading-none transition-transform group-open:rotate-45">
                  +
                </span>
              </summary>
              <div className="px-5 pb-4 -mt-1 text-sm text-stone-600 leading-relaxed">{f.a}</div>
            </details>
          ))}
        </div>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </div>
    </section>
  );
}
