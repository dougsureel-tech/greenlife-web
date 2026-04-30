"use client";

import { useEffect, useState } from "react";

export function PushOptIn() {
  const [show, setShow] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;
    if (Notification.permission === "granted") { setSubscribed(true); return; }
    if (Notification.permission === "denied") return;
    // Show after a short delay so it doesn't feel intrusive
    const t = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(t);
  }, []);

  async function subscribe() {
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
    });
    await fetch("/api/push/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(sub.toJSON()),
    });
    setSubscribed(true);
    setShow(false);
  }

  if (!show || subscribed) return null;

  return (
    <div className="fixed bottom-20 left-0 right-0 px-4 z-30 flex justify-center">
      <div className="bg-white rounded-2xl border border-stone-200 shadow-lg p-4 max-w-sm w-full flex items-start gap-3">
        <span className="text-2xl mt-0.5">🔔</span>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-stone-800 text-sm">Get order notifications</div>
          <div className="text-xs text-stone-400 mt-0.5">We&apos;ll notify you when your order is ready for pickup.</div>
          <div className="flex gap-2 mt-2">
            <button onClick={subscribe}
              className="px-3 py-1.5 rounded-lg bg-green-700 text-white text-xs font-semibold hover:bg-green-600 transition-colors">
              Enable
            </button>
            <button onClick={() => setShow(false)}
              className="px-3 py-1.5 rounded-lg bg-stone-100 text-stone-600 text-xs font-medium hover:bg-stone-200 transition-colors">
              Not now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
