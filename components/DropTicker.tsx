"use client";

import { useEffect, useState } from "react";

type Drop = { name: string; brand: string | null; category: string | null };

// Animated "Just dropped" strip that cycles through the newest products.
// Sits above (or inside) the hero — adds a sense of liveness without taking
// up much space. Renders a fixed-height container so it never shifts layout.
// Server passes drops in pre-loaded; this component just rotates through.
export function DropTicker({ drops }: { drops: Drop[] }) {
  const [i, setI] = useState(0);

  useEffect(() => {
    if (drops.length <= 1) return;
    const t = setInterval(() => setI((x) => (x + 1) % drops.length), 3500);
    return () => clearInterval(t);
  }, [drops.length]);

  if (drops.length === 0) return null;
  const cur = drops[i];
  const cat = cur.category ?? "New";
  const display = cur.brand ? `${cur.brand} — ${cur.name}` : cur.name;

  return (
    <div
      className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full text-xs font-medium bg-green-400/10 border border-green-400/25 text-green-300 max-w-full"
      aria-live="polite"
    >
      <span className="text-sm leading-none" aria-hidden>
        🔥
      </span>
      <span className="font-bold text-green-300/90 shrink-0">Just dropped</span>
      <span className="opacity-50 shrink-0">·</span>
      <span className="opacity-90 truncate transition-opacity duration-200" key={i}>
        {display} <span className="opacity-50 text-[11px]">{cat}</span>
      </span>
    </div>
  );
}
