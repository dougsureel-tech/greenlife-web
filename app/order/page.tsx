import { redirect } from "next/navigation";

// Customer ordering happens on iHeartJane while we run on Dutchie POS.
// When the in-house checkout is ready (post-POS migration), revert this file
// from git history and the matching redirect at /menu/page.tsx.
const IHEARTJANE_URL = "https://www.iheartjane.com/stores/5294/green-life-cannabis";

export const dynamic = "force-static";

export default function OrderPage() {
  redirect(IHEARTJANE_URL);
}
