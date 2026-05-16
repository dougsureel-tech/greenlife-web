// Shared placeholder treatment for product cards that lack `image_url`.
// Picks a Tailwind gradient class: strain-type-tinted for Flower/Pre-Rolls
// (where strain is the meaningful shelf signal), category-tinted otherwise.
// Falls back to stone-neutral when neither signal is present.
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
  Concentrates: "bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100",
  Concentrate: "bg-gradient-to-br from-stone-100 via-amber-50 to-orange-100",
  Beverages: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100",
  Beverage: "bg-gradient-to-br from-cyan-100 via-sky-50 to-blue-100",
  Tinctures: "bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100",
  Tincture: "bg-gradient-to-br from-teal-100 via-cyan-50 to-sky-100",
  Topicals: "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
  Topical: "bg-gradient-to-br from-rose-100 via-pink-50 to-fuchsia-100",
  Capsules: "bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100",
  Capsule: "bg-gradient-to-br from-slate-100 via-gray-50 to-zinc-100",
  Accessories: "bg-gradient-to-br from-stone-100 via-neutral-50 to-gray-100",
  Accessory: "bg-gradient-to-br from-stone-100 via-neutral-50 to-gray-100",
};

const DEFAULT_GRADIENT = "bg-gradient-to-br from-stone-100 via-stone-50 to-stone-200";

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
