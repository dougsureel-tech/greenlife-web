# Year-in-Strains Wrapped — architecture + flip-on guide

`/account/wrapped` — a Spotify-Wrapped-class annual ritual built on
receipt-verified purchase data. Each customer gets a personalized
recap page + downloadable share-card PNG (IG/TikTok story shape +
square fallback) at year-end.

Spec: `/CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md` §C1.

---

## What ships in this commit

| File                                                       | Purpose                                                                  |
| ---------------------------------------------------------- | ------------------------------------------------------------------------ |
| `lib/wrapped.ts`                                           | Data types, WAC-safe stat formatters, `getWrappedRecap()` fetcher        |
| `lib/wrapped-mock-data.ts`                                 | Fixture used by preview mode + Phase 1 mock-mode                         |
| `components/WrappedShareCard.tsx`                          | Server Component panel — tiles for top strains, family, terpenes, etc.   |
| `components/WrappedReveal.tsx`                             | Client Component — staged fade-in on mount, respects reduced-motion      |
| `app/account/wrapped/page.tsx`                             | Customer-facing surface (Clerk-gated when flag is ON; 404 when OFF)      |
| `app/api/wrapped/share-card/route.tsx`                     | Edge-runtime PNG render via `next/og`'s `ImageResponse`                  |
| `docs/wrapped.md`                                          | This doc                                                                 |
| `docs/migrations/20260522000001_wrapped_recap.sql`         | SQL for the `customer_year_recaps` table (Doug-run, not auto-applied)    |

---

## Lifecycle

```
WRAPPED_ENABLED env var (Vercel)
  │
  ├─ unset / "false" / anything but the literal string "true"
  │     → /account/wrapped         = HTTP 404
  │     → /account/wrapped?preview=1 = renders mock fixture (Doug eyes only)
  │     → /api/wrapped/share-card  = 404 (unless ?preview=1)
  │
  └─ "true"
        → /account/wrapped         = Clerk-gated; renders customer's real recap
        → /api/wrapped/share-card  = renders that customer's PNG share-card
```

**Default OFF.** Doug flips ON post-cutover via Vercel env var; redeploy.

## Mock-data mode (current state)

Until Phase 1 (receipt-verified purchase corpus + strain reviews infra)
ships, every render reads from `lib/wrapped-mock-data.ts`. The page
contract is stable — switching to real data is a 1-line swap inside
`getWrappedRecap()` in `lib/wrapped.ts` (uncomment the SELECT against
`customer_year_recaps`).

## Compliance — WAC 314-55-155

Every dynamic stat string flows through one of the formatters in
`lib/wrapped.ts`:

- `formatVarietyBrag()` — exploration framing (count of strains, % vs
  peers); NEVER volume bragging on grams or dollars.
- `formatFamilyBrag()` — completion framing (X of Y on our shelf).
- `formatTerpeneBrag()` — aroma palette (citrus-bright, etc.); NEVER
  effect/medical attribution.
- `formatLoyaltyBrag()` — "the strain you came back to" loyalty pick.

The share-card PNG renders typography + brand mark only. NO photos of
people. The same hero blurb + stat set used on the page is reused on
the card — drift impossible since both consume the same `WrappedRecap`.

## Share-card endpoints

- `/api/wrapped/share-card?year=2026&shape=portrait` → 1080×1920 PNG
  (IG/TikTok story default).
- `/api/wrapped/share-card?year=2026&shape=square` → 1080×1080 PNG
  (square fallback for static feeds).

Edge runtime · `next/og` `ImageResponse` · 24h browser cache + 24h
Vercel CDN cache (s-maxage via `Vercel-CDN-Cache-Control` per the
known-bug recipe — see `feedback_imageresponse_cache_pattern`).

## Doug's flip-on checklist (post-cutover)

1. Verify mock render: visit
   `https://www.greenlifecannabis.com/account/wrapped?preview=1` (flag
   OFF, preview query). Confirm the recap card and the share-card
   download buttons render cleanly.
2. Sanity-check the PNG: open
   `https://www.greenlifecannabis.com/api/wrapped/share-card?preview=1&shape=portrait`
   in a new tab. Should be a 1080×1920 emerald-green gradient with the
   mock customer name.
3. When Phase 1 (real recap data) is ready, run the SQL at
   `docs/migrations/20260522000001_wrapped_recap.sql` against the
   Wenatchee Neon DB.
4. Wire the real fetcher (1-line uncomment in `lib/wrapped.ts`).
5. Set `WRAPPED_ENABLED=true` in Vercel env (production target);
   redeploy.
6. Visit `/account/wrapped` while signed in; confirm the recap renders
   with your real data.

## Sister site

Seattle Cannabis Co.
(`/Users/GreenLife/Documents/CODE/Green Life/seattle-cannabis-web`)
ships a byte-similar surface with the indigo/violet/fuchsia palette
swapped in for the emerald/lime/stone GLW palette. Read
`seattle-cannabis-web/docs/wrapped.md` for the SCC-side details.
