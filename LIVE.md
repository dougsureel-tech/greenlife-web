# LIVE — greenlife-web (Wenatchee public site) deployment state

Last-Known-Good (LKG) deployment log per OPERATING_PRINCIPLES post-deploy verify rule.

**Canonical URL:** https://greenlifecannabis.com
**Apex + www:** middleware-redirected to canonical (per `proxy.ts`)
**Health endpoint:** /api/health
**Deploy trigger:** push to `main` (Vercel native via GitHub integration).

**Verification recipe:**

```bash
curl -fsS https://greenlifecannabis.com/api/health \
  | python3 -c "import sys,json; d=json.load(sys.stdin); print('v%s sha=%s ok=%s' % (d['version'], d['sha'], d['ok']))"
```

Verified deploy = (a) HTTP 200, (b) `ok: true`, (c) `sha` matches what was just pushed.

**Why a separate /api/health on greenlife-web** (vs reading inventoryapp's): this repo is the **customer-facing** public site (apex domain). Vercel routes apex → here → middleware redirect logic. inventoryapp serves staff at `inventoryapp-ivory.vercel.app` — different deployment. Both must be checked independently after a push that touches either.

---

## LKG history

| Date (PT) | Version | SHA | Notes |
|---|---|---|---|
| 2026-05-27 | **v41.905** | 7f0b34a | 🃏 **Card-hierarchy flip (Ship 0.3 / Strain Tree arc) — flag-gated `CARD_HIERARCHY_FLIP_V2`, default OFF.** Sister scc v33.185. `/strains` hub card render swaps to name (`<h3>`, larger) → 1-sentence tagline → smaller chip row (type · dominant terpene · "Typical THC X–Y%") when flag-on AND `s.tagline` non-empty. Per-card legacy fallback when tagline empty (0 strains today have empty tagline → no fallbacks fire). With flag OFF, page renders identically to v41.885 — verified flag-OFF on prod: `Typical THC` marker grep returns 0 on rendered HTML; legacy `>Indica<` chip present. Post-deploy verify `v41.905 / sha=7f0b34a / ok=true`. Doug-action: flip env-var + `vercel redeploy`. Plan: `PLAN_STRAIN_TREE_AUTONOMOUS_ARC_2026_05_27.md` §2 Ship 0.3. Result: `RESULT_CARD_HIERARCHY_FLIP_2026_05_27.md`. |
| 2026-05-25 | v41.705 | 9b2b528 | WAC 314-55-155 terpene-note + effect-label sweep — 42 terpene notes (sedating/calming → musky/warm), quiz labels, RelatedShopLinks blurbs, CBD paragraph. 5 files. All gates green. |
| 2026-05-24 | **v41.545** | 1ef1637 | 🔒 **Customer-facing form fetch-timeout ROUND 2 — closes remaining 4 unprotected sites** (cycle-8 of the keep-grinding evening). Sister SCC v32.845. Closes the cycle-5 FETCH_SIGNAL_REPOS srcRoots drift-fix arc that surfaced 10 GLW unprotected fetches; 6 fixed in v41.525 (HeroesForm, ProfileForm, AmbassadorSubmitClient×2, ApplyForm, FeedbackFormClient), 4 in v41.545 (vendor-access, /api/orders, /api/applications multipart, /api/quiz/capture). Watchdog `fetch-abort-signal-discipline` reports 0 GLW offenders post-deploy. Catch-up row added cycle-42 of fleet-doc-audit. |
| 2026-05-24 | v41.525 | 40a3bc1 | 🔒 Customer-facing form fetch-timeout polish ROUND 1 — 6 sites (HeroesForm /api/heroes 15s, ProfileForm /api/profile 15s, AmbassadorSubmitClient upload-video 60s, AmbassadorSubmitClient submit-review 15s, ApplyForm ambassador-apply 30s, FeedbackFormClient submit-feedback 15s). Sister SCC v32.825. Required pre-push gate fix-forward: `check-time-constants-inline` flagged `AbortSignal.timeout(60000)` → replaced with `MINUTE_MS` import from `@/lib/time-constants`. |
| 2026-05-21 | v38.645 | (pending) | 🧪 Catch-up + strain-families refactor + pin tests (sister scc v29.975). 4 files: NEW learn-hub.test.ts (catch-up for v38.585 changelog) · MOD strain-families.ts (1-line `@/lib/strains` → `./strains.ts` refactor) · NEW strain-families.test.ts (23 tests covering 10-family shape + anchor integrity + WAC voice + helpers). Tests 551 → 596. Pre-commit Explore CLEAN. |
| 2026-05-21 | v38.625 | 6f7d610 | 🖼️ 5 new brand logos sourced from BRAND-OWN sites (sister scc v29.955, Doug 2026-05-21 backfill). Added phat-panda · plaid-jacket · airo · flipside · harmony-farms. Coverage 29 → 34. Per parallel `claude-brand-logo-backfill-2026-05-20` session. |
| 2026-05-21 | v38.605 | 2fd2afc | 📱 Careers /apply mobile-PDF unblock + Seattle removal (Doug 2026-05-21). Accept attribute broadened to JPG/PNG/HEIC for phone photos; storePreference radio (Wenatchee/Seattle/Either) removed since GLW is the Wenatchee storefront. Per parallel session. |
| 2026-05-21 | v38.585 | (pending) | 🧪 Batch 4 pin tests — `lib/learn-hub.ts` SoT (sister scc v29.935). 22 new tests pinning 8-topic shape + WAC voice (no exclamation in title/desc/faqs) + relatedTopics referential integrity + SERP description length + helper contracts. strain-families.ts deferred (`@/lib/strains` value-import doesn't resolve under Node `--experimental-strip-types`). Tests 551 → 573. Pre-commit Explore CLEAN. |
| 2026-05-21 | v38.565 | 0a20dc0 | 🧪 Batch 3 pin tests — `lib/client-ip.ts` + `lib/store-time.ts` + `lib/time-constants.ts` (sister scc v29.915). 45 new tests (17+14+14). client-ip pins truthy-check-vs-?? distinction (whitespace x-forwarded-for must fall through). store-time pins Pacific-tz correctness via 06:00-UTC → prior-day test. time-constants pins composition (DAY_MS === 24*HOUR_MS). Tests 506 → 551. Pre-commit Explore CLEAN. Verify-via-curl `v38.565 / sha=0a20dc0 / ok=true`. |
| 2026-05-21 | v38.545 | 46a3905 | 🧪 Batch 2 pin tests — `lib/brand-logos-available.ts` + `lib/medical-pricing.ts` + `lib/online-pricing.ts` (sister scc v29.895). 57 new tests (18+14+25). medical-pricing tests are stack-portable via CANNABIS_TAX_SAVINGS_PCT round-trip (handles SCC 10.55% vs GLW 8.8% sales-tax divergence). Tests 449 → 506. Pre-commit Explore CLEAN. Verify-via-curl `v38.545 / sha=46a3905 / ok=true`. |
| 2026-05-21 | v38.525 | 1f2867e | 🧪 NEW pin tests for `lib/safe-redirect.ts` + `lib/banned-logo-url.ts` (sister scc v29.875). 62 new tests, 0 prod behavior change. Tests 387 → 449. Pre-commit Explore CLEAN. Verify-via-curl `v38.525 / sha=1f2867e / ok=true`. |
| 2026-05-19 | v37.605 | 9db2d94 | 🩹 /apply UX hardening — Tyler-referred Wenatchee applicant couldn't upload resume (no specific error). 2 adds: NEW collapsed `<details>` "Not sure how to make a PDF?" under the resume drop zone (Word/Pages/Google Docs/iPhone Notes scan recipes) · NEW "Still needed: …" hint under disabled Submit button listing exactly which required fields are empty (was: button greyed silently with no signal). `<details>` placed OUTSIDE the `<label>` wrapper so the summary tap doesn't trigger the hidden file input via implicit label-input association. Sister scc v28.965 same-push. Verify `v37.605 / sha=9db2d94 / ok=true`. typecheck CLEAN. Pre-commit Explore CLEAN. |
| 2026-05-11 | v29.905 | b6c1fe7 | 🛡️ proxy.ts CANONICAL_HOST allow-list (sister scc v21.705 — SITE-WIDE OUTAGE prevention). Middleware was reading `NEXT_PUBLIC_CANONICAL_HOST` env with zero defense; typo'd env value would 308-redirect every non-canonical request to broken host. Now requires env in `ALLOWED_CANONICAL_HOSTS` Set; falls back to `www.greenlifecannabis.com`. Verify-via-curl `v29.905 / sha=b6c1fe7 / ok=true`. Apex 308 → www works. |
| 2026-05-11 | v29.805 | 1b54603 | 🛡️ Env allow-list defense — 2 sites upgraded (welcome-email + quiz-nurture-email). Sister scc v21.605 — same memory pin. |
| 2026-05-11 | v29.705 | 813cfff | 🚨 PII leak fix (sister scc v21.505) — `lib/sms.ts` now strips `+\d{10,15}` + `\b\d{10,15}\b` from Twilio error messages. Glw doesn't yet have SMS-sending UI but lib is symmetric — bug would activate the moment SMS turns on. |
| 2026-05-11 | v29.605 | 528a26e | 🚨 Resend silent-failure defense (sister scc v21.405) — `lib/email.ts` checks `r.error` before `r.data.id`. Sister inv v305.205. |
| 2026-05-11 | v29.505 | 43b7add | 🧪 NEW TEST — email-templates.test.ts (16 tests, +1 over scc: no "veteran-owned" framing per Doug 2026-05-07 OPERATING_PRINCIPLES.md). |
| 2026-05-11 | v29.405 | c3b246b | 🧪 NEW TEST — closure-status.test.ts (22 tests, +1 over scc: cross-store leak defense — env can't drift to scc's brapp hostname). |
| 2026-05-11 | v29.305 | cb6a67d | 🧪 NEW TEST — store.test.ts (39 tests, +1 brand-voice rule over scc: no "veteran-owned" framing). |
| 2026-05-11 | v29.205 | 57c217a | 🧪 NEW TEST + 1-line bug fix — team.test.ts (19 tests, +2 over scc: Charity-off-site invariant + alumni-preservation doctrine). Same `initialOf` empty/whitespace fix. |
| 2026-05-11 | v29.105 | de60cd5 | 🧪 NEW TEST — deal-countdown.test.ts (13 tests, sister scc v20.905). |
| 2026-05-09 | v7.765 | 9f9e962 | 🌍 SEO sitemap-image hygiene — `BROKEN_LOGO_URLS` Set in `app/sitemap.ts` filters 2 known-broken vendor CDN URLs (the420bar.com 404 + agrocouture.com 202 captcha) from `<image:image>` entries. Brand page entries themselves stay in sitemap (real pages); only the broken image hint drops. Verified live: `grep "the420bar\|agrocouture" sitemap.xml` returns empty post-deploy. Doug-action queued (memory pin): update glw `vendors.logoUrl` Postgres rows to working source. Pre-commit Explore review CLEAN. tsc clean. |
| 2026-05-08 | v7.745 | 898b60c | 🛡️ PII-leak round 4 — `app/api/quiz/capture/route.ts` two catches: D+0 dispatch (Resend) + INSERT (Drizzle). Both echoed `err.message` (recipient email + sender domain on Resend; conflicting row data on Postgres) to Vercel logs. Rewritten to `err.name`. Sister scc v8.885 same wave. Verify-via-curl `v7.745 / sha=898b60c / ok=true`. Pre-commit Explore review CLEAN. tsc clean. |
| 2026-05-08 | v7.275 | 353854e | 🛡️ vercel.app-defense sister-fix — `lib/quiz-nurture-email.ts` PUBLIC_ORIGIN now rejects *.vercel.app drift, mirrors v7.235 welcome-email pattern. Sister of scc v8.415 (which also covered rewards/sign-out — glw has no rewards route). Pre-fix: if NEXT_PUBLIC_SITE_ORIGIN ever drifts to preview hostname, every quiz-capture nurture email's STOP-to-unsubscribe link would land customers on non-canonical (often short-lived) host = CAN-SPAM compliance risk. Verify-via-curl confirmed v7.275/sha=353854e/ok=true. Pre-commit Explore review CLEAN. tsc clean. |
| 2026-05-07 | v4.315 | 8b97904 | Kat-feedback batch 1: hours + team + no-stacking sweep. Strips "stacks with loyalty" copy from customer-facing pages. Pinned `feedback_no_stacking_ever` + `feedback_no_giveaways_period.md`. Mirrored to SCC at v4.945. |
| 2026-05-07 | v4.305 | daf0466 | `lib/loyalty-redemption.ts` field rename `discountFraction` → `discountPct` to match canonical inventoryapp. Mirror of seattle-cannabis-web v4.935 — SSoT-tightening only, same numeric values. |
| 2026-05-07 | v4.295 | 1e5cab6 | a11y sweep round 3 — 6 data-driven `{m.emoji}` / `{icon}` / `{CAT_ICONS}` wrappers (mood-vibe + category nav + OrderMenu + brands ×2 + about) |
| 2026-05-07 | v4.285 | b7e36dc | a11y sweep round 2 — /learn 🎓 + /visit `{b.emoji}` |
| 2026-05-07 | v4.275 | 9c1f974 | a11y sweep — homepage `How visiting works` 3-card row 💵 + 🌿 (⏱️ already had aria-hidden from prior sweep) |
| 2026-05-07 | v4.265 | 489ddbf | Pre-Next.js legacy URL preservation — 7 WP-era redirects (Wayback CDX 2014–2019) — /about-us /about/mission /about/location + /blog/blog/* + /blog/category/* + /blog/author/* + /author/* + orphaned /amazing-cannabis-plant-grows post |
| 2026-05-06 | v4.245 | bbc243d | /deals topicals icon 🌱 → 🧴 (lotion is the right glyph for cannabis topicals) |
| 2026-05-06 | v4.235 | 02707a3 | /deals concentrates icon 🧴 → 💎 (lotion read as soap; diamond is cannabis-vernacular) |
| 2026-05-06 | v4.225 | fcc28ef | new /blog/indica-vs-sativa guide (weekly-cadence stack 4 → 5) |
| 2026-05-06 | v4.165 | d7f7b72 | new /blog/edibles-dosing guide (stack 3 → 4) |
| 2026-05-06 | v4.105 | ac1090e | new /blog/terpenes-101 guide (stack 2 → 3) |
| 2026-05-06 | v4.045 | 71c1d37 | /order/* → /menu 307 redirect (matches Seattle pattern) |
| 2026-05-06 | v4.005 | 6344169 | a11y — 4 more leading-icon emojis aria-hidden |

(Older entries elide; full history is in git log. This file is the curated trail.)

---

## Cutover-window context (2026-05-07 → 2026-06-25)

Wenatchee customers DO NOT get a /rewards PWA on this domain — per cutover plan §6 Day 14, they only learn about the SpringBig→native transition via SMS + at the register. So during the cutover window, **greenlife-web is NOT on the critical path**. Routine polish work can continue here without affecting the cutover schedule.

Sister LIVE.md files:
- `Inventory App/LIVE.md` — staff-side inventoryapp (Wenatchee + Seattle deploys via separate Vercel projects)
- `Green Wellness/LIVE.md` — separate project, established 2026-05-06

---

## Rollback recipe (if a deploy lands broken)

1. Vercel dashboard → greenlife-web project → Deployments tab → find the LAST GREEN deploy from this LKG history.
2. Three-dot menu → "Promote to Production".
3. Confirm via curl that prod sha matches the rolled-back version.
4. Update LKG row noting the rollback + reason.

Greenlife-web Vercel project lives under Doug's `dougsureel-tech` account.

---

## Known iHeartJane integration constraint

Per memory `reference_iheartjane_jane_boost` and `feedback_diff_what_user_sees_first`: `/menu` uses iHeartJane Jane Boost embed (storeId 5294, embedConfigId 234). Apex-vs-www host matters — the CORS allowlist on iHeartJane's side binds www-host. Per `proxy.ts` the apex 308-redirects to canonical so this works correctly today; if the redirect breaks, /menu silently fails CORS with no visible error. Cost a 9-hour debugging session to discover; recovery recipe captured in `MENU_LOG.md` next to `INCIDENTS.md`.

---

## Cross-references

- OPERATING_PRINCIPLES (`~/Documents/CODE/OPERATING_PRINCIPLES.md`) — the post-deploy verify discipline
- AGENT_BOARD (`~/Documents/CODE/Green Life/AGENT_BOARD.md`) — active in-flight work
- MENU_LOG (`~/Documents/CODE/MENU_LOG.md`) — required reading for any /menu or iHeartJane work
- INCIDENTS (`~/Documents/CODE/INCIDENTS.md`) — closed post-mortems (grep first)
