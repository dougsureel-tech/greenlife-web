import { getClient } from "@/lib/db";
import Link from "next/link";

// Hack #6 — Strain-finder quiz unsubscribe handler.
//
// GET /quiz/unsubscribe?token=<unguessable>
//
// **Token validation:** server-side exact-match against
// `quiz_captures.unsubscribed_token`. If found AND not already
// unsubscribed, set `unsubscribed_at = NOW()`. The cron skips rows
// where `unsubscribed_at IS NOT NULL`.
//
// **No-leak posture:** the page renders the SAME confirmation in
// found / not-found / already-unsubscribed cases. We deliberately do
// NOT branch the UI on token validity — that would let an attacker
// brute-force the namespace by watching for "unsubscribed" vs "not
// found" responses. Tokens are 256 bits so brute-forcing is
// computationally infeasible regardless, but constant-time UI is the
// belt-and-suspenders posture.
//
// **Rate-limit posture:** there is no per-IP rate limit here — the
// 256-bit token space (`2^256`) makes a brute-force attack of any
// scale infeasible (a billion attempts/sec for a billion years is
// still a vanishingly small fraction). If we ever shorten the token
// we'd need to add IP throttling here.

export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParamsResolved = { token?: string };

// Token shape — 64 hex chars from `crypto.randomBytes(32).toString('hex')`.
const TOKEN_RE = /^[0-9a-f]{64}$/;

export default async function QuizUnsubscribePage({
  searchParams,
}: {
  searchParams: Promise<SearchParamsResolved>;
}) {
  const { token } = await searchParams;

  // Defensive: only attempt the DB write when the token shape matches
  // what we issue. Skips the round-trip when the URL is obviously
  // malformed; UI still renders the same confirmation.
  if (token && TOKEN_RE.test(token)) {
    try {
      const sql = getClient();
      // Single UPDATE — only flips rows that aren't already
      // unsubscribed so we don't move the timestamp on repeat clicks.
      // The UNIQUE index on `unsubscribed_token` guarantees this
      // touches at most one row.
      await sql`
        UPDATE quiz_captures
        SET unsubscribed_at = NOW()
        WHERE unsubscribed_token = ${token}
          AND unsubscribed_at IS NULL
      `;
    } catch (err) {
      // Failure here is silent to the user — we never tell them whether
      // a token was valid. Log internally for diagnostics (no token
      // value in the log).
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`[quiz/unsubscribe] update failed: ${msg}`);
    }
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6 py-16">
      <div className="max-w-md w-full bg-white border border-stone-200 rounded-2xl shadow-sm p-8 sm:p-10">
        <div className="text-3xl mb-3" aria-hidden>
          ✓
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900 mb-3">
          You&rsquo;re unsubscribed
        </h1>
        <p className="text-sm text-stone-600 leading-relaxed mb-6">
          We won&rsquo;t send you any more strain-finder quiz emails. If you
          ever want to come back, take the quiz again at{" "}
          <Link
            href="/find-your-strain"
            className="text-green-700 underline underline-offset-2 hover:text-green-800"
          >
            /find-your-strain
          </Link>{" "}
          and we&rsquo;ll restart the series.
        </p>
        <p className="text-xs text-stone-500 leading-relaxed">
          Note: if you&rsquo;re also signed up for our loyalty program or text
          alerts, those are separate channels — manage them from your{" "}
          <Link
            href="/account"
            className="text-green-700 underline underline-offset-2 hover:text-green-800"
          >
            account page
          </Link>
          .
        </p>
        <div className="mt-8 pt-6 border-t border-stone-200">
          <Link
            href="/"
            className="text-sm font-semibold text-stone-700 hover:text-stone-900"
          >
            ← Back to Green Life Cannabis
          </Link>
        </div>
      </div>
    </div>
  );
}

export const metadata = {
  title: "Unsubscribed — Green Life Cannabis",
  description: "You've been unsubscribed from strain-finder quiz emails.",
  robots: { index: false, follow: false },
};
