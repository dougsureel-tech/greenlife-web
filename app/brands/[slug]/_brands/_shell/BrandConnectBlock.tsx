import Link from "next/link";
import type { ReactNode } from "react";
import type { BrandPalette } from "./types";

// Bottom-of-page dark Connect section. Owns its own 2-column grid: the
// left column is "find them online" links + license footer, the right
// column is the in-store pickup card. The right column is merged into
// this component (vs a separate BrandPickupCard) per architect review —
// the two are always co-located and splitting them just leaks the
// 2-col layout knowledge to the per-brand caller for no reuse gain.
//
// `links` is the freeform list of contact rows (Web / Instagram / TikTok /
// Licenses / etc). Each row gets a fixed-width uppercase label column +
// the value. Value can be a plain string or an external link via { href }.

export type BrandConnectLink = {
  label: string;
  /** External link to render as `<a target="_blank">` — mutually exclusive with `text`. */
  href?: string;
  /** Display text. If `href` is set, this is the link text (defaults to href). */
  text?: string;
};

export type BrandPickupCard = {
  /** Top-line eyebrow, e.g. "Pickup at Green Life Cannabis" */
  eyebrow: string;
  /** Bold headline, e.g. "12 Seattle Bubble Works products ready in Wenatchee" */
  headline: string;
  /** Body paragraph — typically address + 21+ + cash-only line */
  body: ReactNode;
  /** Primary CTA — usually "Order for Pickup →" linking to /menu */
  primaryCta: { href: string; label: string };
  /** Secondary CTA — usually "← All Brands" linking to /brands */
  secondaryCta?: { href: string; label: string };
};

export function BrandConnectBlock({
  palette,
  brandName,
  heading = "Find them online",
  links,
  pickup,
}: {
  palette: BrandPalette;
  brandName: string;
  heading?: string;
  links: BrandConnectLink[];
  pickup: BrandPickupCard;
}) {
  return (
    <section className="text-white" style={{ backgroundColor: palette.dark }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14 grid grid-cols-1 md:grid-cols-2 gap-10">
        {/* LEFT — find them online */}
        <div>
          <p
            className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
            style={{ color: palette.accent }}
          >
            Connect with {brandName}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-6 leading-tight">
            {heading}
          </h2>
          <ul className="space-y-3 text-slate-200">
            {links.map((link, i) => (
              <li key={i} className="flex items-center gap-3">
                <span
                  className="w-20 text-xs font-bold uppercase tracking-wider"
                  style={{ color: palette.accent }}
                >
                  {link.label}
                </span>
                {link.href ? (
                  <a
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white underline underline-offset-4"
                    style={{
                      // Inline styling for the underline color so Tailwind v4
                      // doesn't need to see the arbitrary hex at build time.
                      textDecorationColor: `${palette.accent}66`,
                    }}
                  >
                    {link.text ?? link.href}
                  </a>
                ) : (
                  <span>{link.text}</span>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* RIGHT — pickup card (merged BrandPickupCard) */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <p
              className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
              style={{ color: palette.accent }}
            >
              {pickup.eyebrow}
            </p>
            <p className="text-xl font-extrabold mb-1">{pickup.headline}</p>
            <p className="text-sm text-slate-300/90 leading-relaxed">{pickup.body}</p>
          </div>
          <div className="flex flex-wrap gap-3 mt-6">
            <Link
              href={pickup.primaryCta.href}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all"
              style={{ backgroundColor: palette.accent, color: palette.dark }}
            >
              {pickup.primaryCta.label}
            </Link>
            {pickup.secondaryCta && (
              <Link
                href={pickup.secondaryCta.href}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-semibold border border-white/20 transition-all"
              >
                {pickup.secondaryCta.label}
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
