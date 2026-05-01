"use client";

import { useEffect } from "react";

// Registers /sw.js on first mount. Intentionally silent on failure — a missing
// service worker shouldn't break the page; it just means push won't work for
// this user. The push subscribe button checks for SW support separately.
export function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!("serviceWorker" in navigator)) return;

    // Defer to idle so we don't fight first paint.
    const register = () => {
      navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {});
    };

    if ("requestIdleCallback" in window) {
      (window as Window & { requestIdleCallback: (cb: () => void) => number }).requestIdleCallback(register);
    } else {
      setTimeout(register, 1500);
    }
  }, []);

  return null;
}
