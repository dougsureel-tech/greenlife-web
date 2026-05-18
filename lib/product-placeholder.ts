// Shared placeholder treatment for product cards that lack `image_url`.
// Picks a Tailwind gradient class: strain-type-tinted for Flower/Pre-Rolls
// (where strain is the meaningful shelf signal), category-tinted otherwise.
// Stack-branded defaults — Wenatchee emerald accent; scc mirror uses indigo.
//
// 2026-05-18 (v37.485): stack-brand DEFAULT + Accessory/Capsule gradients
// so placeholders feel like part of the green chrome rather than dead-
// neutral stone. Hybrid stays emerald (matches glw brand). Sister scc file
// holds indigo Hybrid + DEFAULT for that stack — file-level divergence is
// intentional (per-stack brand), not a mirror drift.
//
// Tailwind classes are scanned at build via module-scope string literals —
// safe under JIT-purge.

const STRAIN_GRADIENTS: Record<string, string> = {
  Sativa: "bg-gradient-to-br from-red-100 via-orange-50 to-amber-100",
  Indica: "bg-gradient-to-br from-purple-100 via-indigo-50 to-blue-100",
  Hybrid: "bg-gradient-to-br from-emerald-100 via-green-50 to-lime-100",
  CBD: "bg-gradient-to-br from-sky-100 via-blue-50 to-cyan-100",
};

const CATEGORY_GRADIENTS: Record<string, string> = {
  Edibles: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100",
  Edible: "bg-gradient-to-br from-amber-100 via-orange-50 to-yellow-100",
  Vapes: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Cartridge: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Cartridges: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Disposable: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Disposables: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Pod: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Pods: "bg-gradient-to-br from-violet-100 via-purple-50 to-indigo-100",
  Concentrates: "bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-100",
  Concentrate: "bg-gradient-to-br from-emerald-50 via-amber-50 to-orange-100",
  Beverages: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100",
  Beverage: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100",
  Tinctures: "bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100",
  Tincture: "bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100",
  Topicals: "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
  Topical: "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
  // Capsules + Accessories — stack-tinted green. v37.505 cycle-3 polish:
  // dropped the `via-slate-50` middle stop in Capsule (had killed the
  // saturation cycle-2 was trying to deliver) so the tint actually shows.
  Capsules: "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50",
  Capsule: "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50",
  Accessories: "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50",
  Accessory: "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50",
};

// DEFAULT_GRADIENT was stone-neutral — replaced with a subtle green tint
// so the fallback-of-fallbacks still belongs to glw chrome.
const DEFAULT_GRADIENT = "bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50";

// Category emoji icons — moved here so brand-page grid + OrderMenu + future
// strain-page related-products card all read from the same source.
export const PRODUCT_CATEGORY_ICONS: Record<string, string> = {
  Flower: "🌿",
  "Pre-Rolls": "🫙",
  "Pre-Roll": "🫙",
  Vapes: "💨",
  Cartridge: "💨",
  Cartridges: "💨",
  Disposable: "💨",
  Disposables: "💨",
  Pod: "💨",
  Pods: "💨",
  Concentrates: "💎",
  Concentrate: "💎",
  Edibles: "🍬",
  Edible: "🍬",
  Beverages: "🥤",
  Beverage: "🥤",
  Capsules: "💊",
  Capsule: "💊",
  Tinctures: "💧",
  Tincture: "💧",
  Topicals: "🧴",
  Topical: "🧴",
  Accessories: "🛍️",
  Accessory: "🛍️",
};

export function getProductPlaceholderGradient(
  category: string | null | undefined,
  strainType: string | null | undefined,
): string {
  const isFlowerLike = category === "Flower" || (category?.startsWith("Pre-Roll") ?? false);
  if (isFlowerLike && strainType && STRAIN_GRADIENTS[strainType]) {
    return STRAIN_GRADIENTS[strainType];
  }
  if (category && CATEGORY_GRADIENTS[category]) {
    return CATEGORY_GRADIENTS[category];
  }
  return DEFAULT_GRADIENT;
}

export function getProductPlaceholderIcon(category: string | null | undefined): string {
  return PRODUCT_CATEGORY_ICONS[category ?? ""] ?? "🌱";
}
