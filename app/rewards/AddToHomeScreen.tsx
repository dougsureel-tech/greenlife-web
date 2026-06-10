"use client";

import { useEffect, useState } from "react";

// Add-to-Home-Screen banner for the GLW /rewards PWA.
//
// Sister-port of seattle-cannabis-web/app/rewards/AddToHomeScreen.tsx.
// Surfaces a one-tap install path so customers get the "feels like
// an app" experience without us shipping a real native app.
//
// Three platform branches:
//   1. Already installed → render nothing.
//      Detected via `matchMedia("(display-mode: standalone)")` —
//      iOS Safari uses navigator.standalone too; we check both.
//
//   2. Android Chrome / Edge / Samsung Internet → captured the
//      `beforeinstallprompt` event; we surface our own button that
//      calls `event.prompt()`. The browser handles the rest.
//
//   3. iOS Safari → never fires beforeinstallprompt. Detect via UA
//      ("iPhone|iPad|iPod" + "Safari" + NOT "CriOS|FxiOS") and
//      show static instructions with the Share-icon glyph.
//
// Dismiss state persists in localStorage so we don't re-prompt the
// customer on every visit. Storage key versioned + glw-prefixed so it
// can't collide with the SCC banner key on a shared device.

const DISMISS_KEY = "glw_a2hs_dismissed_v1";

type PromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

function isIosSafari(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const isIosDevice = /iPhone|iPad|iPod/.test(ua);
  const isSafari = /Safari/.test(ua);
  const isEmbeddedBrowser = /CriOS|FxiOS|EdgiOS|OPiOS/.test(ua);
  return isIosDevice && isSafari && !isEmbeddedBrowser;
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia?.("(display-mode: standalone)").matches) return true;
  // iOS Safari quirk — exposes navigator.standalone separately.
  const navAny = navigator as unknown as { standalone?: boolean };
  if (navAny.standalone) return true;
  return false;
}

// Initial platform detection runs once at mount via the useState
// initializer. SSR-safe (returns null when window is undefined). iOS
// Safari is detectable synchronously; Chrome/Android requires waiting
// for the beforeinstallprompt event in the effect below.
function initialMode(): "ios" | null {
  if (typeof window === "undefined") return null;
  if (isStandalone()) return null;
  // Safari private mode + 3rd-party iframe contexts: localStorage is
  // defined but every call throws SecurityError. Sister of inv v363.005
  // (MorningBrief + ThemePicker). Treat read-fail as "not dismissed" so
  // the banner shows; user can still dismiss but it just won't persist.
  try {
    if (typeof localStorage !== "undefined" && localStorage.getItem(DISMISS_KEY)) return null;
  } catch {
    /* private mode — proceed as not-dismissed */
  }
  return isIosSafari() ? "ios" : null;
}

export function AddToHomeScreen() {
  const [mode, setMode] = useState<"chrome" | "ios" | null>(initialMode);
  const [show, setShow] = useState<boolean>(() => initialMode() === "ios");
  const [installEvent, setInstallEvent] = useState<PromptEvent | null>(null);

  useEffect(() => {
    // iOS path is fully resolved by the useState initializers — only
    // chrome-style browsers need the beforeinstallprompt listener.
    if (typeof window === "undefined") return;
    if (isStandalone()) return;
    try {
      if (typeof localStorage !== "undefined" && localStorage.getItem(DISMISS_KEY)) return;
    } catch {
      /* private mode — proceed as not-dismissed */
    }
    if (isIosSafari()) return;

    function handler(e: Event) {
      e.preventDefault();
      setInstallEvent(e as PromptEvent);
      setMode("chrome");
      setShow(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  function dismiss() {
    setShow(false);
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem(DISMISS_KEY, String(Date.now()));
      }
    } catch {
      /* private mode — banner re-shows next visit; harmless */
    }
  }

  async function install() {
    if (!installEvent) return;
    await installEvent.prompt();
    const { outcome } = await installEvent.userChoice;
    setInstallEvent(null);
    if (outcome === "accepted") {
      // Browser will handle the install + remove the prompt event.
      // Hide our banner immediately so the customer doesn't see a
      // stale state during the install animation.
      setShow(false);
    }
  }

  if (!show || !mode) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-stone-900 to-stone-800 text-white px-5 py-4 shadow-md">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="font-bold text-sm">Save this to your home screen</p>
          <p className="text-xs text-stone-300 leading-relaxed">
            One tap to your points balance. No app store, no install.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="text-stone-400 hover:text-white text-lg leading-none px-1"
        >
          ×
        </button>
      </div>

      {mode === "chrome" && (
        <button
          type="button"
          onClick={install}
          className="mt-3 w-full rounded-xl bg-white text-stone-900 font-bold py-2.5 text-sm hover:bg-stone-50 transition-all"
        >
          Add to home screen
        </button>
      )}

      {mode === "ios" && (
        <div className="mt-3 rounded-xl bg-stone-700/50 px-3 py-2.5 text-xs text-stone-200 space-y-1.5">
          <p className="flex items-center gap-2">
            <span className="font-mono text-base text-stone-50">1.</span>
            Tap the <ShareGlyph /> Share button below
          </p>
          <p className="flex items-center gap-2">
            <span className="font-mono text-base text-stone-50">2.</span>
            Scroll down + tap <strong className="text-stone-50">Add to Home Screen</strong>
          </p>
        </div>
      )}
    </div>
  );
}

function ShareGlyph() {
  return (
    <svg
      className="inline-block w-4 h-4 -mt-0.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M16 8l-4-4-4 4M12 4v12"
      />
    </svg>
  );
}
