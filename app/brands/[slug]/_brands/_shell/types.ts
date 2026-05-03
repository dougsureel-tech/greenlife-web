// Brand-page palette contract. Every per-brand page on `/brands/[slug]`
// passes one of these into the shell components in this folder. Keeping the
// shape narrow (5 colors, 2 optional) is the whole point — it forces visual
// cohesion across the 16 vendor pages without taking away the per-brand
// creative knobs that matter (decorative hero overlays, sub-brand cards,
// story copy, Q&A copy).
//
// Why hex strings, not Tailwind classes: Tailwind v4 JIT only generates
// arbitrary-value classes (`bg-[#0b1d3a]`) when the literal string lives
// in the source file at build time. If we pass them as props, the classes
// don't get emitted and the colors silently disappear. Inline `style` is
// the only safe path for prop-driven palette colors.
export type BrandPalette = {
  // Primary brand dark — hero bg, connect-block bg, eyebrow ink on light
  dark: string;
  // Gradient mid-stop in the hero. Falls back to `dark` if omitted.
  dark2?: string;
  // Gradient end-stop in the hero + chip-border accent on light surfaces.
  // Falls back to `accent` if omitted.
  dark3?: string;
  // Bright accent — text-on-dark, primary-CTA bg, active-state ink.
  accent: string;
  // Hover state for accent CTAs. Falls back to `accent` if omitted.
  accentMuted?: string;
};

// Convert a 0-100 alpha to the 2-char hex suffix Tailwind uses for /XX
// opacity (`#a8e0f5/55` → `#a8e0f58C`). Used to keep the hero gradient
// looking the same as the original `to-[#3a8fb7]/55` literals.
export function alphaHex(percent: number): string {
  const clamped = Math.max(0, Math.min(100, percent));
  return Math.round((clamped / 100) * 255)
    .toString(16)
    .padStart(2, "0")
    .toUpperCase();
}
