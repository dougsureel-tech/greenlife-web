# Marketing attribution — `?from=` + `gl_attr_source`

How the public-site half of the attribution stack works, what it captures, and how to extend it without breaking the contract.

The motivation lives in `~/Documents/CODE/MARKETING_LOG.md`: SMS, push, deals, and brand pages were firing into a void with no way to trace which surface drove a visit or order. This doc covers the **front-end** of the fix. The POS-side join (matching the cookie to a completed transaction) lives in `Inventory App` and lands when that lane unlocks.

## The contract

1. **Outbound CTA.** Any internal `<Link href="...">` that we want to attribute wraps the href with `withAttr(href, kind, slug)`. The helper appends `?from=<kind>:<slug>` to the URL.
2. **Inbound capture.** `proxy.ts` reads `?from=` on every request, validates against the `SOURCE_KINDS` allowlist, and writes the value to the `gl_attr_source` cookie (30-day TTL, `SameSite=Lax`).
3. **Last touch wins.** A new `?from=` overwrites the cookie. First-touch attribution will live in a separate cookie (`gl_attr_first`) when we need it; today we only need last touch.
4. **Validator is strict.** Anything that isn't `^([a-z-]+):([a-z0-9_:-]{1,64})$` and on the allowlist gets rejected. The cookie is safe to render in admin reports without escaping.

## Source kinds

Defined in `lib/attribution.ts → SOURCE_KINDS`. Add new kinds here only when a new outbound surface starts emitting them — the validator + admin-side code both depend on the closed set.

| Kind | Slug shape | Meaning |
|---|---|---|
| `deal` | `<deal-id>` | Click on a /deals/[id] deep page CTA |
| `deals-card` | `<deal-id>` | Click on a deal card on /deals (top funnel) |
| `brand` | `grid-<slug>` / `<slug>` | Brand grid → brand page click, or brand page → /menu |
| `home` | `hero-order`, `hero-browse`, `bottom-order`, `bottom-browse` | Homepage hero + bottom CTA strip |
| `header` | `order-now`, `mobile-order` | SiteHeader desktop and mobile-drawer order CTA |
| `sticky` | `open-normal`, `closing`, `deal-<id>`, `menu` | MobileStickyCta primary/secondary |
| `footer` | `order`, `browse` | Pre-footer CTA strip |
| `quiz` | `<effect>` | /find-your-strain quiz result CTA |
| `blog` | `<post-slug>` | Blog post CTA out to /menu |
| `stash` | `rehydrate` | /stash → /menu round-trip |
| `social` | `<platform>` | Inbound from social share (set by share URL itself) |
| `sms` | `<campaign-id>` | SMS campaign deep-link |
| `push` | `<campaign-id>` | Push notification deep-link |
| `email` | `<template-id>` | Email deep-link |

## Extending — when you add a new outbound surface

1. Pick the kind that fits. Add a new kind to `SOURCE_KINDS` only if none fit.
2. Wrap the `href` with `withAttr(href, kind, slug)` at the site of use.
3. Type-check (`pnpm exec tsc --noEmit`). The `kind` param is a literal-union type; typos fail at build.
4. Update this doc + `MARKETING_LOG.md`'s activity log line.

## Caveats

- **iHeartJane is third-party.** When a customer hits `/menu`, Boost takes over and the URL/path no longer carries our query string. The cookie persists on `greenlifecannabis.com` though, so the next time the customer returns the source is still readable. Native `/order` orders read the cookie server-side at submission.
- **Last-touch can hide first-touch loyalty.** A customer who saw a daily-deal SMS three days ago and finally orders today after clicking the homepage hero will be attributed `home:hero-order`, not `sms:<campaign-id>`. This is fine for the current "is this surface working" question; we'll add first-touch later.
- **No PII.** The cookie value is `kind:slug`, no user IDs. Personalization that wants user IDs has to read Clerk session separately.
- **Validator is the security boundary.** Never read the cookie value without going through `validateAttrValue()` on the read path too — proxy already gates writes, but downstream consumers should re-validate.

## Phase plan (from `MARKETING_LOG.md`)

- **Phase 1: front-end emit + cookie capture.** ✅ Shipping now (v3.6).
- **Phase 2: bandit selector + analytics dashboard.** Needs Phase 1 data + POS join.
- **Phase 3: AI content generation.** Needs Phase 2 outcome scores.
- **Phase 4: 30-day new-feature monitor.** Needs Phase 1 data + per-feature surface tagging.

## File map

- `lib/attribution.ts` — kinds + helpers (`withAttr`, `makeAttrValue`, `validateAttrValue`).
- `proxy.ts` — capture middleware. Cookie write happens inside the canonical-host flow.
- Outbound emit sites — currently: `app/page.tsx`, `app/deals/page.tsx`, `app/deals/[id]/page.tsx`, `app/brands/page.tsx`, `components/SiteHeader.tsx`, `components/MobileStickyCta.tsx`, `components/SiteFooter.tsx`. New surfaces follow the same pattern.
