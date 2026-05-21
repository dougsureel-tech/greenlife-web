# Terpene Fingerprint + Cousin-Finder (C7)

C7 of `PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md`.

This is the **STRONGEST patent-defensibility piece** in the parent
innovation slate. Read this doc before modifying any of the files
referenced below.

## What it is

Two-part feature surfaced at `/account/terpene-profile`:

1. **Terpene Fingerprint** — a 7-axis radar (spider) chart visualizing
   the customer's personal aromatic preference vector, computed from
   their receipt-verified purchase + rating history. The seven axes
   are Myrcene · Limonene · Caryophyllene · Pinene · Linalool · Humulene
   · Terpinolene.
2. **Cousin-Finder** — a recommendation surface that finds the closest
   untried strain in the lineage graph relative to the customer's
   highest-rated strains, blending terpene-cosine-similarity with
   shortest-path lineage distance.

## Patent claim — receipt-verified × terpene × lineage-graph

The novel combination claim is:

> A method comprising: (a) receipt-verified purchase weights derived
> from a customer's transaction history at a regulated cannabis
> retailer, (b) a per-customer multi-axis terpene-affinity vector
> computed from said weighted purchase data combined with said
> customer's per-strain rating signal, and (c) a recommendation
> surface that ranks untried strains in the retailer's verified
> inventory by combining a graph-shortest-path distance over a strain
> lineage corpus with said terpene-affinity vector cosine similarity.

The combination is genuinely novel — wine has terroir but not
parent/child lineage, beer has style hierarchies but not genetic
ancestry, coffee has origin but not breeding. Cannabis is the only
consumer-goods vertical with all three signals available simultaneously
(real lineage, real terpene chemistry, real purchase verification).

Filing recommendation per parent plan §8: single Perkins-Coie
provisional bundling C1 + C2 + C7 + C9 + C11 as dependent claims under
the parent §5 patent.

## Files in this feature

| File | What it does |
|---|---|
| `lib/terpene-fingerprint.ts` | Server-only. Computes the 7-axis vector + cosine similarity. Houses the scoring constants — these MUST NOT leak into the client bundle. |
| `lib/cousin-finder.ts` | Server-only. BFS over the lineage graph + blended cousin-score. |
| `components/TerpeneRadarChart.tsx` | Client component. Pure SVG visualization — accepts pre-computed vectors, no scoring math on the client. |
| `app/account/terpene-profile/page.tsx` | Server Component. Env-flag-gated; mounts the radar + cousin list. |

## DO NOT touch

Per the C7 ship discipline, these files are out-of-scope for this
feature:

- `lib/strains.ts` — adding terpene axes or strain entries here is a
  separate ship. The fingerprint logic READS strains; never modifies
  them.
- `lib/db.ts` — DB queries belong in their own ship; the C7 page runs
  in mock-data mode until reviews/purchase ships.
- `app/strains/[slug]/page.tsx` — wiring cousin chips into the strain
  page is a Phase 4.4 follow-up ship. C7 ships the `/account` surface
  only.
- `lib/strain-pairings.ts` — if it exists, leave it alone; pairings
  are a separate concept from cousins.

## Feature flag

All consumers MUST check:

```ts
if (process.env.TERPENE_FINGERPRINT_ENABLED !== "true" && !previewMode) {
  notFound();
}
```

Default OFF until:

1. The `customer_terpene_profiles` table has been created (migration
   `0308_terpene_fingerprint` in the Inventory App repo).
2. The nightly recompute cron has run at least once and backfilled
   real vectors for active customers.
3. Doug greenlights the surface for soft-launch.

## How Doug previews this page (no flag flip required)

Append `?preview=1` (or `?preview=true`) to the URL — works on prod
without logging in, surfaces the mock-fixture render with the dotted
"Preview mode" banner. Live URLs:

- glw: `https://www.greenlifecannabis.com/account/terpene-profile?preview=1`
- scc: `https://www.seattlecannabis.co/account/terpene-profile?preview=1`

The escape chain (sister of wrapped page's pattern):

1. **Middleware** (`proxy.ts`) — Clerk's `auth.protect()` is skipped when
   `?preview=1` is present on `/account/*` paths.
2. **Page** (`app/account/terpene-profile/page.tsx`) — the env-flag
   `notFound()` is gated on `!previewMode`; the in-page Clerk session
   check is also skipped in preview.
3. **Render** — same `buildMockFingerprint()` + cousin-finder code path
   the real-data flow uses; only the auth + flag dance is bypassed.

Real-data render still requires both flag ON AND Clerk login — the
preview path renders mock fixtures only and never reads customer-
specific data, so it can't be used to exfiltrate real terpene profiles.

## Mock-data mode

While the feature flag is OFF — and even when ON, for customers with
no rated strains yet — the page renders a mock vector via
`buildMockFingerprint()`. The mock vector represents a plausible
"Pacific Northwest hybrid customer" baseline computed from averaging
the top-3 terpenes of the 5 highest-shelf-presence WA strains. It is
explicitly labeled "Preview mode" in the UI so customers don't
mistake the starter palette for their own data.

## WAC 314-55-155 posture

Terpene chemistry is **process language**, not medical. Vocabulary:

- ALLOWED: "limonene-forward palette", "shares aromatic family",
  "lineage cousins", "myrcene-heavy profile", "pepperier than your
  current picks"
- NOT ALLOWED: "calming", "sedating", "treats anxiety", "helps you
  sleep", "energizing"

Same posture as `lib/strains.ts` + `/strains/[slug]` pages. The
chart axis tooltips use scent-character notes only.

## Cross-stack ports

- **GLW** — byte-identical sister-port already shipped under v37.905.
  Both stacks consume `lib/strains.ts` independently; vectors diverge
  per-stack because each store has its own customer corpus.
- **GW patient-side** — future port with HIPAA isolation. Treatment-
  context vector instead of recreational-preference vector. Separate
  plan doc to scope.
- **CannAgent operator vendor-purchasing** — terpene-vector similarity
  for inventory decisions. Same kernel, different consumer.

## Verifying the math kernel (when tests land)

Until pin-tests for this lib ship, manual verification recipe:

```ts
import { computeTerpeneFingerprint } from "@/lib/terpene-fingerprint";
import { STRAINS } from "@/lib/strains";

const v = computeTerpeneFingerprint(
  [
    { strainSlug: "blue-dream", rating: 5, purchaseCount: 3 },
    { strainSlug: "gg4", rating: 4, purchaseCount: 1 },
  ],
  (slug) => STRAINS[slug],
);
// v should be a 7-element array summing to ~1.0; Myrcene + Pinene
// dominant (Blue Dream's top terpenes scaled by 5★ rating + 3 purchases).
```

## Cron stub for the foundation ship

When customer review + purchase data is wired, the nightly recompute
cron will (a) query each customer's rated-strain history, (b) call
`computeTerpeneFingerprint()`, and (c) upsert the result into
`customer_terpene_profiles` with `version_int = VECTOR_VERSION`.
The migration is staged at `packages/db/migrations/0308_terpene_fingerprint.sql`
in the Inventory App repo (see that ship's notes).

## Patent-track checklist for future modifications

Before touching any C7 file, confirm:

- [ ] Scoring constants (POSITION_WEIGHTS, AXIS_CAP, ratingWeight,
      purchaseWeight, TERPENE_WEIGHT, LINEAGE_WEIGHT, MAX_LINEAGE_DEPTH)
      still live in server-only modules — no client-bundle leakage.
- [ ] Vector schema unchanged OR `VECTOR_VERSION` bumped — cached
      `customer_terpene_profiles.terpene_vector` rows have a version
      column for in-place migration.
- [ ] WAC vocabulary intact — flavor/aroma only, no efficacy.
- [ ] Feature flag still respected at the page entry.
