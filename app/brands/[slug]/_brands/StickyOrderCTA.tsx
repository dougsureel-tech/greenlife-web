"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

// Brand-page sticky mini-CTA. Hidden until the visitor has scrolled past
// the hero (~600px), then slides in from the bottom-right with the
// brand's accent palette. Reverses on scroll-up so the CTA never covers
// the hero CTA on first paint. Pure CSS transition; no JS animation.
export function StickyOrderCTA({
  label,
  href = "/menu",
  bgClass = "bg-[#0e2a1f]",
  textClass = "text-[#c8b06b]",
  hoverClass = "hover:bg-[#143b2a]",
  showAfterY = 600,
}: {
  label: string;
  href?: string;
  bgClass?: string;
  textClass?: string;
  hoverClass?: string;
  showAfterY?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => setShow(window.scrollY > showAfterY);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfterY]);

  return (
    <Link
      href={href}
      aria-hidden={!show}
      tabIndex={show ? 0 : -1}
      className={`fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 px-5 py-3 rounded-full ${bgClass} ${textClass} ${hoverClass} text-sm font-bold shadow-2xl transition-all duration-300 ${
        show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
      }`}
    >
      {label}
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    </Link>
  );
}
