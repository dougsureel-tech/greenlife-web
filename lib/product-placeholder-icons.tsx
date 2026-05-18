// Line-art SVG category icons for the product-placeholder card surface.
// Replaces the emoji glyph map in `product-placeholder.ts` consumed by the
// `<ProductImage>` no-photo branch (OrderMenu.tsx).
//
// Why a parallel file (vs. extending product-placeholder.ts):
//   1. JSX-bearing module needs a .tsx extension; product-placeholder.ts
//      already has other (non-JSX) string consumers across the codebase
//      (brand-page grid, future strain related-products card) that import
//      the `PRODUCT_CATEGORY_ICONS` emoji map — leaving that map intact
//      avoids a ripple refactor.
//   2. SSoT for the icon system stays HERE; if a future surface wants the
//      line-art treatment, it imports `getCategoryIcon` from this file.
//
// Design principles:
//   - viewBox 0 0 24 24 (Lucide-style canvas)
//   - stroke="currentColor" so the consumer sets color via `text-*`
//   - strokeWidth=1.5, strokeLinecap/Join=round (line-art convention)
//   - fill="none" except for tiny decorative dots
//   - aria-hidden + role="img" left to the consumer's wrapping span
//
// 2026-05-18 (v37.505): cycle 3 of /menu-preview iteration per Doug
// directive. Cycle-2 expert review flagged emoji as the "single largest
// feels-amateur tell" remaining on the card. Sister scc mirror file.

import type { ComponentType, SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;
type IconComponent = ComponentType<IconProps>;

const baseProps: IconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

// Cannabis leaf (7-point simplified) — Flower / strain-bucket-agnostic
function FlowerIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M12 22V12" />
      <path d="M12 12c-3-1-5-4-5-9" />
      <path d="M12 12c3-1 5-4 5-9" />
      <path d="M12 12C7.5 12 4 10 2 6" />
      <path d="M12 12c4.5 0 8-2 10-6" />
      <path d="M12 12c-3 1-5.5 4-6 9" />
      <path d="M12 12c3 1 5.5 4 6 9" />
    </svg>
  );
}

// Joint / pre-roll — long cylinder with ember + smoke wisps
function PreRollIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="10" width="16" height="4" rx="2" />
      <path d="M19 10c1 0 2 1 2 2s-1 2-2 2" />
      <line x1="14" y1="10" x2="14" y2="14" />
      <path d="M3 8c-1-1-1-2 0-3" />
      <path d="M7 7c-1-1-1-2 0-3" />
    </svg>
  );
}

// Vape pen / cartridge — mouthpiece + body + base button
function VapeIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="9" y="2" width="6" height="3" rx="1" />
      <rect x="7" y="5" width="10" height="15" rx="2" />
      <line x1="7" y1="9" x2="17" y2="9" />
      <circle cx="12" cy="14" r="1" />
      <path d="M12 22h0" />
    </svg>
  );
}

// Concentrate — diamond / faceted shape
function ConcentrateIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M6 3h12l3 5-9 13L3 8z" />
      <path d="M8 8h8" />
      <path d="M12 8v13" />
      <path d="M9 3l3 5" />
      <path d="M15 3l-3 5" />
    </svg>
  );
}

// Gummy / edible — rounded square with sugar specks
function EdibleIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="4" y="4" width="16" height="16" rx="4" />
      <circle cx="9" cy="10" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="15" cy="14" r="0.8" fill="currentColor" stroke="none" />
      <circle cx="14" cy="9" r="0.5" fill="currentColor" stroke="none" />
      <circle cx="10" cy="15" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Beverage — bottle with shoulder + cap
function BeverageIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M10 2h4v2.5l-0.5 1V8h1l1.5 3v9a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-9L9.5 8h1V5.5L10 4.5z" />
      <line x1="8" y1="14" x2="16" y2="14" />
    </svg>
  );
}

// Capsule — pill with center seam
function CapsuleIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="3" y="8" width="18" height="8" rx="4" />
      <line x1="12" y1="8" x2="12" y2="16" />
    </svg>
  );
}

// Tincture — dropper bottle
function TinctureIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="8" y="7" width="8" height="14" rx="1.5" />
      <rect x="9.5" y="3" width="5" height="4" rx="0.5" />
      <line x1="12" y1="10" x2="12" y2="14" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

// Topical — squeeze tube
function TopicalIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <rect x="6" y="3" width="12" height="13" rx="1.5" />
      <path d="M9 16l3 5 3-5" />
      <line x1="9" y1="7" x2="15" y2="7" />
      <line x1="9" y1="11" x2="13" y2="11" />
    </svg>
  );
}

// Accessory — shopping bag with handles
function AccessoryIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <path d="M5 8h14l-1.5 13H6.5z" />
      <path d="M8 8V6a4 4 0 0 1 8 0v2" />
    </svg>
  );
}

// Default fallback — a soft circle-with-leaf glyph so unknown categories
// still get a deliberate mark rather than a missing element.
function DefaultIcon(props: IconProps) {
  return (
    <svg {...baseProps} {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v10" />
      <path d="M9 11l3-3 3 3" />
    </svg>
  );
}

const CATEGORY_ICON_MAP: Record<string, IconComponent> = {
  Flower: FlowerIcon,
  "Pre-Roll": PreRollIcon,
  "Pre-Rolls": PreRollIcon,
  Vape: VapeIcon,
  Vapes: VapeIcon,
  Cartridge: VapeIcon,
  Cartridges: VapeIcon,
  Disposable: VapeIcon,
  Disposables: VapeIcon,
  Pod: VapeIcon,
  Pods: VapeIcon,
  Concentrate: ConcentrateIcon,
  Concentrates: ConcentrateIcon,
  Edible: EdibleIcon,
  Edibles: EdibleIcon,
  Beverage: BeverageIcon,
  Beverages: BeverageIcon,
  Capsule: CapsuleIcon,
  Capsules: CapsuleIcon,
  Tincture: TinctureIcon,
  Tinctures: TinctureIcon,
  Topical: TopicalIcon,
  Topicals: TopicalIcon,
  Accessory: AccessoryIcon,
  Accessories: AccessoryIcon,
};

/**
 * Pick a line-art SVG component for a product category. Falls back to a
 * generic glyph for unknown categories so the placeholder still gets a
 * deliberate mark rather than a missing element.
 */
export function getCategoryIcon(category: string | null | undefined): IconComponent {
  if (!category) return DefaultIcon;
  return CATEGORY_ICON_MAP[category] ?? DefaultIcon;
}
