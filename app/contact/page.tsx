import type { Metadata } from "next";
import { STORE } from "@/lib/store";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${STORE.name} in Wenatchee, WA. Call ${STORE.phone} or visit us at ${STORE.address.full}.`,
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <div className="bg-green-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold">Contact Us</h1>
          <p className="text-green-300/80 mt-1 text-sm">We&apos;d love to hear from you</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Info */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-stone-900">Get in Touch</h2>
            <div className="space-y-3">
              <a href={`tel:${STORE.phoneTel}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-green-300 bg-white hover:bg-green-50 transition-all group">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">Phone</div>
                  <div className="font-semibold text-stone-800 group-hover:text-green-700 transition-colors">{STORE.phone}</div>
                </div>
              </a>

              <a href={`mailto:${STORE.email}`}
                className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-green-300 bg-white hover:bg-green-50 transition-all group">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">Email</div>
                  <div className="font-semibold text-stone-800 group-hover:text-green-700 transition-colors">{STORE.email}</div>
                </div>
              </a>

              <a href={STORE.googleMapsUrl} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-stone-200 hover:border-green-300 bg-white hover:bg-green-50 transition-all group">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                  </svg>
                </div>
                <div>
                  <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">Address</div>
                  <div className="font-semibold text-stone-800 group-hover:text-green-700 transition-colors">{STORE.address.full}</div>
                </div>
              </a>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-stone-800">Hours</h3>
            <div className="divide-y divide-stone-100 rounded-xl border border-stone-200 overflow-hidden">
              {STORE.hours.map((h) => (
                <div key={h.day} className="flex justify-between px-4 py-2.5 text-sm bg-white">
                  <span className="text-stone-600">{h.day}</span>
                  <span className="tabular-nums text-stone-800">{h.open} – {h.close}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-stone-900">Find Us</h2>
          <div className="rounded-2xl overflow-hidden border border-stone-200 shadow-sm aspect-square">
            <iframe
              title="Green Life Cannabis map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(STORE.address.full)}&output=embed`}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-xs text-stone-400 text-center">
            Cash only · ATM available on-site · Valid ID required
          </p>
        </div>
      </div>
    </>
  );
}
