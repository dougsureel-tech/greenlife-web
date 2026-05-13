// Client-IP extraction SSoT. Lifted from 5 inline duplicates across
// /api/quiz/capture, /api/push/{subscribe,unsubscribe}, /api/track-install,
// /api/csp-report. Each inlined the exact same:
//
//   const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
//
// **The bug this SoT fixes**: `?? "unknown"` only catches null/undefined.
// If `x-forwarded-for` is `"   "` (whitespace) or `", , "` (comma-only),
// the split/trim chain produces `""`, then `"" ?? "unknown"` returns `""`
// (empty string is not nullish). Rate-limit + audit logs key off the IP —
// all empty-string IPs collide in the same bucket, letting one
// whitespace-header request consume the rate-limit budget for every
// future request with the same shape. `||` / truthy-check catches null +
// undefined + empty + whitespace-only-after-trim uniformly.
//
// Mirrors the cannagent SoT at `src/lib/client-context.ts:getClientIp`
// (v3.31), the inv SoT at `@inv/lib-shared/client-ip` (v402.785), and
// the parallel seattle-cannabis-web port shipped same day. Pure module —
// no DB, no IO. Safe to import from any runtime.

/** Extract the first client IP from `x-forwarded-for` (or fall back to
 *  `x-real-ip`, then literal `"unknown"`). Trims + treats empty/
 *  whitespace-only values as "unknown" so rate-limit / audit-log keys
 *  don't collide on the empty-string bucket. */
export function getClientIp(headers: Headers): string {
  const xff = headers.get("x-forwarded-for");
  if (xff) {
    const first = xff.split(",")[0]?.trim();
    if (first) return first;
  }
  const real = headers.get("x-real-ip")?.trim();
  if (real) return real;
  return "unknown";
}
