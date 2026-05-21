"use client";

import { useEffect, useState } from "react";

// Client-side reveal sequence that runs once when the customer lands on
// /account/wrapped. Fades in eyebrow → headline → stat grid in three
// short steps so the surface lands as a deliberate moment instead of a
// flat page paint.
//
// Stateless — does NOT persist a "viewed-on" timestamp anywhere. When
// Phase 4.2 customer_wrapped_views tracking ships, a 1-line fetch() in
// the third step posts to /api/wrapped/viewed. Out of scope for the
// mock-data mode ship.
//
// Reduced-motion: respects `prefers-reduced-motion: reduce` by skipping
// the staged delay and rendering all children immediately.

type Props = {
  children: React.ReactNode;
};

export function WrappedReveal({ children }: Props) {
  const [stage, setStage] = useState<0 | 1 | 2 | 3>(0);

  useEffect(() => {
    if (typeof window === "undefined") {
      setStage(3);
      return;
    }
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reduce.matches) {
      setStage(3);
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];
    timers.push(setTimeout(() => setStage(1), 80));
    timers.push(setTimeout(() => setStage(2), 320));
    timers.push(setTimeout(() => setStage(3), 720));
    return () => {
      for (const t of timers) clearTimeout(t);
    };
  }, []);

  return (
    <div
      data-reveal-stage={stage}
      style={{
        opacity: stage === 0 ? 0 : 1,
        transform: stage === 0 ? "translateY(8px)" : "translateY(0)",
        transition: "opacity 280ms ease-out, transform 280ms ease-out",
      }}
    >
      {children}
    </div>
  );
}
