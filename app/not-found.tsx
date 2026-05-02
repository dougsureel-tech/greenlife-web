import Link from "next/link";
import { STORE, isOpenNow } from "@/lib/store";

const VIBES = [
  { emoji: "⚡️", label: "Energize", vibe: "energize" },
  { emoji: "🌊", label: "Chill", vibe: "chill" },
  { emoji: "💤", label: "Sleep", vibe: "sleep" },
  { emoji: "🩹", label: "Relief", vibe: "relief" },
];

const POPULAR = [
  { href: "/menu", label: "Live menu", desc: "100+ Washington products" },
  { href: "/menu", label: "Order for pickup", desc: "Pay cash on arrival" },
  { href: "/find-your-strain", label: "Find your strain", desc: "Quiz, takes 30 seconds" },
  { href: "/brands", label: "Brands we carry", desc: "Local cultivators + more" },
  { href: "/learn", label: "Cannabis 101", desc: "First-timer guide" },
  { href: "/faq", label: "FAQ", desc: "Cash, ID, hours" },
];

export default function NotFound() {
  const open = isOpenNow();
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 py-16">
      <div className="w-full max-w-2xl space-y-10 text-center">
        {/* 404 + leaf */}
        <div className="relative inline-flex items-center justify-center">
          <span className="text-[120px] font-extrabold text-stone-100 leading-none select-none tracking-tight">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border-2 border-green-100 flex items-center justify-center shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-8 h-8 text-green-600"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2 max-w-md mx-auto">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 tracking-tight">
            Page not found
          </h1>
          <p className="text-stone-600 text-sm leading-relaxed">
            That page wandered off — but our menu&apos;s right here. Pick a direction below, or use the
            open-now status to plan a visit.
          </p>
        </div>

        {/* Mood shortcut row */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-3">
            Quick filter
          </p>
          <div className="grid grid-cols-4 gap-2 max-w-md mx-auto">
            {VIBES.map((v) => (
              <Link
                key={v.vibe}
                href={`/menu?vibe=${v.vibe}`}
                className="flex flex-col items-center gap-1 py-3 rounded-xl border border-stone-200 bg-stone-50 hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <span className="text-xl">{v.emoji}</span>
                <span className="text-[11px] font-bold text-stone-700">{v.label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Popular destinations */}
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-3">Or try</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left max-w-md mx-auto">
            {POPULAR.map((p) => (
              <Link
                key={p.href}
                href={p.href}
                className="group flex items-start justify-between gap-3 px-4 py-3 rounded-xl border border-stone-200 bg-white hover:border-green-300 hover:bg-green-50 transition-colors"
              >
                <div>
                  <div className="text-sm font-bold text-stone-900 group-hover:text-green-700 transition-colors">
                    {p.label}
                  </div>
                  <div className="text-[11px] text-stone-500">{p.desc}</div>
                </div>
                <span className="text-stone-400 group-hover:text-green-600 transition-colors mt-1">→</span>
              </Link>
            ))}
          </div>
        </div>

        {/* Hours hint */}
        <div className="pt-2 text-[11px] text-stone-500 max-w-md mx-auto">
          <span className={`inline-flex items-center gap-1.5 ${open ? "text-green-700" : "text-stone-500"}`}>
            <span
              className={`w-1.5 h-1.5 rounded-full ${open ? "bg-green-500 animate-pulse" : "bg-stone-400"}`}
            />
            <strong>{STORE.name}</strong> is {open ? "open now" : "closed right now"} · {STORE.address.full}
          </span>
        </div>
      </div>
    </div>
  );
}
