"use client";

// Install-app banner. Doug 2026-05-07: launch playbook step 1 — push the
// PWA install on /menu + /account so customers install the home-screen
// app instead of bouncing back through Safari every visit.
//
// Behavior:
//   - Mobile-only render (display:none above 900px). Desktop has no
//     install primitive on Safari/Chrome the way mobile does, and the
//     marketing intent is "install on your phone" anyway.
//   - Hidden when running standalone (already installed).
//   - Hidden after the user dismisses it (localStorage flag, 30-day cool
//     -down — re-shows after a month so we don't burn the channel for
//     the same customer who was thinking about it but not ready).
//   - Android Chrome / Edge: captures the `beforeinstallprompt` event
//     and fires it on tap.
//   - iOS Safari: no install prompt API exists; we render a step-by-
//     step "Tap Share → Add to Home Screen" panel instead.
//   - Other browsers: hidden (Firefox / desktop-mobile-emulators).
//
// No analytics/tracking on the dismiss event; we trust the cool-down
// to handle re-engagement organically.

import { useEffect, useState } from "react";

const DISMISSED_KEY = "gl-install-banner-dismissed-at";
const COOLDOWN_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

type Platform = "android" | "ios" | "other";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

function detectPlatform(): Platform {
  if (typeof navigator === "undefined") return "other";
  const ua = navigator.userAgent.toLowerCase();
  if (/iphone|ipad|ipod/.test(ua) && !/(crios|fxios|edgios)/.test(ua)) return "ios";
  if (/android/.test(ua)) return "android";
  return "other";
}

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  // iOS Safari pre-PWA flag.
  if ((window.navigator as Navigator & { standalone?: boolean }).standalone === true) return true;
  return false;
}

function isDismissed(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const raw = window.localStorage.getItem(DISMISSED_KEY);
    if (!raw) return false;
    const ts = Number.parseInt(raw, 10);
    if (!Number.isFinite(ts)) return false;
    return Date.now() - ts < COOLDOWN_MS;
  } catch {
    return false;
  }
}

export function InstallAppBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<Platform>("other");
  const [iosSheetOpen, setIosSheetOpen] = useState(false);
  const [installEvent, setInstallEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Standalone-mode visit = the app is launched from the home-screen icon.
    // Record once per session as proof-of-install (covers iOS where the
    // appinstalled event doesn't fire reliably + any prior install where
    // we never got an attribution call). Per-session sessionStorage sentinel
    // so a single visit produces one count even with multi-tab. Mirror of
    // scc v5.305 wiring. Doug 2026-05-07 migration funnel.
    if (isStandalone()) {
      try {
        const SENTINEL = "glw-pwa-launch-recorded";
        if (!sessionStorage.getItem(SENTINEL)) {
          sessionStorage.setItem(SENTINEL, "1");
          void fetch("/api/track-install?source=standalone_launch", {
            method: "POST",
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        /* sessionStorage blocked (private mode) — skip */
      }
      return;
    }
    if (isDismissed()) return;

    const p = detectPlatform();
    setPlatform(p);
    if (p === "other") return;

    setVisible(true);

    if (p === "android") {
      const handler = (e: Event) => {
        e.preventDefault();
        setInstallEvent(e as BeforeInstallPromptEvent);
      };
      window.addEventListener("beforeinstallprompt", handler);
      // App-installed event clears the banner immediately.
      const installed = () => setVisible(false);
      window.addEventListener("appinstalled", installed);
      return () => {
        window.removeEventListener("beforeinstallprompt", handler);
        window.removeEventListener("appinstalled", installed);
      };
    }
  }, []);

  function dismiss() {
    setVisible(false);
    setIosSheetOpen(false);
    try {
      window.localStorage.setItem(DISMISSED_KEY, String(Date.now()));
    } catch {
      // localStorage blocked / private mode — fail soft, banner shows again next load
    }
  }

  // Fire-and-forget install attribution. Mirror of scc v5.305 wiring.
  async function recordInstall(source: string) {
    try {
      await fetch(`/api/track-install?source=${encodeURIComponent(source)}`, {
        method: "POST",
        keepalive: true,
      });
    } catch {
      // Network blip / offline — don't surface, the install still worked
    }
  }

  async function install() {
    if (platform === "ios") {
      setIosSheetOpen(true);
      void recordInstall("ios_sheet_opened");
      return;
    }
    if (platform === "android" && installEvent) {
      try {
        await installEvent.prompt();
        const choice = await installEvent.userChoice;
        if (choice.outcome === "accepted") {
          setVisible(false);
          void recordInstall("android_accepted");
        }
      } catch {
        // User cancelled or browser refused — leave banner up
      }
    }
  }

  if (!visible) return null;

  return (
    <>
      {/* Banner — fixed bottom, mobile-only via media query */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 pb-[env(safe-area-inset-bottom,0)] md:hidden"
        role="region"
        aria-label="Install Green Life app"
      >
        <div className="m-3 rounded-2xl bg-green-700 text-white shadow-2xl border border-green-600 overflow-hidden">
          <div className="px-4 py-3.5 flex items-center gap-3">
            <span aria-hidden="true" className="text-2xl shrink-0">📱</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold leading-tight">Install the Green Life app</p>
              <p className="text-xs text-green-100 mt-0.5 leading-tight">
                Order faster, see your rewards, get drop notifications.
              </p>
            </div>
            <button
              onClick={install}
              disabled={platform === "android" && !installEvent}
              className="bg-white text-green-800 text-sm font-semibold px-3.5 py-2 rounded-lg shadow-sm hover:bg-green-50 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
              aria-label={platform === "ios" ? "Show install instructions" : "Install the app"}
            >
              {platform === "android" && !installEvent ? "…" : "Install"}
            </button>
            <button
              onClick={dismiss}
              className="text-green-200 hover:text-white p-1 -mr-1 rounded-md transition-colors"
              aria-label="Dismiss install banner"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* iOS install instructions sheet */}
      {iosSheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm md:hidden"
          onClick={(e) => {
            if (e.target === e.currentTarget) setIosSheetOpen(false);
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="ios-install-title"
        >
          <div className="bg-white rounded-t-3xl w-full max-w-md p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom,0))] shadow-2xl">
            <h2 id="ios-install-title" className="text-lg font-bold text-stone-900 mb-1">
              Install on iPhone
            </h2>
            <p className="text-sm text-stone-600 mb-5">Three taps. Stays on your home screen.</p>

            <ol className="space-y-3 mb-6">
              <li className="flex gap-3 items-start">
                <span className="bg-green-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">1</span>
                <p className="text-sm text-stone-800">
                  Tap the <strong>Share</strong> button{" "}
                  <span className="inline-flex items-baseline align-middle text-blue-600">
                    <svg width="16" height="20" viewBox="0 0 16 20" fill="currentColor" aria-hidden="true">
                      <path d="M8 0L4 4h3v9h2V4h3l-4-4zM2 9v9c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V9h-2v9H4V9H2z" />
                    </svg>
                  </span>{" "}
                  at the bottom of Safari.
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-green-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">2</span>
                <p className="text-sm text-stone-800">
                  Scroll down and tap <strong>Add to Home Screen</strong>.
                </p>
              </li>
              <li className="flex gap-3 items-start">
                <span className="bg-green-700 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center shrink-0">3</span>
                <p className="text-sm text-stone-800">
                  Tap <strong>Add</strong>. The Green Life icon lands on your home screen.
                </p>
              </li>
            </ol>

            <button
              onClick={() => setIosSheetOpen(false)}
              className="w-full bg-green-700 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Got it
            </button>
            <button
              onClick={dismiss}
              className="w-full text-stone-500 text-sm py-2 mt-2 hover:text-stone-700 transition-colors"
            >
              Don&apos;t show this for a month
            </button>
          </div>
        </div>
      )}
    </>
  );
}
