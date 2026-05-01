"use client";

import { useEffect, useState } from "react";
import { useStash } from "@/lib/stash";
import { recordView } from "@/lib/recently-viewed";

// Heart toggle that persists to localStorage via useStash. Renders a
// neutral heart pre-mount to avoid SSR/CSR hydration mismatch (the server
// can't know what's in localStorage).
export function StashButton({
  productId,
  size = "md",
}: {
  productId: string;
  size?: "sm" | "md";
}) {
  const stash = useStash();
  const [mounted, setMounted] = useState(false);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setMounted(true); }, []);

  const saved = mounted && stash.has(productId);
  const dim = size === "sm";

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        stash.toggle(productId);
        recordView(productId);
      }}
      aria-label={saved ? "Remove from stash" : "Save to stash"}
      aria-pressed={saved}
      title={saved ? "Saved · click to remove" : "Save to your stash"}
      className={`absolute top-2 right-2 z-10 ${dim ? "w-7 h-7" : "w-8 h-8"} rounded-full backdrop-blur-md bg-white/85 hover:bg-white shadow-sm border border-stone-200/60 hover:border-rose-200 transition-all flex items-center justify-center ${
        saved ? "text-rose-500 hover:text-rose-600" : "text-stone-400 hover:text-rose-400"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className={`${dim ? "w-3.5 h-3.5" : "w-4 h-4"} transition-transform ${saved ? "scale-110 fill-current" : "fill-none"}`}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
      </svg>
    </button>
  );
}
