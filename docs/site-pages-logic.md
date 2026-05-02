# Public site — per-page logic & funnel role

The thesis: **every page is one of three things — discovery, conviction, or transaction.** Discovery widens the top of the funnel (someone who has never heard of us). Conviction narrows trust (someone deciding if we're the right shop). Transaction is the cash-register tap. Small adjustments at each stage compound across thousands of monthly visitors — a 2% lift at /menu lands on every customer; a 2% lift on /faq only lands on the few who reach that page.

What we have to account for:

- **Cases on the floor** — what's physically in the display cases right now. The site has to surface what we want to move *first*. New SKUs only earn shelf space once we sell through the targets we set against existing stock. Until inventoryapp has a "cases full?" gate (queued, see STATUS.md), we manually steer customers toward what's open — via deals, brand pages, and homepage feature slots.
- **What we're trying to sell through** — dead-stock and slow-movers from `/admin/dead-stock` should be over-indexed in the deals page, in the homepage feature row, and in /find-your-strain results when their effects/category match. Same approach: small over-index nudges compound into shelf turnover.
- **What's in stock** — every product surfaced anywhere on the public site comes from `getMenuProducts()` which already filters `carry_status != 'discontinued'` and `unit_price >= $1.99`. So we never accidentally sell phantom inventory. Live snapshots flow through within a few minutes of POS.

Pages below are ordered by where in the funnel they live, not alphabetically.

---

## Discovery — pulling people in

### `/` (home)

**Purpose.** First impression. Establish: who we are, where we are, what we sell, why we're trustworthy.

**Funnel role.** Discovery → conviction. About 60% of visits start here when someone Googles "dispensary Wenatchee" or types our domain.

**What we want them to do.** Click into `/menu` (primary CTA), or scroll the brand strip / featured products and click through. Secondary: capture geo-intent for the LocalBusiness JSON-LD that feeds Google's local pack.

**Big-picture tie-in.** This is where local SEO compounds — the `STORE.nearbyTowns` array drives the `areaServed` schema graph + the metadata description, so search engines see consistent geographic intent every crawl. The "We serve the whole valley" town card grid is also the highest-yielding "small adjustment" on this page: each town card is a future search-result for "dispensary near {town}".

**Small-adjustments-compound watch list.**
- Homepage hero info card live status → "open now" pill drives walk-in conversions all day, not just at decision time
- Featured products row → rotates daily; sub it for sell-through targets when cases are full
- Brand strip ordering → top brands earn placement; rotate in the brand we want to push
- Trust block ("budtenders / locally owned / 16 yrs") → conversion lift on first-time visitors who aren't sure about cannabis retail

### `/blog`, `/learn`, `/find-your-strain`

**Purpose.** Long-tail organic search + first-touch trust. Cannabis 101 educates while the funnel does its work.

**Funnel role.** Discovery only — we don't expect a sale from a blog reader on first visit. Goal: rank, capture, and seed the menu CTA so a returning visitor remembers us.

**What we want them to do.** Read, click "Browse the menu" at the bottom, maybe bookmark.

**Big-picture tie-in.** Every published article is a future entry point. `/learn` topics map to product categories, and `/find-your-strain` outputs match real SKUs from our inventory — so a quiz answer of "Energize" hits actual flower we stock, not a generic strain encyclopedia.

**Small-adjustments-compound watch list.**
- Adding 1 article/month doubles long-tail surface area in 18 months without doubling work
- `/find-your-strain` should over-weight slow-movers when their effects match — a small bias compounds into shelf turnover

### `/brands` + `/brands/[slug]`

**Purpose.** Brand-as-search-target. Customers who already know "I want Phat Panda" land here. Secondary: brand storytelling on the dialed-in pages.

**Funnel role.** Discovery + conviction. The dialed-in pages (Sungrown, NWCS, 2727, Plaid Jacket, etc.) carry FAQ JSON-LD so AI engines like ChatGPT/Perplexity cite us when someone asks "where is Plaid Jacket made" — that's a referral source we don't pay for.

**What we want them to do.** Filter the menu to that brand → click through to /menu.

**Big-picture tie-in.** Each new dialed-in brand page is a permanent SEO asset. The vendor-pages-overhaul initiative proves the model one brand at a time before scaling.

**Small-adjustments-compound watch list.**
- /deals now surfaces vendor logos when brands match → drives traffic to the dialed-in pages from a high-intent surface (deals)
- Sub-brand cards on each brand page filter the product grid → reduces clicks-to-find for customers who know exactly what they want
- A brand page that ranks for one Google keyword stays ranked — the asset compounds even when we stop publishing

---

## Conviction — narrowing trust

### `/about`, `/our-story`, `/visit`

**Purpose.** Tell the customer *why* before *what*. Local independent ownership, 16+ years, the people behind the counter.

**Funnel role.** Conviction. Visited mostly by first-time customers and Google when ranking us.

**What we want them to do.** Trust → click "Order for Pickup" / "Browse the menu".

**Big-picture tie-in.** Local independent positioning is a margin moat — chains can't claim it. Every page that reinforces "locally owned, founded 2014, same building since" compounds the brand premium and lets us hold prices vs. high-volume rivals.

**Small-adjustments-compound watch list.**
- Founder bio + photo → first-time visitors who see a face convert better than visitors who see only a logo
- "Same building since 2014" — small repeat across pages compounds into local-permanence association

### `/faq`

**Purpose.** Pre-empt the questions that block a sale. WSLCB requirements, cash-only, ID, parking, hours, returns, loyalty.

**Funnel role.** Conviction → transaction. Customers reach this when they have one specific block. Answering it well removes the block.

**What we want them to do.** Resolve the question → click straight to /menu without bouncing to a competitor.

**Big-picture tie-in.** FAQ entries are the most-asked WSLCB compliance questions. Each one we answer well is one fewer phone call to staff during peak hours — labor savings that compound.

### `/press`, `/contact`

**Purpose.** Media inquiries + customer support touchpoints. Low traffic but high downstream value (one media placement = months of organic traffic).

---

## Transaction — closing

### `/menu` (iHeartJane Boost embed)

**Purpose.** The shop. Every other page on this site funnels here.

**Funnel role.** Transaction. Per-feedback memory: this is THE order surface — `/order` is dev-only, all CTAs route here.

**What we want them to do.** Add to cart → check out via Boost.

**Big-picture tie-in.** Every UI tweak elsewhere is measured by /menu conversion. /deals card click → /menu landing → cart-add → check-out. Each step has a conversion rate; small lifts at each multiply.

**Small-adjustments-compound watch list.**
- iHeartJane Boost bundle hash freshness — see MENU_LOG.md for the recovery recipe
- The fast-fallback panel (auto-shows after 2s of stuck Boost) → recovery path so a stuck render doesn't lose the sale
- Anything we surface upstream that already filters to the right intent (vendor / category / deal) lands at /menu primed to convert

### `/deals`

**Purpose.** Sell-through accelerator + acquisition.

**Funnel role.** Mid-funnel discovery → high-intent transaction. A deal-shopper landing here is unusually close to converting.

**What we want them to do.** Pick a deal → tap "View on menu" → land at /menu pre-filtered by intent.

**Big-picture tie-in.** This is where the *sell-through gate* matters most. If shelves are full of last quarter's flower, /deals should over-weight that flower. Once the sell-through gate (queued) ships, the deals admin will know what's full and steer the daily-deal mailer accordingly.

**Small-adjustments-compound watch list.**
- v3.4 vendor-art redesign → emotional pull from the bud photo + giant percent-off, beats the prior emoji medallion
- "Shop {Brand} →" pill on vendor matches → cross-funnel into the dialed-in brand page for sustained engagement
- "Ending Soonest" badge on top deal → urgency without being pushy

### `/order`

**Purpose.** Native-menu order flow (eventually replaces Boost). Currently dev-only.

**Funnel role.** Future transaction surface. Today: not in the customer-facing CTA path.

**Big-picture tie-in.** Replacing Boost is the long-term play (zero CORS, zero embed risk, full control of the upsell flow + the "X people viewing" type signals we can't add to Boost).

### `/account`, `/sign-in`, `/sign-up`, `/stash`

**Purpose.** Returning-customer continuity — saved cart, stash, order history.

**Funnel role.** Repeat transaction. Loyalty + cart persistence compound LTV.

**Big-picture tie-in.** The Springbig replacement plan eventually plugs in here. For now, Clerk is wired but on dev keys (see STATUS.md) — production keys + saved cart + LTV badges are the next big unlock.

**Small-adjustments-compound watch list.**
- Cart persistence (24h cookie) — recovers the abandoned-cart cohort
- Order tracker (already shipped on Seattle, Wenatchee parity TODO)
- Loyalty preview on home + cart — "you're 23 points from a free pre-roll" beats a pure points number

---

## How small adjustments compound

The math in plain terms: if /menu sees 30,000 visits/month and conversion is 18%, a 1-point lift in conversion = 300 extra orders/month. At average ticket $42, that's $12,600/month from one single 1-point lift. Stack 4 lifts (faster page, better vendor surfacing, deal urgency, abandoned-cart recovery) and the surface has materially shifted.

This is why we ship small. Big rewrites require big approvals and rarely outperform a string of small focused improvements that each add 0.5–2 points of conversion on the surface they touch.

---

## What we still owe this doc

- Real numbers per page (visit volume, conversion to /menu click, cart-add rate). Right now we cite the ratios without citing the source. Once `getTodayCustomerMix` is extended with the funnel-stat queries the Explore agent sketched (see STATUS.md), wire them in here.
- Seattle equivalents — most of the above applies, but the indigo palette, neighborhood-specific funnel, and Rainier Valley framing change the conviction narrative.
- "Cases full?" gate — once shipped, document the rule for which surface gets sell-through priority (deals first, then home featured, then /find-your-strain bias).
