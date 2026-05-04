import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

// Confirmation page after a successful /apply submit. Stays warm + plain
// language. Sets noindex to keep this URL out of search results — the page
// is meaningless without the upstream form context.

export const metadata: Metadata = {
  title: "Application received",
  description: "Thanks for applying to work with Green Life Cannabis.",
  alternates: { canonical: "/apply/thanks" },
  robots: { index: false, follow: false },
};

export default function ApplyThanksPage() {
  return (
    <>
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
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Careers</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Got it — thanks.</h1>
          <p className="text-green-300/80 mt-2 text-sm sm:text-base">
            Your application is in. We&apos;ll be in touch.
          </p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-10 sm:py-16">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-10">
          <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-800 mb-6">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
            </svg>
          </div>

          <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
            What happens next
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed mt-3">
            We read every application that comes in. If there&apos;s a fit, someone from our team
            will reach out within 1–2 weeks to set up a quick chat. If not, we&apos;ll keep your
            application on file in case something opens up later.
          </p>

          <p className="text-stone-600 text-sm leading-relaxed mt-4">
            You should also have a confirmation email in your inbox in the next few minutes. If
            you don&apos;t see it, check your spam folder — it sometimes lands there on first
            contact.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <Link
              href="/menu"
              className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-colors"
            >
              Browse the menu →
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center px-5 py-3 rounded-xl border border-stone-300 hover:border-green-400 text-stone-700 hover:text-green-700 text-sm font-semibold transition-colors"
            >
              Back to home
            </Link>
          </div>

          <p className="text-stone-500 text-xs leading-relaxed mt-8">
            Questions in the meantime? Email{" "}
            <a href={`mailto:${STORE.email}`} className="text-green-700 font-semibold hover:underline">
              {STORE.email}
            </a>{" "}
            or call{" "}
            <a href={`tel:${STORE.phoneTel}`} className="text-green-700 font-semibold hover:underline">
              {STORE.phone}
            </a>
            .
          </p>

          <p className="text-stone-400 text-xs leading-relaxed mt-6 italic">
            — the Green Life team
          </p>
        </div>
      </main>
    </>
  );
}
