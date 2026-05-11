// Reads the inventoryapp's public closure-status endpoint so the public site
// can block ordering (and surface a reason banner) when a manager has flagged
// today closed via /admin/hours-override. The endpoint is CORS-open and
// 30s-edge-cached on the inventoryapp side; we add a 5s client-side timeout
// here. ANY failure path returns { isClosed: false } — we never want a
// network blip on the closure endpoint to silently block customers from
// ordering during normal hours.

export type ClosureStatus = {
  isClosed: boolean;
  reason: string | null;
};

// Canonical staff URL (brapp.greenlifecannabis.com), not the Vercel-internal
// alias (inventoryapp-ivory.vercel.app) — per memory
// `feedback_canonical_url_for_prod_verification.md`, the alias can lag the
// canonical when Vercel auto-promote doesn't cleanly hand off. Both URLs
// serve the same Next.js app; the canonical is just the customer-stable one.
const DEFAULT_INVENTORYAPP_URL = "https://brapp.greenlifecannabis.com";

// Exported so tests in lib/__tests__/closure-status.test.ts can pin the
// env-allow-list defense. Not for consumer use — call sites should use
// `fetchClosureStatus()` which composes this internally.
export function inventoryappBase(): string {
  const env =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_INVENTORYAPP_URL
      : undefined;
  // Allow-list defense (sister of inv v337.005 STAFF_APP_URL incident):
  // pre-fix only required `startsWith("https://")` — was vulnerable to
  // the same env-drift class that broke STAFF_APP_URL on inv prod
  // (NEXT_PUBLIC_*_URL set to `app.greenlifecannabis.com` = 404'd
  // subdomain). If that env var drifted similarly here, every public-
  // site closure-status fetch would 404 → graceful-degrade returns
  // `{ isClosed: false }` → customers could place orders during an
  // active emergency closure (manager-flagged on brapp/admin) without
  // the public site ever knowing the store is closed.
  // Now requires `hostname === "brapp.greenlifecannabis.com"` (the
  // hardcoded canonical) OR falls back to the same default.
  if (!env || !env.startsWith("https://")) return DEFAULT_INVENTORYAPP_URL;
  try {
    const u = new URL(env);
    if (u.hostname !== "brapp.greenlifecannabis.com") return DEFAULT_INVENTORYAPP_URL;
    return env.replace(/\/+$/, "");
  } catch {
    return DEFAULT_INVENTORYAPP_URL;
  }
}

// `revalidate` (seconds) opts the call site into Next's data cache instead of
// the default `no-store`. Use only on read-mostly pages where slightly-stale
// closure data is acceptable (e.g., `/not-found` — bots hitting it shouldn't
// pound inventoryapp every time). Don't pass it from `/order` or `/menu` —
// those need the freshest signal so a customer can't place an order during
// an active emergency closure.
export async function fetchClosureStatus(opts?: {
  revalidate?: number;
}): Promise<ClosureStatus> {
  const url = `${inventoryappBase()}/api/public/closure-status`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const fetchOpts: RequestInit & { next?: { revalidate?: number } } =
      typeof opts?.revalidate === "number" && opts.revalidate > 0
        ? { signal: controller.signal, next: { revalidate: opts.revalidate } }
        : { signal: controller.signal, cache: "no-store" };
    const res = await fetch(url, fetchOpts);
    if (!res.ok) return { isClosed: false, reason: null };
    const body = (await res.json()) as {
      active?: boolean;
      isClosed?: boolean;
      reason?: string | null;
    };
    if (!body.active || !body.isClosed) {
      return { isClosed: false, reason: null };
    }
    return {
      isClosed: true,
      reason: typeof body.reason === "string" && body.reason.trim().length > 0 ? body.reason : null,
    };
  } catch {
    return { isClosed: false, reason: null };
  } finally {
    clearTimeout(timer);
  }
}
