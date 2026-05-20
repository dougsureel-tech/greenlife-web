// canonical:ignore-file — /order is a redirect, no canonical needed (the gate's
// allow-comment per scripts/check-canonical-or-noindex.mjs).
//
// /order — post-iHJ-cutover redirect to /menu.
//
// Pre-cutover (pre v36.*, when /menu was the iHJ Boost embed) /order was
// the dev-tree alternate surface. Post-cutover /menu IS the dev-tree menu
// (OrderMenu.tsx), so /order becomes a 308 to /menu. Doug 2026-05-19
// greenlit cutover; companion ship on seattle-cannabis-web (scc has the
// same redirect since 2026-05-04 when /order moved off the customer
// nav). One canonical surface across both stores.

import { redirect } from "next/navigation";

export default function OrderPage() {
  redirect("/menu");
}
