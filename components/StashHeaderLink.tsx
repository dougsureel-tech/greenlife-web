"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useStash } from "@/lib/stash";

// Heart icon + count for the site header. Pre-mount renders without count
// (no badge) to keep the SSR HTML stable.
export function StashHeaderLink({ dark }: { dark: boolean }) {
  const stash = useStash();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => {
    setMounted(true);
  }, []);

  const count = mounted ? stash.count : 0;

  return (
    <Link
      href="/stash"
      title={`Your stash${count ? ` (${count})` : ""}`}
      className={`relative p-2 rounded-lg transition-all duration-200 ${
        dark
          ? "text-white/60 hover:text-white hover:bg-white/15"
          : "text-stone-500 hover:text-rose-600 hover:bg-stone-50"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="w-5 h-5"
        fill={count > 0 ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
      {count > 0 && (
        <span
          className={`absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full text-[10px] font-bold leading-none flex items-center justify-center ${
            dark ? "bg-rose-400 text-rose-950" : "bg-rose-500 text-white"
          }`}
        >
          {count}
        </span>
      )}
    </Link>
  );
}
