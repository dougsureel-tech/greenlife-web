// Per-key fixed-window rate limiter — in-memory, per-instance.
//
// Pre-extraction: 4 public-API routes (/api/quiz/capture, /api/push/subscribe,
// /api/push/unsubscribe, /api/track-install) each maintained their own private
// Map<key, {count, resetAt}>. None of them pruned expired entries → unbounded
// growth over a long-lived Vercel Fluid Compute instance. These are public
// endpoints (cellular IPs rotate frequently) so a 24h instance lifetime could
// accumulate ~10K stale entries before falling out (no eviction). Not
// catastrophic at ~50 bytes/entry, but drift is one-way upward, and there is
// no reason to keep entries past their resetAt.
//
// Sister of the same pattern in `Inventory App/src/lib/rate-limit.ts`
// (v345.805 + v346.205 there). Two repos, identical helper, both prune
// opportunistically.

import { MINUTE_MS } from "./time-constants";

type Entry = { count: number; resetAt: number };

/** Create a per-route limiter. Each route owns its own Map (independent windows). */
export function createRateLimiter(opts: { limit: number; windowMs?: number }) {
  const limit = opts.limit;
  const windowMs = opts.windowMs ?? MINUTE_MS;
  const map = new Map<string, Entry>();

  function prune(now: number) {
    for (const [k, v] of map) {
      if (v.resetAt < now) map.delete(k);
    }
  }

  return {
    /** Returns true if the request is allowed; false if rate-limited. */
    check(key: string): boolean {
      const now = Date.now();
      // 1% probabilistic prune — keeps Map bounded under steady load with
      // negligible amortised cost.
      if (Math.random() < 0.01) prune(now);
      const entry = map.get(key);
      if (!entry || entry.resetAt < now) {
        map.set(key, { count: 1, resetAt: now + windowMs });
        return true;
      }
      if (entry.count >= limit) return false;
      entry.count++;
      return true;
    },
    /** Test-only: force a prune. */
    _prune(now = Date.now()) {
      prune(now);
    },
    /** Test-only: current entry count. */
    _size(): number {
      return map.size;
    },
  };
}
