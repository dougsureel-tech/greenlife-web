"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Jane?: { init: (opts: { store_id: number }) => void };
  }
}

// iHeartJane's official JS embed SDK. Loads their script, which handles
// the cross-origin iframe whitelisting that a naive `<iframe>` can't do
// (their pages set X-Frame-Options: SAMEORIGIN). Renders the live menu
// inside the #jane-frame div.
export function JaneMenu({ storeId }: { storeId: number }) {
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    const script = document.createElement("script");
    script.src = "https://iheartjane.com/scripts/sdk/embed.js";
    script.async = true;
    script.onload = () => {
      window.Jane?.init({ store_id: storeId });
    };
    document.head.appendChild(script);
  }, [storeId]);

  return (
    <div className="w-full">
      <div id="jane-frame" style={{ minHeight: "80vh" }} />
    </div>
  );
}
