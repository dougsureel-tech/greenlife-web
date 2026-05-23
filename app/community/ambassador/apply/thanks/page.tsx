import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { Breadcrumb } from "@/components/Breadcrumb";

// /community/ambassador/apply/thanks — Phase F post-submit confirmation.
// Set explicit canonical so search engines don't deep-index the thanks URL
// (and `noindex` for good measure — this is a transient post-redirect page).

export const metadata: Metadata = {
  title: { absolute: `Application received · ${STORE.name}` },
  description: "We received your ambassador application. A manager will review within 48 hours.",
  alternates: { canonical: "/community/ambassador/apply/thanks" },
  robots: { index: false, follow: false },
};

export default function ApplyThanksPage() {
  return (
    <main className="min-h-[80vh] bg-stone-50">
      <Breadcrumb
        items={[
          { label: "Community", href: "/community" },
          { label: "Ambassador Program", href: "/community/ambassador" },
          { label: "Apply", href: "/community/ambassador/apply" },
          { label: "Thanks" },
        ]}
      />
      <section className="mx-auto max-w-2xl px-6 py-16 text-center space-y-6">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-700 text-3xl">
          ✓
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
          Got it. Thanks for applying.
        </h1>
        <p className="text-stone-700 text-base leading-relaxed">
          A manager at {STORE.name} will review your application within 48 hours and reply via email
          with next steps — approval + a welcome brief, a quick clarification ask, or a polite decline.
        </p>
        <div className="rounded-2xl bg-white border border-stone-200 p-6 text-left space-y-3">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
            While you wait
          </p>
          <ul className="text-sm text-stone-700 space-y-2 list-disc list-inside">
            <li>
              Read the{" "}
              <Link href="/community/ambassador" className="text-green-700 underline">
                Ambassador Program overview
              </Link>{" "}
              and the five day-1 content briefs.
            </li>
            <li>
              Check that the email you submitted isn&apos;t blocking us — search for{" "}
              <code className="text-xs bg-stone-100 px-1.5 py-0.5 rounded">{STORE.email}</code> in
              your spam folder so our reply doesn&apos;t get lost.
            </li>
            <li>
              In the meantime, you&apos;re welcome to{" "}
              <Link href="/community/feedback" className="text-green-700 underline">
                send us any feedback
              </Link>{" "}
              about your last visit.
            </li>
          </ul>
        </div>
        <p className="pt-2">
          <Link
            href="/community"
            className="text-sm font-semibold text-green-700 hover:text-green-800"
          >
            ← Back to {STORE.name} Community
          </Link>
        </p>
      </section>
    </main>
  );
}
