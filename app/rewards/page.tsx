import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { Breadcrumb } from "@/components/Breadcrumb";

// /rewards — public-site interstitial.
//
// Per EXPERT_NEXT_STEPS_CUSTOMER_JOURNEY_2026_05_28.md (Path 4 / top
// next-ship recommendation): prior to 2026-05-28 a redirect in
// next.config.ts sent /rewards → /account, dropping any customer who
// tapped the footer "Rewards" link straight into the Clerk sign-in
// chrome with no context. This page replaces that redirect with a
// short orientation: short blurb + two CTAs (Sign in → /sign-in,
// Browse strains → /strains) + a three-bullet "what you'll find when
// signed in" rail.
//
// Scope-narrow on purpose. NO auth fetch, NO loyalty math, NO data
// reads — pure HTML placeholder. The real loyalty balance + order
// history live on /account (Clerk-gated). When customers want to
// transact they go to /menu.
//
// WSLCB posture: no effect language, no medical framing, no points
// math claims (sidesteps check-loyalty-math-drift gate). Voice rubric:
// direct shop voice ("Sign in to see your balance" / "Browse strains"),
// no template-warmth softeners ("give us a call" / "drop us a line").
//
// Sister-port byte-near-identical with seattle-cannabis-web/app/rewards/
// page.tsx — only divergence is the brand color (glw green vs scc
// indigo) and the "Sign in" CTA destination (glw uses Clerk /sign-in;
// scc points to the brapp loyalty PWA per Doug's 2026-05-28 directive).

export const metadata: Metadata = {
  title: "Account & rewards",
  description: `Sign in to ${STORE.name} to view your loyalty balance, order history, and saved strain preferences. 21+.`,
  alternates: { canonical: "/rewards" },
  // /rewards is a Clerk sign-in interstitial — no public content worth
  // indexing, and every child (/login /dashboard /history /redeem /verify)
  // already emits index:false. This parent was the LONE rewards-tree page
  // still inheriting index,follow → Google indexed it (GSC "Indexed, though
  // blocked by robots.txt": it was robots.txt-Disallowed in app/robots.ts,
  // so Google could not crawl it to SEE a noindex, leaving the already-
  // indexed URL stuck). Fix pair (mirrors scc v34.746): serve noindex HERE
  // + REMOVE the noindex'd account/auth roots from robots.txt Disallow so
  // Googlebot can crawl, read this directive, and drop the URL. A robots.txt
  // block alone can NEVER deindex an already-indexed URL.
  robots: { index: false },
};

export default function RewardsInterstitialPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
      <Breadcrumb items={[{ label: "Home", href: "/" }, { label: "Account & rewards" }]} />

      <header className="space-y-3 text-center sm:text-left">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold tracking-wide uppercase">
          Your account
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
          Account &amp; rewards
        </h1>
        <p className="text-stone-600 text-base sm:text-lg leading-relaxed">
          Your loyalty balance and order history live in your account. Sign in to
          view rewards, recent orders, and the strains you&apos;ve saved.
        </p>
      </header>

      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/sign-in?redirect_url=/account"
          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-700 hover:bg-emerald-600 px-6 py-3.5 text-base font-bold text-white transition-all hover:-translate-y-0.5 shadow-md shadow-emerald-900/20 focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Sign in →
        </Link>
        <Link
          href="/strains"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-stone-300 bg-white hover:border-emerald-400 hover:bg-emerald-50 px-6 py-3.5 text-base font-semibold text-stone-700 transition-all focus-visible:ring-2 focus-visible:ring-emerald-400 focus-visible:ring-offset-2 focus-visible:outline-none"
        >
          Browse strains
        </Link>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-stone-50 px-5 sm:px-6 py-5 sm:py-6">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-500 mb-3">
          What you&apos;ll find when signed in
        </h2>
        <ul className="space-y-2.5 text-sm sm:text-base text-stone-700">
          <li className="flex items-start gap-2.5">
            <span className="text-emerald-700 mt-0.5" aria-hidden="true">·</span>
            <span>Your loyalty balance and tier</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-emerald-700 mt-0.5" aria-hidden="true">·</span>
            <span>Order history and pickup status</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-emerald-700 mt-0.5" aria-hidden="true">·</span>
            <span>Saved strain preferences for faster reorders</span>
          </li>
        </ul>
      </section>

      <p className="text-xs text-stone-500 text-center sm:text-left">
        21+. Loyalty redemption applies at the counter at the time of pickup.
      </p>
    </div>
  );
}
