import Link from "next/link";
import type { LoyaltySnapshot } from "@/lib/portal";

// Loyalty surface for the public site. Two states:
//
//  1. `snapshot` is non-null → matched customer record. Shows points balance,
//     dollar value, visit count. The "next reward" hint is a soft motivator
//     (next $5 increment) without being pushy.
//
//  2. `snapshot` is null → no matching customer record yet (portal user
//     hasn't transacted in store, or email doesn't match). Shows a join
//     prompt explaining the loyalty program — "1 pt per $1, 100 pts = $1".
//
// Designed to live on /account at the top, just below the greeting. Indigo
// gradient bookend matches the rest of the site identity.

const POINTS_PER_DOLLAR = 100;

function formatRelative(iso: string): string {
  const d = new Date(iso);
  const days = Math.floor((Date.now() - d.getTime()) / 86400000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 14) return `${days} days ago`;
  if (days < 60) return `${Math.floor(days / 7)} weeks ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function LoyaltyCard({ snapshot }: { snapshot: LoyaltySnapshot | null }) {
  if (!snapshot) {
    // Unmatched — the portal account hasn't been linked to a transacted
    // customer yet. Encourage first visit and explain the program briefly.
    return (
      <section
        aria-labelledby="loyalty-heading"
        className="rounded-2xl border border-indigo-200 bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-50 px-5 py-4 sm:px-6 sm:py-5"
      >
        <div className="flex items-start gap-3">
          <div className="text-2xl shrink-0" aria-hidden="true">
            🎁
          </div>
          <div className="min-w-0 flex-1 space-y-1.5">
            <h2 id="loyalty-heading" className="text-sm font-bold text-indigo-900">
              Join our loyalty program
            </h2>
            <p className="text-xs text-indigo-800/80 leading-relaxed">
              Earn <strong>1 point per $1</strong> in store. Every <strong>100 points = $1</strong> off
              your next visit — no card to carry, just hand the budtender the email on this account at
              checkout.
            </p>
          </div>
        </div>
      </section>
    );
  }

  // Matched — show the real balance.
  const ptsToNextDollar = POINTS_PER_DOLLAR - (snapshot.points % POINTS_PER_DOLLAR);
  const visitLine =
    snapshot.visitCount > 0 && snapshot.lastVisitAt
      ? `${snapshot.visitCount} visit${snapshot.visitCount === 1 ? "" : "s"} · last seen ${formatRelative(
          snapshot.lastVisitAt,
        )}`
      : null;

  return (
    <section
      aria-labelledby="loyalty-heading"
      className="rounded-2xl border border-indigo-300 bg-gradient-to-br from-indigo-950 via-violet-950 to-indigo-950 text-white px-5 py-5 sm:px-6 sm:py-6 shadow-md shadow-violet-900/20"
    >
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="min-w-0 space-y-1">
          <h2
            id="loyalty-heading"
            className="text-xs font-bold uppercase tracking-widest text-indigo-300"
          >
            Loyalty Balance
          </h2>
          <div className="flex items-baseline gap-3 flex-wrap">
            <span className="text-3xl sm:text-4xl font-black tabular-nums bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              {snapshot.points.toLocaleString()}
            </span>
            <span className="text-sm font-medium text-indigo-200">
              pts
              {snapshot.dollarValue > 0 && (
                <>
                  {" "}
                  &middot;{" "}
                  <span className="text-emerald-300 font-bold">~${snapshot.dollarValue} off</span> next
                  visit
                </>
              )}
            </span>
          </div>
          {visitLine && <p className="text-xs text-indigo-300/80 mt-1">{visitLine}</p>}
        </div>
        {snapshot.dollarValue === 0 && (
          <p className="text-xs text-indigo-300/90 max-w-xs">
            Just <strong className="text-white">{ptsToNextDollar} more pts</strong> to your first $1 off.
            Earn 1 pt per $1 in store.
          </p>
        )}
      </div>
      <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between gap-3 flex-wrap text-xs">
        <p className="text-indigo-300/70">
          Hand the budtender your email at checkout — points apply automatically.
        </p>
        <Link
          href="/menu"
          className="text-indigo-200 font-semibold hover:text-white transition-colors whitespace-nowrap"
        >
          Browse menu →
        </Link>
      </div>
    </section>
  );
}
