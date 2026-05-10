import type { Metadata } from "next";
import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { STORE, DEFAULT_OG_IMAGE} from "@/lib/store";
import { LEARN_TOPICS } from "@/lib/learn-topics";
import { getCompletedSteps } from "@/lib/learn-db";
import { LearnProgress } from "./LearnProgress";

// Page IS dynamic (auth + DB read for completed steps), but the static
// shell — hero with h1, topic list, JSON-LD, footer CTAs — has zero
// auth-dependent content. Pre-fix the entire page was wrapped in an
// implicit Suspense by the root `app/loading.tsx` because `await auth()`
// + Clerk-side cookie work bailed the page to client-side rendering;
// SSR returned ONLY the spinner. Google saw zero h1, zero content,
// zero JSON-LD. The fix below extracts auth-dependent rendering into
// `<UserStateAwareLearn>` wrapped in `<Suspense fallback={<SignedOutLearn />}>`
// so the shell ships in initial HTML + the user-state pieces stream in
// after. Sister-pattern recipe per `feedback_grind_past_tapped_scoreboard_2026_05_08`
// 200-or-bust audit + glw v7.965 /apply Suspense skeleton fix.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Cannabis 101 · Learn the Basics",
  // ~155 chars — v10.105 length sweep.
  description: `Indica vs sativa, edibles dosing, THC%, terpenes basics — plain-English cannabis education from ${STORE.name} budtenders. 21+.`,
  alternates: { canonical: "/learn" },
  openGraph: {
    siteName: STORE.name,
    type: "website",
    locale: "en_US",
    title: "Cannabis 101 · Learn the Basics",
    description: "Indica vs sativa, dosing, THC %, terpenes — plain-English answers.",
    // og:url added 2026-05-10 (T21) — pre-fix /learn fell back to
    // layout's homepage URL. Sister of T19/T20 shallow-overwrite class.
    url: `${STORE.website}/learn`,
    images: [DEFAULT_OG_IMAGE],
  },
};

// Auth-dependent slice — reads userId + completedSteps. Wrapped in
// Suspense in the parent so awaits don't bail the whole page to CSR.
async function UserStateAwareLearn() {
  const { userId } = await auth();
  const completedIds = userId
    ? Array.from(await getCompletedSteps(userId).catch(() => new Set<string>()))
    : [];
  return (
    <>
      <p className={`text-xs ${userId ? "text-emerald-300/80" : "text-zinc-400"}`} data-userstate="resolved">
        {userId
          ? "✓ Your progress saves automatically — pick up where you left off any time."
          : "Sign in to track which topics you've read and graduate Cannabis 101."}
      </p>
      <LearnProgress initialCompletedIds={completedIds} signedIn={!!userId} />
    </>
  );
}

// Signed-out fallback — renders the same topic list (without progress
// checkmarks) so the SSR shell carries the FULL content even before the
// auth-dependent slice resolves. Google + AI crawlers see all topics +
// links + the disclaimer language. Hydration replaces with the real
// progress-aware view.
function SignedOutLearn() {
  return (
    <>
      <p className="text-xs text-zinc-400">
        Sign in to track which topics you&apos;ve read and graduate Cannabis 101.
      </p>
      <LearnProgress initialCompletedIds={[]} signedIn={false} />
    </>
  );
}

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <nav className="text-xs text-zinc-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-zinc-300">
          Home
        </Link>
        <span className="mx-1.5">/</span>
        <span className="text-zinc-400">Learn</span>
      </nav>

      {/* Hero — fully static, ships in SSR shell every request. */}
      <section className="relative overflow-hidden rounded-3xl border border-emerald-900/40 bg-gradient-to-br from-emerald-950 via-zinc-950 to-zinc-950 px-6 sm:px-10 py-10 sm:py-14">
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Cannabis 101 · plain English</span>
          </div>
          <h1 className="mt-2 text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            The basics, no jargon.
          </h1>
          <p className="mt-3 text-base sm:text-lg text-zinc-300 max-w-2xl">
            Quick reads on the questions our budtenders hear most. New to cannabis? Coming back after a long
            break? Just want to know why we&apos;re cash-only? Start here.
          </p>
        </div>
      </section>

      {/* Auth-dependent block in Suspense — fallback renders the topic
          list as if signed-out, so the SSR HTML always carries the full
          content. Real auth state replaces post-hydration. */}
      <Suspense fallback={<SignedOutLearn />}>
        <UserStateAwareLearn />
      </Suspense>

      {/* CTA */}
      <section className="text-center py-4">
        <p className="text-sm text-zinc-400">Ready to put it into practice?</p>
        <div className="mt-3 flex flex-wrap justify-center gap-3">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-700 hover:bg-emerald-600 px-6 py-3 text-sm font-semibold text-white"
          >
            Browse the menu →
          </Link>
          <Link
            href="/visit"
            className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
          >
            Plan a visit
          </Link>
        </div>
      </section>

      {/* Disclaimer */}
      <p className="text-xs text-zinc-600 text-center max-w-md mx-auto leading-relaxed">
        General education only — not medical advice. If you have a medical condition or take medications,
        consult your doctor before using cannabis. 21+. Always consume responsibly.
      </p>

      {/* JSON-LD: ItemList of topics + Breadcrumb + LearningResource wrapper.
          The wrapper links the page to the LocalBusiness @id from layout.tsx
          so AI engines treat the educational content as authored by our
          store entity (E-E-A-T). */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LearningResource",
            name: "Cannabis 101 — Learn the Basics",
            url: `${STORE.website}/learn`,
            description: `Indica vs sativa, edibles dosing, how to read THC%, terpenes basics, and what to expect at the dispensary. Plain-English answers from ${STORE.name} budtenders.`,
            inLanguage: "en-US",
            educationalLevel: "Beginner",
            audience: { "@type": "Audience", audienceType: "Adults 21+" },
            publisher: { "@id": `${STORE.website}/#dispensary` },
            about: { "@id": `${STORE.website}/#dispensary` },
            hasPart: LEARN_TOPICS.map((t, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: t.title,
              description: t.body.slice(0, 200),
            })),
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
              { "@type": "ListItem", position: 2, name: "Cannabis 101", item: `${STORE.website}/learn` },
            ],
          }),
        }}
      />
    </div>
  );
}
