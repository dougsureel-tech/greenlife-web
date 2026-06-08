// Interim ordering surface = iHeartJane Jane Boost at /menu (until the native
// menu launches). The live Boost embed silently swallows every deep-link query
// param (?strain= ?brand= ?category= ?q= ?vibe=), so any on-site element that
// promises a SCOPED product view — deal product cards, strain "in stock" cards,
// brand filters, the vibe quiz — actually dumps the customer on the FULL
// unfiltered menu. Clicking several of these in a row feels like the site keeps
// sending you to the same wall ("loops, can't order" — SCC PM lead shift report
// + staff complaints 2026-06-08; greenlife-web is the byte-sister so it carries
// the same fix). Until the native menu (which DOES honor these params) is live,
// collapse every scoped target to a clean bare /menu: no false scoping promise,
// no /order redirect hop.
//
// REVERSIBLE BY DESIGN: flip NEXT_PUBLIC_NATIVE_MENU_LIVE=true at native-menu
// launch and every CTA restores its original scoped deep-link in one env edit —
// no code revert. Doug 2026-06-08: "this stuff will likely come back as soon as
// we launch our menu so that can be a part of our planning."
export const NATIVE_MENU_LIVE = process.env.NEXT_PUBLIC_NATIVE_MENU_LIVE === "true";

/**
 * Resolve a customer-facing menu link.
 *
 * Pass the scoped deep-link you'd WANT once the native menu honors params
 * (e.g. `/menu?strain=blue-dream`, `/order?category=flower`). Today (interim /
 * iHeartJane era) this returns bare "/menu" unless NATIVE_MENU_LIVE is on, so
 * customers always reach the one working ordering surface instead of a dead
 * scoped promise. Wrap the RESULT in withAttr() as before to keep attribution.
 */
export function menuLink(scopedTarget?: string): string {
  if (NATIVE_MENU_LIVE && scopedTarget) return scopedTarget;
  return "/menu";
}
