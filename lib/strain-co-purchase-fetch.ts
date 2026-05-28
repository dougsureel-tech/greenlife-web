// Strain co-purchase rail fetch — used by /strains/[slug] to populate the
// "People who pick {strain} also reach for these" rail. Calls the THIS-store
// inv-App URL only (Wen for glw, SCC for scc) — co-purchase data is store-
// specific by design (the basket-level Markov is computed against each store's
// own sales data; SCC's customers aren't shopping at the Wenatchee shelf, so
// surfacing Wen partners on a SCC strain page would be misleading).
//
// Sister of `lib/strain-stock-cross-store.ts` but SINGLE-STORE: strain-stock
// is "cross-store availability cue" (legitimately spans both inventories);
// co-purchase is "this-store basket signal" (each store has its own truth).
//
// Soft-fails to `{ partners: [] }` on any error (unreachable, malformed,
// timeout); the public-site `<StrainCoPurchaseRail />` renders nothing when
// partners is empty. Defense-in-depth for transient inv-App outage.
//
// WSLCB-safe shape: response carries only slug + name + type — no $ figures,
// no customer counts, no purchase frequencies, no transaction IDs. Aggregate
// strain-pair surfacing only.

const INV_APP_BASE = "https://brapp.greenlifecannabis.com";
const SLUG_RX = /^[a-z0-9](?:[a-z0-9-]{0,78}[a-z0-9])?$/;

export type CoPurchasePartner = {
  slug: string;
  name: string;
  type: "indica" | "sativa" | "hybrid";
};

export type CoPurchaseResult = {
  partners: CoPurchasePartner[];
};

type RawBody = {
  store?: string;
  slug?: string;
  partners?: Array<{ slug?: string; name?: string; type?: string }>;
};

const VALID_TYPES = new Set(["indica", "sativa", "hybrid"]);

/** Fetch the co-purchase partners for this strain from the this-store
 *  inv-App endpoint. Returns `{ partners: [] }` on any failure. */
export async function fetchStrainCoPurchase(
  slug: string,
): Promise<CoPurchaseResult> {
  if (!slug || !SLUG_RX.test(slug)) return { partners: [] };

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);
  try {
    const res = await fetch(
      `${INV_APP_BASE}/api/public/strain-co-purchase/${encodeURIComponent(slug)}`,
      {
        signal: controller.signal,
        // Defer cache to inv-App's Cache-Control (1h s-maxage, 6h SWR) — the
        // co-purchase signal updates over weeks, so a 1h Next.js data-cache
        // window matches the upstream policy. Sister of strain-stock-cross-
        // store but with a longer revalidate (60 min vs 5 min) since the
        // underlying Markov rollup is computed nightly anyway.
        next: { revalidate: 3600 },
      },
    );
    if (!res.ok) return { partners: [] };
    const body = (await res.json()) as RawBody;
    if (!body || typeof body !== "object" || !Array.isArray(body.partners)) {
      return { partners: [] };
    }
    // Validate each partner row defensively — drop malformed entries rather
    // than throwing. Caller renders nothing if the surviving list is < 2 partners.
    const partners: CoPurchasePartner[] = [];
    for (const p of body.partners) {
      if (!p || typeof p !== "object") continue;
      if (typeof p.slug !== "string" || !SLUG_RX.test(p.slug)) continue;
      if (typeof p.name !== "string" || p.name.length === 0) continue;
      if (typeof p.type !== "string" || !VALID_TYPES.has(p.type)) continue;
      partners.push({
        slug: p.slug,
        name: p.name,
        type: p.type as CoPurchasePartner["type"],
      });
    }
    return { partners };
  } catch {
    return { partners: [] };
  } finally {
    clearTimeout(timer);
  }
}
