import type { ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { alphaHex, type BrandPalette } from "./types";

// Top-of-page hero used by every `/brands/[slug]` custom page. Per-brand
// callers own the palette + freeform decoration; layout, type scale, crumb,
// pill chrome, and CTA button shape are standardized here.
//
// `children` renders inside the hero's `relative overflow-hidden` container,
// behind the content layer. Use it for absolutely-positioned decorative
// overlays (dot patterns, plaid, ocean stripes — whatever the brand calls
// for). Pass `aria-hidden` divs with `absolute inset-0`.

export type BrandHeroPill =
  | { kind: "muted"; label: string; dot?: boolean }
  | { kind: "filled"; label: string }; // active count chip — uses palette.accent

export type BrandHeroCta = {
  href: string;
  label: string;
  /** "primary" → palette.accent bg, "secondary" → translucent white bg */
  variant: "primary" | "secondary";
  /** Open in new tab + add rel=noopener noreferrer */
  external?: boolean;
};

export type BrandHeroProps = {
  palette: BrandPalette;
  /** Crumb segment shown to the right of "All Brands" */
  crumb: string;
  /** Square logo URL — rendered in a white-bg rounded card. Mutually exclusive with `logoNode`. */
  logoUrl?: string;
  /** Custom logo JSX for brands without a usable remote logo. Same square footprint. */
  logoNode?: ReactNode;
  /** Alt text when `logoUrl` is provided */
  logoAlt?: string;
  /** Headline — line 1 above the tagline */
  title: string;
  /** Optional second headline line in accent color */
  tagline?: string;
  /** Lead paragraph under the headline */
  subtitle: string;
  pills: BrandHeroPill[];
  ctas: BrandHeroCta[];
  /** Decorative absolutely-positioned overlays — render inside hero container behind content */
  children?: ReactNode;
};

export function BrandHero({
  palette,
  crumb,
  logoUrl,
  logoNode,
  logoAlt,
  title,
  tagline,
  subtitle,
  pills,
  ctas,
  children,
}: BrandHeroProps) {
  const dark2 = palette.dark2 ?? palette.dark;
  const dark3 = palette.dark3 ?? palette.accent;
  // Match the original literal `bg-gradient-to-br from-[dark] via-[dark2]/90 to-[dark3]/55`
  // by composing inline gradient with hex alpha suffixes (E6 = 90%, 8C = 55%).
  const gradient = `linear-gradient(to bottom right, ${palette.dark}, ${dark2}${alphaHex(90)}, ${dark3}${alphaHex(55)})`;

  return (
    <section
      className="relative overflow-hidden text-white"
      style={{ backgroundColor: palette.dark }}
    >
      <div aria-hidden className="absolute inset-0" style={{ backgroundImage: gradient }} />
      {children}

      <div className="relative max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.2em] mb-5"
          style={{ color: palette.accent }}
        >
          <Link href="/brands" className="hover:text-white transition-colors">
            All Brands
          </Link>
          <span className="mx-2 opacity-50">/</span>
          {crumb}
        </p>

        <div className="flex flex-col md:flex-row md:items-end gap-8 md:gap-10">
          <div
            className="shrink-0 w-32 h-32 sm:w-40 sm:h-40 rounded-2xl bg-white shadow-2xl flex items-center justify-center p-5 relative ring-2"
            style={{ boxShadow: `0 0 0 2px ${palette.accent}4D` }}
          >
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={logoAlt ?? `${crumb} logo`}
                fill
                unoptimized
                priority
                sizes="(max-width: 640px) 128px, 160px"
                className="object-contain p-5"
              />
            ) : (
              logoNode
            )}
          </div>
          <div className="space-y-4 max-w-2xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.05]">
              {title}
              {tagline && (
                <>
                  <br />
                  <span style={{ color: palette.accent }}>{tagline}</span>
                </>
              )}
            </h1>
            <p className="text-lg sm:text-xl text-slate-200/90 leading-relaxed">{subtitle}</p>
            <div className="flex flex-wrap items-center gap-2.5 pt-2">
              {pills.map((pill, i) => {
                if (pill.kind === "filled") {
                  return (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: palette.accent, color: palette.dark }}
                    >
                      {pill.label}
                    </span>
                  );
                }
                return (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm text-xs font-semibold border border-white/15"
                  >
                    {pill.dot && <span style={{ color: palette.accent }}>●</span>}
                    {pill.label}
                  </span>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-3 pt-3">
              {ctas.map((cta, i) => {
                const isPrimary = cta.variant === "primary";
                const baseClass =
                  "inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm transition-all";
                const primaryClass = `${baseClass} font-bold shadow-lg hover:-translate-y-0.5`;
                const secondaryClass = `${baseClass} font-semibold bg-white/10 hover:bg-white/15 text-white border border-white/20`;
                const primaryStyle = isPrimary
                  ? { backgroundColor: palette.accent, color: palette.dark }
                  : undefined;
                if (cta.external) {
                  return (
                    <a
                      key={i}
                      href={cta.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={isPrimary ? primaryClass : secondaryClass}
                      style={primaryStyle}
                    >
                      {cta.label}
                    </a>
                  );
                }
                return (
                  <Link
                    key={i}
                    href={cta.href}
                    className={isPrimary ? primaryClass : secondaryClass}
                    style={primaryStyle}
                  >
                    {cta.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
