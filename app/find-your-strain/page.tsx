import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { StrainFinderClient } from "./StrainFinderClient";

export const metadata: Metadata = {
  title: "Find Your Strain",
  description: `Quick 3-question quiz to match you with the right cannabis at ${STORE.name}. Tell us the moment, the form, and the strain type — we'll filter the menu for you.`,
  alternates: { canonical: "/find-your-strain" },
};

export default function FindYourStrainPage() {
  return (
    <div className="min-h-screen bg-stone-50">
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-200 text-[11px] font-bold uppercase tracking-[0.18em] text-green-700">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            3 questions · live menu
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
          <Link href="/menu" className="hover:text-green-700 transition-colors">Skip and browse all →</Link>
        </p>
      </section>
    </div>
  );
}
