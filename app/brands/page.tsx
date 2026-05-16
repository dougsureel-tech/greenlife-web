// canonical:ignore-file — this page 308-redirects to /menu and never returns
// content, so a canonical signal on it would be meaningless. The redirect
// itself IS the canonical declaration. Marker tells check-canonical-or-noindex
// pre-push gate to skip this file.

// Per Doug + Kat 2026-05-04: the public-facing brands index was deleted
// because (a) it exposed our full vendor relationship list and (b) it made
// daily-deal vendor concentration glanceable to anyone. The dialed-in
// per-brand override pages at /brands/[slug] are kept — those pull SEO
// traffic for "Phat Panda Wenatchee" / "Avitas WA" etc. queries and pay
// for themselves on direct link-sharing + deal-card click-throughs.
// Inbound traffic to /brands gets 308'd to /menu so any external links
// or bookmarks land on something useful.
//
// `dynamic = "force-dynamic"` is REQUIRED — without it, Next 16 captures
// `redirect()` as static HTML during prerender (page returns HTTP 200 with
// a Loading-then-router.push payload), which crawlers + curl see as 200
// + empty content. With force-dynamic the page renders per-request and
// `permanentRedirect()` becomes a real HTTP 308. Verified by `curl -I`
// returning `308 Permanent Redirect` with `location: /menu` post-fix.

import { permanentRedirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BrandsIndexRedirect() {
  permanentRedirect("/menu");
}
