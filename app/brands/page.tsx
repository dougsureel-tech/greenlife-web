// Per Doug + Kat 2026-05-04: the public-facing brands index was deleted
// because (a) it exposed our full vendor relationship list and (b) it made
// daily-deal vendor concentration glanceable to anyone. The dialed-in
// per-brand override pages at /brands/[slug] are kept — those pull SEO
// traffic for "Phat Panda Wenatchee" / "Avitas WA" etc. queries and pay
// for themselves on direct link-sharing + deal-card click-throughs.
// Inbound traffic to /brands gets 308'd to /menu so any external links
// or bookmarks land on something useful.

import { redirect } from "next/navigation";

export default function BrandsIndexRedirect() {
  redirect("/menu");
}
