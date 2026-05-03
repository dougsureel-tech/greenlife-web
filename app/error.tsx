"use client";

import Link from "next/link";

// Per docs/brand-voice.md "What we never do" → don't apologize for things
// that aren't our fault. Direct + actionable beats hedging tone. Two
// recovery paths: retry, or go to a known-good page.

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-5 py-16">
      <div className="w-14 h-14 rounded-2xl bg-amber-50 border-2 border-amber-200 flex items-center justify-center">
        <svg viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2" className="w-7 h-7" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
        </svg>
      </div>
      <div className="space-y-1.5">
        <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
          That didn&apos;t load.
        </h2>
        <p className="text-stone-600 text-sm max-w-xs leading-relaxed">
          Try once more — usually a connection blip. If it sticks, the menu is the safest landing.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-colors"
        >
          Try again
        </button>
        <Link
          href="/menu"
          className="px-5 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 text-stone-700 hover:text-green-700 text-sm font-semibold transition-colors"
        >
          Go to menu
        </Link>
      </div>
    </div>
  );
}
