"use client";

import { useEffect, useRef, useState } from "react";
import { STORE } from "@/lib/store";

declare global {
  interface Window {
    Jane?: { init: (opts: { store_id: number }) => void };
  }
}

function MenuSkeleton() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Filter bar skeleton */}
      <div className="flex gap-3 mb-8 overflow-x-auto pb-1">
        {[80, 96, 72, 88, 76, 64].map((w) => (
          <div key={w} className="h-9 rounded-xl bg-stone-200 animate-pulse shrink-0" style={{ width: `${w}px` }} />
        ))}
      </div>
      {/* Product grid skeleton */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-stone-100 bg-white overflow-hidden">
            <div className="aspect-square bg-stone-200 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
            <div className="p-3 space-y-2">
              <div className="h-3 bg-stone-200 rounded animate-pulse w-2/3" style={{ animationDelay: `${i * 60}ms` }} />
              <div className="h-4 bg-stone-200 rounded animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
              <div className="h-4 bg-stone-200 rounded animate-pulse w-3/4" style={{ animationDelay: `${i * 60}ms` }} />
              <div className="flex justify-between pt-1">
                <div className="h-4 bg-stone-200 rounded animate-pulse w-12" style={{ animationDelay: `${i * 60}ms` }} />
                <div className="h-4 bg-stone-200 rounded animate-pulse w-16" style={{ animationDelay: `${i * 60}ms` }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function JaneMenu({ storeId }: { storeId: number }) {
  const loaded = useRef(false);
  const [status, setStatus] = useState<"loading" | "loaded" | "failed">("loading");
  const frameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://iheartjane.com/scripts/sdk/embed.js";
    script.async = true;
    script.onload = () => {
      window.Jane?.init({ store_id: storeId });
    };
    script.onerror = () => setStatus("failed");
    document.head.appendChild(script);

    // Watch for Jane injecting content into the frame
    const observer = new MutationObserver(() => {
      if (frameRef.current && frameRef.current.childElementCount > 0) {
        setStatus("loaded");
        observer.disconnect();
      }
    });
    if (frameRef.current) {
      observer.observe(frameRef.current, { childList: true, subtree: true });
    }

    // Fallback after 12 seconds if nothing appears
    const timeout = setTimeout(() => {
      if (status === "loading") setStatus("failed");
      observer.disconnect();
    }, 12000);

    return () => {
      observer.disconnect();
      clearTimeout(timeout);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storeId]);

  return (
    <div className="w-full">
      {status === "loading" && <MenuSkeleton />}

      {status === "failed" && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-stone-100 flex items-center justify-center mx-auto text-3xl">📋</div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-stone-900">Menu temporarily unavailable</h2>
            <p className="text-stone-500 text-sm max-w-sm mx-auto leading-relaxed">
              Our online menu is having trouble loading. Call us for today&apos;s full selection — our budtenders are happy to help.
            </p>
          </div>
          <div className="flex justify-center gap-3 flex-wrap">
            <a href={`tel:${STORE.phoneTel}`}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-all shadow-md hover:-translate-y-0.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              Call {STORE.phone}
            </a>
            <button
              onClick={() => { setStatus("loading"); loaded.current = false; window.location.reload(); }}
              className="px-5 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 text-stone-700 hover:text-green-700 text-sm font-semibold transition-all">
              Try Again
            </button>
          </div>
        </div>
      )}

      <div
        id="jane-frame"
        ref={frameRef}
        className={status === "loaded" ? "w-full" : "hidden"}
      />
    </div>
  );
}
