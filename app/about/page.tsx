import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

export const metadata: Metadata = {
  title: "About Us",
  description: `Learn about ${STORE.name} — Wenatchee's locally owned cannabis dispensary serving the valley with expert staff and carefully curated products since day one.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <div className="bg-green-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold">About Green Life</h1>
          <p className="text-green-300/80 mt-1 text-sm">Wenatchee&apos;s locally owned cannabis dispensary</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 space-y-12">
        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">Who We Are</h2>
          <p className="text-stone-600 leading-relaxed">
            Green Life Cannabis is a locally owned and operated dispensary in the heart of Wenatchee, Washington.
            We believe that cannabis should be approachable, educational, and enjoyable — for everyone from first-time
            customers to seasoned enthusiasts.
          </p>
          <p className="text-stone-600 leading-relaxed">
            Our team of knowledgeable budtenders takes the time to understand what you&apos;re looking for and guide you
            toward the right product. Whether you&apos;re seeking relief, relaxation, creativity, or just exploring,
            we&apos;re here to help.
          </p>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { stat: "21+", label: "Age requirement", note: "Valid government ID required" },
            { stat: "Cash", label: "Payment only", note: "ATM available on-site" },
            { stat: "WA", label: "Licensed retailer", note: "State licensed cannabis store" },
          ].map(({ stat, label, note }) => (
            <div key={label} className="rounded-xl border border-stone-200 bg-white p-5 text-center space-y-1">
              <div className="text-3xl font-bold text-green-700">{stat}</div>
              <div className="font-semibold text-stone-800 text-sm">{label}</div>
              <div className="text-xs text-stone-400">{note}</div>
            </div>
          ))}
        </section>

        <section className="space-y-4">
          <h2 className="text-2xl font-bold text-stone-900">Visit Us</h2>
          <div className="rounded-xl border border-stone-200 bg-white p-6 space-y-3">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-green-600 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              <div>
                <div className="font-medium text-stone-800">{STORE.address.street}</div>
                <div className="text-stone-500 text-sm">{STORE.address.city}, {STORE.address.state} {STORE.address.zip}</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <svg className="w-5 h-5 text-green-600 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <a href={`tel:${STORE.phoneTel}`} className="text-green-700 hover:underline font-medium">{STORE.phone}</a>
            </div>
          </div>
          <div className="flex gap-3">
            <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-medium transition-colors">
              Get Directions ↗
            </a>
            <Link href="/contact" className="px-4 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 text-sm font-medium text-stone-700 hover:text-green-700 transition-colors">
              Contact Us
            </Link>
          </div>
        </section>
      </div>
    </>
  );
}
