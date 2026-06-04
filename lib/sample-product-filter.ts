// Employee-only "sample" products must never reach a customer-facing surface.
// Kat (SCC, 2026-06-04 reviewer-feedback 1a4546cd): anything with "Sample" in
// the name, or marked category "sample", is a staff tester — "customers cannot
// see them or know about them." Subtractive guard: it can only hide, never
// expose. Applied post-fetch on the customer product fetchers in lib/db.ts.
//
// NOTE: the LIVE customer menu is the iHeartJane Boost embed (/menu), whose
// catalog comes from the Dutchie→iHJ feed — code cannot filter a third-party
// embed, so Samples must ALSO be excluded at the Dutchie/iHJ product source.
// This guard covers the native menu path (/menu-preview, /stash, Just-In) and
// readies the iHJ→native cutover.
const SAMPLE_RE = /sample/i;

export function isEmployeeSampleProduct(
  name?: string | null,
  category?: string | null,
): boolean {
  if (name && SAMPLE_RE.test(name)) return true;
  if (category && SAMPLE_RE.test(category)) return true;
  return false;
}
