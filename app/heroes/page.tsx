import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

// /heroes — informational landing for the Heroes service discount.
// Doug's positioning 2026-05-02: "we support local heroes." This page
// makes the cohort + the program legible BEFORE they visit, which
// matters because:
//   1. SEO — googling "veteran discount cannabis Wenatchee" / "first
//      responder dispensary" lands here directly.
//   2. Friction — first responders / nurses / teachers often have ID
//      questions ("does my badge work?") before driving over. Answer
//      those questions on the page so they don't ask at the counter.
//   3. WAC compliance — keeps the program description on a page we own
//      so the framing stays inside WAC 314-55-077 (no medical claims)
//      and WAC 314-55-155 (this is informational, not advertising-style).

export const metadata: Metadata = {
  title: "Heroes Discount — Service & Industry Recognition",
  description: `${STORE.name} supports local heroes — active military, veterans, first responders, healthcare workers, and K-12 teachers. 20% off, every visit, with valid ID. Wenatchee, WA.`,
  alternates: { canonical: "/heroes" },
  openGraph: {
    title: `Heroes Discount · ${STORE.name}`,
    description: `20% off for active military, veterans, first responders, healthcare workers, and K-12 teachers. Show valid ID at the register.`,
    url: `${STORE.website}/heroes`,
  },
};

const ELIGIBILITY = [
  {
    icon: "🪖",
    title: "Active Military",
    detail:
      "Active duty, National Guard, Reserves. Show your CAC, military ID, or current orders.",
  },
  {
    icon: "🎖️",
    title: "Veterans",
    detail: "Any branch, any era. DD-214, VA card, or VHIC works.",
  },
  {
    icon: "🚓",
    title: "Law Enforcement",
    detail: "Police, sheriff, corrections, federal LE. Show your badge or department ID.",
  },
  {
    icon: "🚒",
    title: "Fire & EMS",
    detail: "Firefighters, paramedics, EMTs. Department ID or current cert.",
  },
  {
    icon: "🏥",
    title: "Healthcare Workers",
    detail: "Nurses, doctors, techs, paramedics, hospital + clinic staff. Show your badge.",
  },
  {
    icon: "🎓",
    title: "K-12 Teachers",
    detail: "Currently teaching at a Washington-state public or private K-12 school. Show your district ID or pay stub.",
  },
];

export default function HeroesPage() {
  return (
    <main className="min-h-[80vh] bg-stone-50">
      {/* Hero */}
      <section className="relative overflow-hidden bg-green-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(74,222,128,0.25), transparent), radial-gradient(ellipse 50% 60% at 15% 100%, rgba(251,191,36,0.18), transparent)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Heroes Discount
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            We support local heroes.
          </h1>
          <p className="text-emerald-100/85 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl">
            Twenty percent off for active military, veterans, first responders, healthcare workers,
            and K-12 teachers — the people who keep the Valley running. Every visit, with valid ID.
            No expiration, no fine print.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400 text-green-950 text-sm font-bold">
              <span className="text-base">★</span> 20% off · every visit
            </span>
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 text-white text-sm font-semibold">
              Stacks with loyalty points
            </span>
          </div>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-14 sm:space-y-16">
        {/* Eligibility */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Who qualifies
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Six categories. Real ID required.
            </h2>
            <p className="text-stone-600 text-sm mt-2 max-w-xl leading-relaxed">
              We verify credentials at the counter — same standard whether it&rsquo;s your first
              visit or your fiftieth. Bring your service or work ID alongside your 21+ ID.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {ELIGIBILITY.map(({ icon, title, detail }) => (
              <div
                key={title}
                className="rounded-2xl bg-white border border-stone-200 hover:border-green-300 transition-all p-5 sm:p-6"
              >
                <div className="text-3xl mb-3" aria-hidden="true">
                  {icon}
                </div>
                <h3 className="font-bold text-stone-900 text-base">{title}</h3>
                <p className="text-stone-600 text-sm mt-1.5 leading-relaxed">{detail}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              How it works
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Walk up. Show ID. Save 20%.
            </h2>
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                step: "Step 1",
                title: "Bring two IDs",
                detail: "Your government 21+ ID and your service / work credential.",
              },
              {
                step: "Step 2",
                title: "Tell the budtender",
                detail: "Mention you&rsquo;re here for the Heroes discount when you walk up.",
              },
              {
                step: "Step 3",
                title: "Save automatically",
                detail: "20% off your subtotal. Stacks with your loyalty points.",
              },
            ].map(({ step, title, detail }) => (
              <li
                key={step}
                className="relative rounded-2xl bg-white border border-stone-200 p-5 sm:p-6"
              >
                <span className="absolute -top-2.5 left-5 text-[10px] font-bold uppercase tracking-widest text-white bg-green-700 px-2 py-0.5 rounded-full">
                  {step}
                </span>
                <h3 className="font-bold text-stone-900 mt-2">{title}</h3>
                <p
                  className="text-stone-600 text-sm mt-1.5 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: detail }}
                />
              </li>
            ))}
          </ol>
        </section>

        {/* FAQs */}
        <section className="space-y-6">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
              Common questions
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Quick answers.
            </h2>
          </div>
          <dl className="space-y-3">
            {[
              {
                q: "Does the discount stack with daily deals?",
                a: "No — the discount that&rsquo;s bigger applies. Heroes is 20%, daily deals usually run 10-15%, so Heroes wins. If you&rsquo;re unsure, ask the budtender.",
              },
              {
                q: "Does it expire?",
                a: "No. Once we&rsquo;ve verified your credentials at the counter, you can use it every visit going forward. Industry-discount cohorts have a different rule (90-day re-verify) but Heroes is open-ended.",
              },
              {
                q: "What if my ID is expired?",
                a: "Active military / law enforcement / fire-EMS need a current credential. Veterans with a DD-214, VA card, or VHIC are good even if other IDs expire — those are permanent records.",
              },
              {
                q: "Does my spouse or family qualify?",
                a: "Heroes is the individual cardholder only. We can&rsquo;t extend it to family — that&rsquo;s how WSLCB-aware retailers stay compliant.",
              },
              {
                q: "Can I use it on online orders?",
                a: "Online ordering already saves 15% automatically. Heroes is in-person only — show ID at the register.",
              },
              {
                q: "Why two IDs?",
                a: "State law requires a 21+ government photo ID for every cannabis purchase, every visit. The service or work ID is what proves your Heroes eligibility. Both are needed.",
              },
            ].map(({ q, a }) => (
              <details
                key={q}
                className="group rounded-2xl bg-white border border-stone-200 px-5 py-4"
              >
                <summary className="cursor-pointer list-none flex items-start justify-between gap-4">
                  <span className="font-bold text-stone-900 text-sm sm:text-base">{q}</span>
                  <span className="text-green-700 text-xl leading-none mt-0.5 group-open:rotate-45 transition-transform">
                    +
                  </span>
                </summary>
                <p
                  className="text-stone-600 text-sm leading-relaxed mt-3"
                  dangerouslySetInnerHTML={{ __html: a }}
                />
              </details>
            ))}
          </dl>
        </section>

        {/* Bottom CTA */}
        <section className="rounded-3xl bg-green-950 text-white p-8 sm:p-10 text-center space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-300">
            Come see us
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Open daily, 8 AM. Bring your ID.
          </h2>
          <p className="text-emerald-100/80 text-sm max-w-md mx-auto leading-relaxed">
            {STORE.address.street}, {STORE.address.city}. Free parking, ATM on-site, real budtenders
            who&rsquo;ll thank you for what you do.
          </p>
          <div className="flex justify-center gap-3 flex-wrap pt-2">
            <Link
              href="/menu"
              className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-green-950 text-sm font-bold transition-all shadow-md"
            >
              Browse the menu →
            </Link>
            <Link
              href="/visit"
              className="px-5 py-2.5 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-sm font-semibold transition-all"
            >
              Hours + directions
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
