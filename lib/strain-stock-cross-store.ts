// Cross-store strain-stock fetch — used by /strains/[slug] to render the
// "in stock at the OTHER store" widget. Pings BOTH inv-App URLs in parallel:
//
//   - https://brapp.greenlifecannabis.com/api/public/strain-stock/<slug>  (Wen)
//   - https://brapp.seattlecannabis.co/api/public/strain-stock/<slug>     (SCC)
//
// Each request 5s-timeout, no-cache (we want fresh stock for SEO render).
// ANY failure → null for that store; the widget shows a graceful "ask staff"
// fallback when both fail. Trigger: repeat-carry analysis found 224/250 corpus
// strains are ghost pages — UX-expert URGENT pre-Google-indexation flag.
//
// Allow-list pattern (sister of `lib/closure-status.ts inventoryappBase()`):
// hardcode both canonical brapp hostnames so env-drift can't redirect this
// to a wrong host. WSLCB-safe shape (no $ figures, no PII).

import type { Strain } from "./strains";

export type StoreStockResult = {
  store: "wen" | "sea";
  storeName: string;
  storeLabel: string; // human-facing "GL Wenatchee" / "SCC Seattle"
  /** Public-site /menu URL on the sibling store, for the "shop the other store" link. */
  publicMenuUrl: string;
  inStock: boolean;
  productCount: number;
  /** Latest inventory_snapshots capture for any matching product (ISO). */
  lastSeenAt: string | null;
  /** Most-recent sale of any matching product (ISO). */
  lastSoldAt: string | null;
};

export type CrossStoreStockResult = {
  wen: StoreStockResult | null;
  sea: StoreStockResult | null;
};

const SOURCES = [
  {
    store: "wen" as const,
    storeName: "Green Life Cannabis",
    storeLabel: "GL Wenatchee",
    invAppBase: "https://brapp.greenlifecannabis.com",
    publicMenuUrl: "https://www.greenlifecannabis.com/menu",
  },
  {
    store: "sea" as const,
    storeName: "Seattle Cannabis Co",
    storeLabel: "SCC Seattle",
    invAppBase: "https://brapp.seattlecannabis.co",
    publicMenuUrl: "https://www.seattlecannabis.co/menu",
  },
];

const SLUG_RX = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

type RawBody = {
  store?: string;
  storeName?: string;
  slug?: string;
  inStock?: boolean;
  productCount?: number;
  lastSeenAt?: string | null;
  lastSoldAt?: string | null;
};

async function fetchOneStore(
  source: (typeof SOURCES)[number],
  slug: string,
  signal: AbortSignal,
): Promise<StoreStockResult | null> {
  const url = `${source.invAppBase}/api/public/strain-stock/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, {
      signal,
      // Defer entirely to inv-App's Cache-Control header (5min s-maxage) —
      // Next.js will use its data cache layer with that hint. revalidate=300
      // pins the page-level ISR window to match.
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const body = (await res.json()) as RawBody;
    if (!body || typeof body !== "object") return null;
    return {
      store: source.store,
      storeName: source.storeName,
      storeLabel: source.storeLabel,
      publicMenuUrl: source.publicMenuUrl,
      inStock: body.inStock === true,
      productCount: typeof body.productCount === "number" ? body.productCount : 0,
      lastSeenAt: typeof body.lastSeenAt === "string" ? body.lastSeenAt : null,
      lastSoldAt: typeof body.lastSoldAt === "string" ? body.lastSoldAt : null,
    };
  } catch {
    return null;
  }
}

/** Fetch cross-store stock for a strain. Returns both stores' results in
 *  parallel; either side may be null if its inv-App was unreachable. */
export async function fetchCrossStoreStock(
  strain: Pick<Strain, "slug">,
): Promise<CrossStoreStockResult> {
  if (!strain?.slug || !SLUG_RX.test(strain.slug)) {
    return { wen: null, sea: null };
  }
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const [wen, sea] = await Promise.all(
      SOURCES.map((s) => fetchOneStore(s, strain.slug, controller.signal)),
    );
    return { wen, sea };
  } finally {
    clearTimeout(timer);
  }
}

/** Pure-fn — what to say about how recently the strain was last seen.
 *  Returns null when no signal is available. Exported for pin testability. */
export function freshnessLabel(input: {
  lastSeenAt: string | null;
  lastSoldAt: string | null;
  now?: Date;
}): string | null {
  const ref = (input.lastSeenAt || input.lastSoldAt) ?? null;
  if (!ref) return null;
  const refMs = Date.parse(ref);
  if (!Number.isFinite(refMs)) return null;
  const now = input.now ? input.now.getTime() : Date.now();
  const ageMs = Math.max(0, now - refMs);
  const HOUR = 60 * 60 * 1000;
  const DAY = 24 * HOUR;
  if (ageMs < HOUR) return "less than an hour ago";
  if (ageMs < 2 * HOUR) return "about an hour ago";
  if (ageMs < DAY) return `${Math.floor(ageMs / HOUR)}h ago`;
  if (ageMs < 2 * DAY) return "yesterday";
  if (ageMs < 7 * DAY) return `${Math.floor(ageMs / DAY)} days ago`;
  return null; // older than a week — keep quiet; "back soon" framing doesn't apply
}
