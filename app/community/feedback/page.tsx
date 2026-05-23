import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { safeJsonLd } from "@/lib/json-ld-safe";
import { Breadcrumb } from "@/components/Breadcrumb";
import { FeedbackFormClient } from "./FeedbackFormClient";

// /community/feedback — open-channel suggestion form per PLAN §14.3.
// Persistent, no reward, no rate-limit-by-account (per-IP only). Goes
// straight to manager; nobody else reads it. Critical for catching the
// things customers don't mention in NPS comments.

export const metadata: Metadata = {
  title: { absolute: `Suggest Something · ${STORE.name}` },
  description: `Product idea, vendor we should carry, something we got wrong — tell us. Manager reads everything. ${STORE.name}, Center Road since 2014.`,
  alternates: { canonical: "/community/feedback" },
  openGraph: {
    siteName: STORE.name,
    type: "website",
    locale: "en_US",
    title: `Suggest Something · ${STORE.name}`,
    description: `Open channel to the manager. No reward, no script — just tell us what you think.`,
    url: `${STORE.website}/community/feedback`,
    images: [
      {
        url: "/community/feedback/opengraph-image",
        width: 1200,
        height: 630,
        alt: `Suggest Something · ${STORE.name}`,
      },
    ],
  },
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "@id": `${STORE.website}/community/feedback#breadcrumb`,
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
    { "@type": "ListItem", position: 2, name: "Community", item: `${STORE.website}/community` },
    {
      "@type": "ListItem",
      position: 3,
      name: "Suggest Something",
      item: `${STORE.website}/community/feedback`,
    },
  ],
};

const webPageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  "@id": `${STORE.website}/community/feedback#webpage`,
  url: `${STORE.website}/community/feedback`,
  name: `Suggest Something · ${STORE.name}`,
  isPartOf: { "@id": `${STORE.website}/#website` },
  about: { "@type": "Organization", name: STORE.name },
};

export default function FeedbackPage() {
  return (
    <main className="min-h-[80vh] bg-stone-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageLd) }} />

      <Breadcrumb
        items={[
          { label: "Community", href: "/community" },
          { label: "Suggest Something" },
        ]}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-green-950 text-white">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, rgba(74,222,128,0.22), transparent), radial-gradient(ellipse 50% 60% at 15% 100%, rgba(251,191,36,0.12), transparent)",
          }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 py-14 sm:py-20">
          <p className="text-amber-300 text-xs font-bold uppercase tracking-[0.18em] mb-3">
            Open channel
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Tell us anything.
          </h1>
          <p className="text-emerald-100/85 mt-4 text-base sm:text-lg leading-relaxed max-w-2xl">
            Product idea. Vendor we should carry. Something we got wrong. The pickup line was too long
            on Saturday. The music. The lighting. Whatever it is — tell us. Manager reads everything;
            nobody else does.
          </p>
        </div>
      </section>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16 space-y-10">
        {/* Form */}
        <section className="rounded-2xl bg-white border border-stone-200 p-5 sm:p-7">
          <FeedbackFormClient />
        </section>

        {/* What this is / isn't */}
        <section className="rounded-2xl bg-stone-100 border border-stone-200 p-6 sm:p-7 space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-stone-700">
            What this is
          </p>
          <p className="text-stone-700 text-sm leading-relaxed">
            One-way channel to the person running the shop. Useful for: product requests, vendor
            suggestions, operational gripes, ideas you don&apos;t want to put in a Google review.
          </p>
          <p className="text-stone-700 text-sm leading-relaxed">
            <strong className="font-bold text-stone-900">If you need a reply</strong> — leave your
            email. Manager will follow up within a couple of business days. Otherwise we&apos;ll just
            read it and act on what we can.
          </p>
          <p className="text-stone-500 text-xs leading-relaxed">
            For urgent issues with an order or visit, call us at{" "}
            <a href={`tel:${STORE.phoneTel}`} className="text-green-700 font-semibold underline underline-offset-2 hover:text-green-600">
              {STORE.phone}
            </a>
            {" "}— faster than the form.
          </p>
        </section>

        <div className="text-center">
          <Link
            href="/community"
            className="text-sm font-semibold text-green-700 hover:text-green-600"
          >
            ← Back to Community
          </Link>
        </div>
      </div>
    </main>
  );
}
