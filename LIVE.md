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

- OPERATING_PRINCIPLES (`~/Documents/CODE/RANDOM/OPERATING_PRINCIPLES.md`) — the post-deploy verify discipline
- AGENT_BOARD (`~/Documents/CODE/Green Life/AGENT_BOARD.md`) — active in-flight work
- MENU_LOG (`~/Documents/CODE/MENU_LOG.md`) — required reading for any /menu or iHeartJane work
- INCIDENTS (`~/Documents/CODE/INCIDENTS.md`) — closed post-mortems (grep first)
