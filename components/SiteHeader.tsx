"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { STORE } from "@/lib/store";
import { StashHeaderLink } from "./StashHeaderLink";

const NAV = [
  { href: "/menu",             label: "Menu" },
  { href: "/deals",            label: "Deals" },
  { href: "/find-your-strain", label: "Find Strain" },
  { href: "/order",            label: "Order" },
  { href: "/brands",           label: "Brands" },
  { href: "/blog",             label: "Guides" },
  { href: "/faq",              label: "FAQ" },
  { href: "/about",            label: "About" },
];

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const isHome = pathname === "/";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    handler();
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close drawer on navigation. Genuine side-effect — state can't be derived from props alone.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setOpen(false); }, [pathname]);

  const dark = isHome && !scrolled;

  return (
    <>
      <header className={`sticky top-0 z-50 transition-all duration-300 ${
        dark
          ? "bg-green-950/85 backdrop-blur-md border-b border-green-900/50"
          : "bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-sm"
      }`}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 ${dark ? "bg-white/15" : "bg-green-700"}`}>
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5 text-white" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
              </svg>
            </div>
            <span className={`font-bold text-lg leading-tight transition-colors duration-300 ${dark ? "text-white" : "text-green-900"}`}>
              Green Life{" "}
              <span className={`font-normal transition-colors duration-300 ${dark ? "text-green-300" : "text-green-700"}`}>Cannabis</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(({ href, label }) => {
              const active = pathname.startsWith(href);
              return (
                <Link key={href} href={href}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    dark
                      ? active ? "text-white bg-white/15" : "text-white/70 hover:text-white hover:bg-white/10"
                      : active ? "text-green-800 bg-green-50" : "text-stone-600 hover:text-green-800 hover:bg-stone-50"
                  }`}>
                  {label}
                </Link>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="hidden md:flex items-center gap-2">
            <a href={`tel:${STORE.phoneTel}`}
              className={`text-sm px-3 py-2 rounded-lg transition-all duration-200 ${
                dark ? "text-white/60 hover:text-white hover:bg-white/10" : "text-stone-500 hover:text-green-700 hover:bg-stone-50"
              }`}>
              {STORE.phone}
            </a>
            <StashHeaderLink dark={dark} />
            <Link href="/account" title="My Account"
              className={`p-2 rounded-lg transition-all duration-200 ${
                dark ? "text-white/60 hover:text-white hover:bg-white/15" : "text-stone-500 hover:text-green-700 hover:bg-stone-50"
              }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </Link>
            <Link href="/order"
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 shadow-sm ${
                dark
                  ? "bg-green-400 text-green-950 hover:bg-green-300 shadow-black/20"
                  : "bg-green-700 hover:bg-green-600 text-white"
              }`}>
              Order Now
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${dark ? "text-white/80 hover:bg-white/10" : "text-stone-600 hover:bg-stone-100"}`}
            onClick={() => setOpen(v => !v)}
            aria-label="Toggle menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              {open
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              }
            </svg>
          </button>
        </div>
      </header>

      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden transition-opacity duration-300 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
        onClick={() => setOpen(false)}
      />

      {/* Slide-over drawer */}
      <div className={`fixed top-0 right-0 bottom-0 z-50 w-72 bg-white shadow-2xl md:hidden flex flex-col transition-transform duration-300 ease-in-out ${open ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-100 bg-green-950">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-white/15 flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-white" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
              </svg>
            </div>
            <span className="text-white font-bold text-sm">Green Life Cannabis</span>
          </div>
          <button onClick={() => setOpen(false)} className="p-1.5 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label }) => {
            const active = pathname.startsWith(href);
            return (
              <Link key={href} href={href} onClick={() => setOpen(false)}
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  active ? "bg-green-50 text-green-800 font-semibold" : "text-stone-700 hover:bg-stone-50 hover:text-green-800"
                }`}>
                {label}
                {active && <span className="w-1.5 h-1.5 rounded-full bg-green-600 shrink-0" />}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pb-8 pt-3 border-t border-stone-100 space-y-2.5">
          <a href={`tel:${STORE.phoneTel}`}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-stone-500 hover:text-green-700 transition-colors">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            {STORE.phone}
          </a>
          <Link href="/stash" onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:border-rose-300 hover:text-rose-600 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
            My Stash
          </Link>
          <Link href="/account" onClick={() => setOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-stone-200 text-stone-700 text-sm font-medium hover:border-green-300 hover:text-green-800 transition-all">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            My Account
          </Link>
          <Link href="/order" onClick={() => setOpen(false)}
            className="flex items-center justify-center px-4 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-colors shadow-md">
            Order Now →
          </Link>
        </div>
      </div>
    </>
  );
}
