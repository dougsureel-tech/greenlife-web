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
      {/* Page header */}
      <div className="bg-green-950 text-white py-14">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Reach Out</p>
          <h1 className="text-4xl font-extrabold tracking-tight">Contact Us</h1>
          <p className="text-green-300/70 mt-2">We&apos;d love to hear from you</p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact details */}
        <div className="space-y-8">
          <div className="space-y-3">
            <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Get in Touch</h2>
            <div className="space-y-3">
              {[
                {
                  href: `tel:${STORE.phoneTel}`,
                  label: "Phone",
                  value: STORE.phone,
                  icon: (
                    <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  ),
                },
                {
                  href: `mailto:${STORE.email}`,
                  label: "Email",
                  value: STORE.email,
                  icon: (
                    <svg className="w-5 h-5 text-green-700" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  ),
                },
                {
                  href: STORE.googleMapsUrl,
                  label: "Address",
                  value: STORE.address.full,
                  target: "_blank",
                  icon: (
                    <svg className="w-5 h-5 text-green-700" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                    </svg>
                  ),
                },
              ].map(({ href, label, value, icon, target }) => (
                <a key={label} href={href} target={target} rel={target ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-4 p-4 rounded-2xl border border-stone-100 bg-white hover:border-green-300 hover:shadow-sm transition-all group">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                    {icon}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs text-stone-400 font-bold uppercase tracking-widest mb-0.5">{label}</div>
                    <div className="font-semibold text-stone-800 group-hover:text-green-700 transition-colors text-sm truncate">{value}</div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Social */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-800 text-sm">Follow Us</h3>
            <div className="flex gap-3">
              {STORE.social.instagram && (
                <a href={STORE.social.instagram} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-pink-300 hover:bg-pink-50 text-sm font-semibold text-stone-600 hover:text-pink-700 transition-all">
                  Instagram ↗
                </a>
              )}
              {STORE.social.facebook && (
                <a href={STORE.social.facebook} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 hover:border-blue-300 hover:bg-blue-50 text-sm font-semibold text-stone-600 hover:text-blue-700 transition-all">
                  Facebook ↗
                </a>
              )}
            </div>
          </div>

          {/* Hours */}
          <div className="space-y-3">
            <h3 className="font-bold text-stone-800 text-sm">Store Hours</h3>
            <div className="rounded-2xl border border-stone-100 overflow-hidden divide-y divide-stone-50">
              {STORE.hours.map((h) => {
                const isToday = h.day === new Date().toLocaleDateString("en-US", { weekday: "long", timeZone: "America/Los_Angeles" });
                return (
                  <div key={h.day} className={`flex justify-between px-4 py-2.5 text-sm ${isToday ? "bg-green-50" : "bg-white"}`}>
                    <span className={`font-medium ${isToday ? "text-green-800" : "text-stone-600"}`}>
                      {h.day}{isToday && <span className="ml-2 text-xs bg-green-200 text-green-800 px-1.5 py-0.5 rounded-full font-medium">Today</span>}
                    </span>
                    <span className={`tabular-nums ${isToday ? "text-green-700 font-bold" : "text-stone-400"}`}>{h.open} – {h.close}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="space-y-4">
          <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">Find Us</h2>
          <div className="rounded-2xl overflow-hidden border border-stone-100 shadow-sm aspect-square">
            <iframe
              title="Green Life Cannabis map"
              src={`https://maps.google.com/maps?q=${encodeURIComponent(STORE.address.full)}&output=embed`}
              width="100%" height="100%"
              style={{ border: 0 }}
              allowFullScreen loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p className="text-xs text-stone-400 text-center">Cash only · ATM available on-site · Valid ID required</p>
        </div>
      </div>
    </>
  );
}
