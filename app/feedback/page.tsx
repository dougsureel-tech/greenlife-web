import type { Metadata } from "next";
import { STORE } from "@/lib/store";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FeedbackForm } from "@/components/FeedbackForm";

// Customer Engagement Layer Ship 4 — public-site `/feedback` intake page.
//
// Sister page lives on seattle-cannabis-web. The form POSTs to the
// store-specific inv-App base; per-site `store` discriminator is pinned
// here so the API row carries the right routing key.
//
// `/feedback` is a write surface — no SEO value, intentionally noindex.
// A search-result landing on it would be friction (customer expected
// reviews / store info, got an empty form). We surface the entry point
// via the footer link, not via search. `robots` metadata blocks the page
// from crawls; the form is dynamic by nature so no caching tuning needed.

export const metadata: Metadata = {
  title: "Feedback",
  description:
    "Tell us how we're doing — suggestion, complaint, accessibility, compliance, or compliment. We read every one.",
  alternates: { canonical: "/feedback" },
  robots: { index: false, follow: false },
};

const INV_APP_BASE = "https://brapp.greenlifecannabis.com";

export default function FeedbackPage() {
  return (
    <>
      <Breadcrumb items={[{ label: "Feedback" }]} />

      {/* Page header — same dark-band shape as /contact so the page
          reads as part of the "reach us" cluster, not a marketing
          surface. Brand voice: warm, direct, neighborhood. */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10 sm:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
            Reach Out
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Tell us how we&apos;re doing.
          </h1>
          <p className="text-green-300/80 mt-3 text-sm sm:text-base max-w-2xl">
            Got a suggestion, a complaint, or something we should know? We read every one.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <FeedbackForm apiBase={INV_APP_BASE} store="wen" />

        <p className="mt-8 text-xs text-stone-500 leading-relaxed border-t border-stone-100 pt-6">
          Compliance and accessibility submissions get an immediate response.
          Everything else we read within a few days. Prefer to call?{" "}
          <a href={`tel:${STORE.phoneTel}`} className="text-green-700 underline-offset-4 hover:underline">
            {STORE.phone}
          </a>
          .
        </p>
      </div>
    </>
  );
}
