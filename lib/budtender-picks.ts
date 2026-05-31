// Customer Engagement Layer Ship 2 — public-site consumer for the
// Budtender's Pick + New This Week badges.
//
// Fetches `https://brapp.greenlifecannabis.com/api/public/product-flags`
// (Wenatchee) with 5-min ISR. The endpoint returns a flat keyed object:
//
//   {
//     "generatedAt": "2026-05-30T...",
//     "products": {
//       "<productId>": {
//         "isBudtenderPick": true,
//         "pickCount": 3,
//         "newSince": "2026-05-27T..."
//       }
//     }
//   }
//
// Spec: PLAN_BUDTENDER_PICKS_BADGES_2026_05_30.md § 5.
//
// **Defensive posture** — any failure (network, 5xx, malformed JSON,
// schema drift) resolves to an empty Map so the product card grid keeps
// rendering with no badges. A brapp outage must NEVER tank the public
// site's menu surface.
//
// **Keying contract** — inv-App emits `product_id` as the row key (the
// inv-App canonical UUID/text id). The /order menu on greenlife-web
// reads `MenuProduct.id` from `getMenuProducts()` which is the same
// inv-App product id (shared Neon DB per CLAUDE.md "Multi-store
// reality"). Lookup is a direct `flags.get(product.id)`.
//
// **5-min ISR window** matches inv-App's `Cache-Control: s-maxage=300,
// stale-while-revalidate=600` — Next.js data cache uses our
// `next: { revalidate: 300 }` hint regardless of the upstream header.

import { DAY_MS } from "./time-constants.ts";

const DEFAULT_INV_APP_URL = "https://brapp.greenlifecannabis.com";

// Public allow-list defense (sister of `lib/closure-status.ts inventoryappBase()`).
// If NEXT_PUBLIC_INVENTORYAPP_URL drifts to a 404 subdomain, this falls
// back to the canonical hardcoded host so the badge fetch keeps working
// during an env-drift incident.
function invAppBase(): string {
  const env =
    typeof process !== "undefined"
      ? process.env.NEXT_PUBLIC_INVENTORYAPP_URL
      : undefined;
  if (!env || !env.startsWith("https://")) return DEFAULT_INV_APP_URL;
  try {
    const u = new URL(env);
    if (u.hostname !== "brapp.greenlifecannabis.com") return DEFAULT_INV_APP_URL;
    return env.replace(/\/+$/, "");
  } catch {
    return DEFAULT_INV_APP_URL;
  }
}

export type ProductFlags = {
  isBudtenderPick: boolean;
  pickCount: number;
  newSince: string | null;
};

type RawFlags = {
  isBudtenderPick?: boolean;
  pickCount?: number;
  newSince?: string | null;
};

type RawResponse = {
  generatedAt?: string;
  products?: Record<string, RawFlags>;
};

/**
 * Fetch product flags from inv-App with 5-min ISR. Returns a `Map<id, flags>`
 * — the consumer (`OrderMenu` / future menu surfaces) does a direct
 * `flags.get(product.id)` to find badge data per product card.
 *
 * Empty Map on any failure path (network, 5xx, malformed JSON). Safe to
 * await in a parallel `Promise.all` next to the other menu-data fetches —
 * 5s AbortSignal timeout caps the worst case.
 */
export async function fetchProductFlags(): Promise<Map<string, ProductFlags>> {
  const url = `${invAppBase()}/api/public/product-flags`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      // ISR — Next.js data cache for 5 min. Matches inv-App's
      // s-maxage=300 + the badge memo's "fetch this on ISR every 5 min."
      next: { revalidate: 300 },
    });
    if (!res.ok) return new Map();
    const body = (await res.json()) as RawResponse;
    if (!body || typeof body !== "object" || !body.products) {
      return new Map();
    }
    const out = new Map<string, ProductFlags>();
    for (const [id, raw] of Object.entries(body.products)) {
      if (!id || typeof id !== "string") continue;
      const pickCount =
        typeof raw.pickCount === "number" && Number.isFinite(raw.pickCount) && raw.pickCount > 0
          ? Math.floor(raw.pickCount)
          : 0;
      const isBudtenderPick = raw.isBudtenderPick === true && pickCount > 0;
      const newSince =
        typeof raw.newSince === "string" && raw.newSince.length > 0 ? raw.newSince : null;
      // Skip rows with no signal — defensive against an inv-App ship
      // that emits all products. The public site only needs the rows
      // with a badge to render.
      if (!isBudtenderPick && newSince === null) continue;
      out.set(id, { isBudtenderPick, pickCount, newSince });
    }
    return out;
  } catch {
    return new Map();
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Returns true when the New-This-Week badge should render for a product.
 * Spec: any `newSince` within the last 7 days passes (the inv-App route
 * already pre-filters at SQL level, but we re-check on the client to
 * defend against an inv-App ship that widens the window without a
 * matching public-site copy update).
 */
export function isNewThisWeek(
  flags: ProductFlags | undefined,
  now: Date = new Date(),
): boolean {
  if (!flags || !flags.newSince) return false;
  const ms = Date.parse(flags.newSince);
  if (!Number.isFinite(ms)) return false;
  const ageMs = now.getTime() - ms;
  const SEVEN_DAYS_MS = 7 * DAY_MS;
  return ageMs >= 0 && ageMs <= SEVEN_DAYS_MS;
}

/**
 * Returns true when the social-proof variant ("Picked by N regulars")
 * should render. Threshold = 3 per the badge memo § 5.
 */
export function hasSocialProof(flags: ProductFlags | undefined): boolean {
  return !!flags && flags.isBudtenderPick && flags.pickCount >= 3;
}
