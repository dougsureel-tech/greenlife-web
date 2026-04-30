"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { STORE } from "@/lib/store";

const NAV = [
  { href: "/", label: "Home" },
  { href: "/menu", label: "Menu" },
  { href: "/brands", label: "Brands" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-stone-200 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Logo / Brand */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setOpen(false)}>
          <div className="w-8 h-8 rounded-full bg-green-700 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
            </svg>
          </div>
          <span className="font-bold text-green-900 text-lg leading-tight">
            Green Life <span className="font-normal text-green-700">Cannabis</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-green-100 text-green-800"
                  : "text-stone-600 hover:text-green-800 hover:bg-green-50"
              }`}
            >
              {label}
            </Link>
          ))}
          <a
            href={STORE.googleMapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2 px-3 py-1.5 rounded-lg text-sm font-medium text-stone-500 hover:text-green-800 hover:bg-green-50 transition-colors"
          >
            {STORE.address.city}, WA
          </a>
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-3">
          <a href={`tel:${STORE.phoneTel}`} className="text-sm text-stone-500 hover:text-green-700 transition-colors">
            {STORE.phone}
          </a>
          <Link
            href="/menu"
            className="px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
          >
            Shop Menu
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-2 rounded-lg text-stone-600 hover:bg-stone-100 transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="md:hidden border-t border-stone-200 bg-white px-4 py-3 space-y-1">
          {NAV.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === href || (href !== "/" && pathname.startsWith(href))
                  ? "bg-green-100 text-green-800"
                  : "text-stone-600 hover:bg-green-50 hover:text-green-800"
              }`}
            >
              {label}
            </Link>
          ))}
          <div className="pt-2 border-t border-stone-100 mt-2 flex flex-col gap-2">
            <a href={`tel:${STORE.phoneTel}`} className="block px-3 py-2 text-sm text-stone-500">{STORE.phone}</a>
            <Link
              href="/menu"
              onClick={() => setOpen(false)}
              className="block text-center px-4 py-2 rounded-xl bg-green-700 text-white text-sm font-semibold"
            >
              Shop Menu
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
