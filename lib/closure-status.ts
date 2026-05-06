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

const DEFAULT_INVENTORYAPP_URL = "https://inventoryapp-ivory.vercel.app";

function inventoryappBase(): string {
  const env =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_INVENTORYAPP_URL
      : undefined;
  return env && env.startsWith("https://") ? env.replace(/\/+$/, "") : DEFAULT_INVENTORYAPP_URL;
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
