import type { ReactNode } from "react";
import type { BrandPalette } from "./types";

// Light-on-white narrative section. Doubles as the "How They Grow It" /
// "Inside the Op" / etc. mid-page section by changing the eyebrow + headline
// — the audit found 10 of 16 pages have an additional structural section
// between Story and Sub-Brands and they're all the same shell.
//
// `children` is the body — typically 2-4 paragraphs in `<p>` tags. The
// shell handles the `space-y-5 text-slate-700 text-lg leading-relaxed`
// scaffolding that every brand page repeats verbatim.
export function BrandStory({
  palette,
  eyebrow,
  headline,
  children,
}: {
  palette: BrandPalette;
  eyebrow: string;
  headline: string;
  children: ReactNode;
}) {
  return (
    <section className="bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-14">
        <p
          className="text-[11px] font-bold uppercase tracking-[0.2em] mb-3"
          style={{ color: palette.dark }}
        >
          {eyebrow}
        </p>
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mb-8 leading-tight">
          {headline}
        </h2>
        <div className="space-y-5 text-slate-700 text-lg leading-relaxed">{children}</div>
      </div>
    </section>
  );
}
