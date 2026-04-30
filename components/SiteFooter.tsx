import Link from "next/link";
import { STORE } from "@/lib/store";

export function SiteFooter() {
  return (
    <footer className="bg-green-950 text-green-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        {/* Brand */}
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h2 className="text-white font-bold text-lg">{STORE.name}</h2>
            <p className="text-green-400 text-sm mt-0.5">{STORE.tagline}</p>
          </div>
          <address className="not-italic text-sm text-green-300 space-y-1">
            <p>{STORE.address.street}</p>
            <p>{STORE.address.city}, {STORE.address.state} {STORE.address.zip}</p>
            <a href={`tel:${STORE.phoneTel}`} className="block hover:text-white transition-colors">{STORE.phone}</a>
            <a href={`mailto:${STORE.email}`} className="block hover:text-white transition-colors">{STORE.email}</a>
          </address>
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm text-green-400 hover:text-white transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </svg>
            Get Directions
          </a>
        </div>

        {/* Hours */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Hours</h3>
          <ul className="space-y-1">
            {STORE.hours.map((h) => (
              <li key={h.day} className="flex justify-between text-sm gap-4">
                <span className="text-green-400">{h.day.slice(0, 3)}</span>
                <span className="text-green-200">{h.open} – {h.close}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Links */}
        <div className="space-y-3">
          <h3 className="text-white font-semibold text-sm uppercase tracking-wider">Explore</h3>
          <ul className="space-y-2 text-sm">
            {[
              { href: "/menu", label: "Shop Menu" },
              { href: "/brands", label: "Our Brands" },
              { href: "/faq", label: "FAQ" },
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-green-300 hover:text-white transition-colors">{label}</Link>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 pt-2">
            {STORE.social.instagram && (
              <a href={STORE.social.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram"
                className="text-green-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
            )}
            {STORE.social.facebook && (
              <a href={STORE.social.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook"
                className="text-green-500 hover:text-white transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-green-900 py-4 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-700">
          <p>© {new Date().getFullYear()} {STORE.name}. All rights reserved. Must be 21+ to purchase.</p>
          <p>Licensed Washington State Cannabis Retailer</p>
        </div>
      </div>
    </footer>
  );
}
