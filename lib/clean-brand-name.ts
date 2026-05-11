// Strips trailing legal-entity suffixes from raw vendor / brand strings so
// customer-visible labels read like brands instead of corporate filings.
//
// Why: vendors.name on the staff side is the canonical legal/WSLCB-licensee
// string ("Alpha Crux, llc", "Northwest Cannabis Solutions LLC", "Bondi
// Farms Inc."). That value is correct for compliance + 1099-NEC + audit
// trail, but it leaks into customer-facing UI (homepage Top Brands carousel,
// /brands/[slug] header, brand-deal callouts) where the corporate suffix
// looks like noise. This helper is the single normalization point — apply
// it at the lib/db.ts read sites that surface vendor names to customers.
//
// Conservative by design:
//   - Only strips suffixes anchored to end-of-string. "Joe's LLC Cannabis"
//     keeps the "LLC" because it isn't trailing.
//   - Doesn't touch numeric prefixes ("1555 Industrial Labs" stays intact).
//   - Doesn't touch " - <text>" patterns. Some legit brand names use
//     dashes; only stripping the entity suffix is the safe move.
//   - Empty / whitespace-only input returns "" (caller decides fallback).

const SUFFIX_PATTERNS: RegExp[] = [
  // ", LLC" / ", llc" / " LLC" / " l.l.c." / " L.L.C" — most common.
  // Match optional comma + whitespace + LLC variants at end-of-string.
  /,?\s+l\.?\s*l\.?\s*c\.?$/i,
  // ", Inc" / ", Inc." / " Inc" / " Inc." / " Incorporated"
  /,?\s+inc(orporated)?\.?$/i,
  // " Corp" / " Corp." / " Corporation" / ", Corp"
  /,?\s+corp(oration)?\.?$/i,
  // ", Co" / ", Co." only — REQUIRE the comma. A bare " Co" suffix is
  // ambiguous because legitimate brand names end in "Co" (e.g. "Coffee
  // Co", "Trading Co") meaning Company, which is part of the brand
  // identity, not a strip-worthy entity tag. ", Co" with the comma
  // is the unambiguous corporate-filing pattern.
  /,\s+co\.?$/i,
  // " Ltd" / " Ltd." / " Limited"
  /,?\s+l(imi)?t(e)?d\.?$/i,
  // " Pllc" (Professional LLC — used by some service providers)
  /,?\s+pllc\.?$/i,
];

export function cleanBrandName(raw: string | null | undefined): string {
  if (!raw) return "";
  let s = raw.trim();
  if (!s) return "";

  // Pre-strip any trailing-comma / whitespace artifact BEFORE running the
  // suffix loop — without this, "Foo, LLC," exits the loop with LLC intact
  // because the regex needs `$` to anchor to the actual end-of-string
  // (the trailing comma blocks it). One-line normalization, mirrors the
  // same cleanup that already runs post-loop on line 65.
  s = s.replace(/[,\s]+$/, "").trim();

  // Apply entity-suffix patterns repeatedly — if a vendor wrote "Foo Inc, LLC"
  // (rare but happens) we want both stripped. Cap iterations as a safety
  // net so a malformed pattern never spins.
  for (let i = 0; i < 3; i++) {
    let changed = false;
    for (const re of SUFFIX_PATTERNS) {
      const next = s.replace(re, "").trim();
      if (next !== s) {
        s = next;
        changed = true;
      }
    }
    if (!changed) break;
  }

  // Tidy any trailing comma / whitespace that survived (e.g. "Foo,").
  s = s.replace(/[,\s]+$/, "").trim();
  return s;
}
