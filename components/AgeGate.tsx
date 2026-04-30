"use client";

import { useEffect, useState } from "react";

const KEY = "gl_age_verified";
const TTL = 30 * 24 * 60 * 60 * 1000; // 30 days

function isVerified(): boolean {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return false;
    return Date.now() < parseInt(raw, 10);
  } catch {
    return false;
  }
}

function setVerified() {
  try {
    localStorage.setItem(KEY, String(Date.now() + TTL));
    document.cookie = `${KEY}=1; max-age=${TTL / 1000}; path=/; SameSite=Lax`;
  } catch {}
}

export function AgeGate() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (!isVerified()) setShow(true);
  }, []);

  if (!show) return null;

  function confirm() {
    setVerified();
    setShow(false);
  }

  function deny() {
    window.location.href = "https://www.responsibility.org";
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Age verification"
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #052e16 0%, #14532d 60%, #052e16 100%)" }}
    >
      <div className="max-w-sm w-full text-center space-y-8">
        {/* Logo placeholder — swap for real logo img once available */}
        <div className="flex flex-col items-center gap-3">
          <div className="w-20 h-20 rounded-full bg-green-700/40 border border-green-600/40 flex items-center justify-center">
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-green-400" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3C7.5 3 3 7.5 3 12s4.5 9 9 9 9-4.5 9-9-4.5-9-9-9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
            </svg>
          </div>
          <div>
            <p className="text-green-300 text-xs font-semibold uppercase tracking-widest">Green Life Cannabis</p>
            <h1 className="text-white text-2xl font-bold mt-1">Wenatchee, WA</h1>
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-white text-xl font-semibold">Are you 21 or older?</p>
          <p className="text-green-300/70 text-sm">You must be 21+ to enter this site.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={confirm}
            className="flex-1 py-3 px-6 rounded-xl bg-green-600 hover:bg-green-500 text-white font-semibold text-base transition-colors focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-green-950"
          >
            Yes, I&apos;m 21+
          </button>
          <button
            onClick={deny}
            className="flex-1 py-3 px-6 rounded-xl border border-green-800 hover:border-green-700 text-green-400 hover:text-green-300 font-medium text-base transition-colors focus:outline-none focus:ring-2 focus:ring-green-700"
          >
            No, exit
          </button>
        </div>

        <p className="text-green-800 text-xs">
          By entering you agree to our{" "}
          <a href="/terms" className="underline hover:text-green-600">Terms of Use</a>
          {" "}and confirm you are of legal age to purchase cannabis in Washington State.
        </p>
      </div>
    </div>
  );
}
