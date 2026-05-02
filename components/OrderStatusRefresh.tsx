"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Quietly polls + refreshes the parent Server Component while the customer
// has an active order in flight (pending / preparing / ready). The whole point
// is so the "Ready for pickup" callout appears live instead of forcing a
// manual reload during the most anxious part of a pickup wait.
//
// Two refresh triggers:
//   1. visibilitychange — switching back to the tab/PWA from the lock screen
//      always refreshes immediately (people check obsessively while waiting).
//   2. setInterval — every POLL_MS as long as the tab is visible. Pauses while
//      the tab is hidden so we're not draining battery in the background; the
//      visibility handler picks back up on return.
//
// Mount this only when there's actually something to wait on — passing
// active={false} renders nothing and registers no listeners, so it's free
// on past-orders-only views.

const POLL_MS = 45_000;

export function OrderStatusRefresh({ active }: { active: boolean }) {
  const router = useRouter();

  useEffect(() => {
    if (!active) return;

    let intervalId: ReturnType<typeof setInterval> | null = null;

    function startPolling() {
      if (intervalId) return;
      intervalId = setInterval(() => router.refresh(), POLL_MS);
    }

    function stopPolling() {
      if (!intervalId) return;
      clearInterval(intervalId);
      intervalId = null;
    }

    function onVisibility() {
      if (document.visibilityState === "visible") {
        router.refresh();
        startPolling();
      } else {
        stopPolling();
      }
    }

    document.addEventListener("visibilitychange", onVisibility);
    if (document.visibilityState === "visible") startPolling();

    return () => {
      document.removeEventListener("visibilitychange", onVisibility);
      stopPolling();
    };
  }, [active, router]);

  return null;
}
