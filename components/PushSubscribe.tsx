"use client";

import { useEffect, useState } from "react";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

// Browser-side base64url → Uint8Array. Push subscription needs the VAPID key
// as a Uint8Array, not the string the env var hands us.
function urlBase64ToUint8Array(base64: string): Uint8Array {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(safe);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

type Status = "loading" | "unsupported" | "denied" | "subscribed" | "available" | "working";

export function PushSubscribe({ compact = false }: { compact?: boolean } = {}) {
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
    return () => { cancelled = true; };
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

  async function unsubscribe() {
    setError(null);
    setStatus("working");
    try {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await fetch("/api/push/unsubscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ endpoint: sub.endpoint }),
        });
        await sub.unsubscribe();
      }
      setStatus("available");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not turn off notifications");
      setStatus("subscribed");
    }
  }

  if (status === "loading") return null;
  if (status === "unsupported") {
    if (compact) return null;
    return (
      <div className="text-xs text-stone-400">
        This browser doesn&apos;t support notifications.{" "}
        <span className="text-stone-500">Tip: on iPhone, add Green Life to your home screen first.</span>
      </div>
    );
  }
  if (status === "denied") {
    return (
      <div className="text-xs text-stone-500">
        Notifications are blocked. Enable them in your browser settings to get drop alerts.
      </div>
    );
  }

  const isSubscribed = status === "subscribed";
  const working = status === "working";

  return (
    <div className={compact ? "" : "rounded-2xl border border-stone-100 bg-white p-5 space-y-3"}>
      {!compact && (
        <div className="space-y-1">
          <h3 className="font-bold text-stone-900 text-sm flex items-center gap-2">
            <span className="text-base">🔔</span> Drop Alerts
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed">
            Get a notification when new product hits the shelf — no email, no SMS, no spam. One tap to turn off.
          </p>
        </div>
      )}
      <div className="flex items-center gap-3">
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={working}
          className={`text-sm font-bold px-4 py-2 rounded-xl transition-all disabled:opacity-50 ${
            isSubscribed
              ? "bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-200"
              : "bg-green-700 hover:bg-green-600 text-white shadow-md"
          }`}
        >
          {working ? "…" : isSubscribed ? "Turn off alerts" : "Get drop alerts"}
        </button>
        {isSubscribed && !compact && (
          <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            On
          </span>
        )}
      </div>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}
