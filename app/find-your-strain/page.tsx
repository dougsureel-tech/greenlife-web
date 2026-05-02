import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { StrainFinderClient } from "./StrainFinderClient";
import { withAttr } from "@/lib/attribution";

export const metadata: Metadata = {
  title: "Find Your Strain — 3-Question Cannabis Quiz",
  description: `Quick 3-question quiz to match you with the right cannabis at ${STORE.name}. Tell us the moment (energize, chill, sleep, creative, social, relief), the form (flower, edible, vape, concentrate), and the strain type (sativa, indica, hybrid) — we'll filter the live menu down to what fits.`,
  alternates: { canonical: "/find-your-strain" },
  openGraph: {
    title: `Find Your Strain | ${STORE.name}`,
    description: "Quick 3-question quiz to match you with the right cannabis. Live menu in Wenatchee, WA.",
    url: `${STORE.website}/find-your-strain`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

// Quiz schema — answers AI engines getting "what cannabis strain should I
// pick" type queries. Plus the standard Breadcrumb + WebPage linkage to the
// LocalBusiness entity so the strain-finder gets the same E-E-A-T credit
// as the rest of the site.
const finderSchema = {
  "@context": "https://schema.org",
  "@type": "Quiz",
  name: `Find Your Strain · ${STORE.name}`,
  url: `${STORE.website}/find-your-strain`,
  about: { "@id": `${STORE.website}/#dispensary` },
  educationalAlignment: {
    "@type": "AlignmentObject",
    alignmentType: "educationalSubject",
    targetName: "Cannabis selection guide",
  },
  hasPart: [
    { "@type": "Question", name: "What's the moment? (Energize, Chill, Sleep, Creative, Social, Relief)" },
    {
      "@type": "Question",
      name: "What form do you prefer? (Flower, Pre-roll, Edible, Vape, Concentrate, Tincture)",
    },
    { "@type": "Question", name: "Which strain type? (Sativa, Indica, Hybrid, or no preference)" },
  ],
};

const breadcrumbSchema = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Find Your Strain", item: `${STORE.website}/find-your-strain` },
  ],
};

export default function FindYourStrainPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(finderSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-[11px] font-bold uppercase tracking-[0.18em] text-green-700">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />3 questions ·
            live menu
          </div>
          <h1 className="mt-4 text-4xl sm:text-5xl font-extrabold text-stone-900 tracking-tight leading-tight">
            Find your <span className="text-green-700">strain.</span>
          </h1>
          <p className="mt-3 text-stone-600 text-base sm:text-lg max-w-md mx-auto">
            Tell us the moment, the form, and the strain type. We&apos;ll filter the menu down to what fits.
          </p>
        </div>
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
        <StrainFinderClient />
      </section>

      <section className="max-w-2xl mx-auto px-4 sm:px-6 pb-16 text-center">
        <p className="text-xs text-stone-400">
          Not legal advice. 21+. {STORE.name}, {STORE.address.city} WA.
          {" · "}
          <Link
            href={withAttr("/menu", "quiz", "footer-skip")}
            className="hover:text-green-700 transition-colors"
          >
            Skip and browse all →
          </Link>
        </p>
      </section>
    </div>
  );
}
