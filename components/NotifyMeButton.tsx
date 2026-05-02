"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

// Pickup-framed sibling of PushSubscribe — same underlying flow (subscribe via
// the service worker's PushManager, POST to /api/push/subscribe so the server
// stores it tied to the signed-in clerkUserId), but worded for the order-
// pickup context where it appears: "I'll text or push you when it's ready."
//
// The actual ready-trigger is server-side: lib/portal.notifyReadyOrders runs
// from the /account/orders page render in an after() callback, fires push to
// any of this user's subscriptions tagged `order-ready-{id}`. So as long as
// the customer subscribes once on this page, every future ready-flip wakes
// them up — no need to subscribe per-order.

function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(safe);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Status = "loading" | "unsupported" | "denied" | "subscribed" | "available" | "working";

export function NotifyMeButton() {
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function check() {
      if (typeof window === "undefined") return;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (!VAPID_PUBLIC_KEY) {
        if (!cancelled) setStatus("unsupported");
        return;
      }
      if (Notification.permission === "denied") {
        if (!cancelled) setStatus("denied");
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        const existing = await reg.pushManager.getSubscription();
        if (!cancelled) setStatus(existing ? "subscribed" : "available");
      } catch {
        if (!cancelled) setStatus("available");
      }
    }
    check();
    return () => {
      cancelled = true;
    };
  }, []);

  async function subscribe() {
    setError(null);
    setStatus("working");
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setStatus(permission === "denied" ? "denied" : "available");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as BufferSource,
      });
      const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
      const res = await fetch("/api/push/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json),
      });
      if (!res.ok) throw new Error("Server rejected subscription");
      setStatus("subscribed");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not enable notifications");
      setStatus("available");
    }
  }

  if (status === "loading") return null;
  if (status === "unsupported") {
    // Subtle hint for iPhone — the only real way to get push is via the
    // installed PWA. Skipping for non-iOS unsupported (rare).
    return (
      <p className="text-xs text-stone-400">
        Tip: add this site to your iPhone home screen first to enable order notifications.
      </p>
    );
  }
  if (status === "denied") {
    return (
      <p className="text-xs text-stone-500">
        Notifications are blocked in your browser. Enable them in settings to get pickup alerts.
      </p>
    );
  }
  if (status === "subscribed") {
    return (
      <p className="text-xs text-emerald-700 font-semibold inline-flex items-center gap-1">
        <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
            clipRule="evenodd"
          />
        </svg>
        We&apos;ll notify you when your order is ready
      </p>
    );
  }

  const working = status === "working";
  return (
    <div className="space-y-1">
      <button
        type="button"
        onClick={subscribe}
        disabled={working}
        className="inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl border border-indigo-300 bg-white text-indigo-800 hover:bg-indigo-50 transition-all disabled:opacity-50"
      >
        <span aria-hidden="true">🔔</span>
        {working ? "…" : "Notify me when it's ready"}
      </button>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
