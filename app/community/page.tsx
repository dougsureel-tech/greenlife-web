import type { Metadata } from "next";
import Link from "next/link";
import { ALUMNI_TEAM, initialOf } from "@/lib/team";
import { STORE } from "@/lib/store";

// Public-facing home for the Featured Partners vision Doug shared 2026-05-02:
//   "alumni could also evolve into special consideration — it might be an
//    influencer we feature or someone/company we feature and they might get
//    a special discount when they are rung up and have actionable links to
//    track"
//
// v1 = featured alumni (real people, real bios from lib/team.ts) + tease
// the broader cohort coming. Sets up the discovery surface; the actual
// onboarding lives at /alumni (self-serve knock + signup). Influencer
// affiliate spec lives in PLAN_DEALS_AUDIT #14 — hooks into this page
// when partner-tracking ships.

export const metadata: Metadata = {
  title: "Our Community — Featured People & Partners",
  description: `The folks who built and continue to build ${STORE.name}. Past staff, future partners. We're growing the community over time.`,
  alternates: { canonical: "/community" },
  openGraph: {
    title: `Our Community · ${STORE.name}`,
    description: `Past staff, future partners. The community we're building, on purpose.`,
    url: `${STORE.website}/community`,
  },
};

export default function CommunityPage() {
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
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(74,222,128,0.25), transparent), radial-gradient(ellipse 50% 60% at 15% 100%, rgba(251,191,36,0.10), transparent)",
          }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-emerald-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Our Community
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Built by everyone we&apos;ve worked with.
          </h1>
          <p className="text-emerald-100/80 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl">
            The people who shaped this shop, the people who still send customers our way, and — soon —
            the partners we&apos;re bringing into the fold. Cannabis advertising is restricted by
            state law. Word of mouth is the channel that&apos;s left, and we&apos;re going to do it
            right.
          </p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-16 sm:space-y-20">
        {/* Featured alumni */}
        <section className="space-y-6">
          <div className="flex items-end justify-between gap-4 flex-wrap">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
                Featured · Alumni
              </p>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
                The crew that built our reputation.
              </h2>
              <p className="text-stone-500 text-sm mt-2 max-w-xl">
                Past staff who set the standards we still hold the bar to. If you used to work here,
                you can claim your spot.
              </p>
            </div>
            <Link
              href="/alumni"
              className="text-sm font-semibold text-green-700 hover:text-green-600 transition-colors"
            >
              Past staff: claim your profile →
            </Link>
          </div>
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ALUMNI_TEAM.map((m) => (
              <li
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
              </li>
            ))}
          </ul>
        </section>

        {/* Coming soon — Featured Influencers */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Coming soon · Featured creators
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Cannabis writers, tasters, and creators we trust.
            </h2>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 p-6 sm:p-8">
            <p className="text-stone-700 leading-relaxed">
              We&apos;re building a small program for cannabis creators in eastern WA — small
              followings, real audiences, no spam. They get a tracked link to share, a code their
              followers can use, and we get word-of-mouth that doesn&apos;t violate state advertising
              law.
            </p>
            <p className="text-stone-500 text-sm leading-relaxed mt-3">
              If that sounds like you, email {STORE.email} with your handle, location, and a
              recent post you&apos;re proud of. We&apos;re vetting the first cohort over the next few
              weeks.
            </p>
          </div>
        </section>

        {/* Coming soon — Featured local businesses */}
        <section className="space-y-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-700">
              Coming soon · Featured local businesses
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-1.5">
              Wenatchee businesses we partner with.
            </h2>
          </div>
          <div className="rounded-2xl bg-white border border-stone-200 p-6 sm:p-8 grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <p className="text-stone-700 leading-relaxed">
                Local breweries, restaurants, music venues, gyms, bike shops — places we like, run by
                people we know. Your employees get a code; we cross-promote you on our deal mailer
                and at the counter.
              </p>
            </div>
            <div>
              <p className="text-stone-500 text-sm leading-relaxed">
                Interested? Email {STORE.email}. We&apos;re starting with three or four neighbors
                this summer to make sure the mechanics are right before we open it up.
              </p>
            </div>
          </div>
        </section>

        {/* Why we're doing this */}
        <section className="rounded-3xl bg-green-950 text-white p-8 sm:p-10 space-y-4">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-300">
            Why we&apos;re building this
          </p>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Cannabis advertising is restricted. Real connections aren&apos;t.
          </h2>
          <p className="text-emerald-100/80 leading-relaxed max-w-2xl">
            Washington state limits where and how we can advertise (WAC 314-55-155). The most honest
            growth channel left to us is the people who already love what we do telling the people
            who haven&apos;t found us yet. We&apos;re building this on purpose, slowly, with the
            people we already trust.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/alumni"
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-green-950 text-sm font-bold transition-colors"
            >
              Past staff: sign in →
            </Link>
            <a
              href={`mailto:${STORE.email}?subject=Interested%20in%20being%20featured`}
              className="px-4 py-2 rounded-xl border border-white/20 hover:border-white/40 hover:bg-white/10 text-white text-sm font-semibold transition-all"
            >
              Email us about being featured
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
