"use client";

import { useEffect, useState } from "react";

const KEY = "gl_age_verified";
const TTL = 30 * 24 * 60 * 60 * 1000;

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
  const [leaving, setLeaving] = useState(false);

  // localStorage isn't available during SSR, so verification status must be checked post-mount.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!isVerified()) setShow(true);
  }, []);

  if (!show) return null;

  function confirm() {
    setVerified();
    setShow(false);
  }

  function deny() {
    setLeaving(true);
    setTimeout(() => {
      window.location.href = "https://www.responsibility.org";
    }, 400);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Age verification"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center"
    >
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{ background: "linear-gradient(160deg, #052e16 0%, #14532d 50%, #052e16 100%)" }}
      >
        {/* subtle dot grid */}
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        {/* glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 50% 80%, #4ade80, transparent)" }}
        />
      </div>

      {/* Card */}
      <div
        className={`relative w-full sm:max-w-md mx-4 sm:mx-auto bg-green-950/90 backdrop-blur-sm border border-green-800/60 rounded-t-3xl sm:rounded-3xl px-8 py-10 text-center space-y-7 shadow-2xl transition-transform duration-300 ${leaving ? "translate-y-4 opacity-0" : ""}`}
      >
        {/* Logo mark */}
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-green-700/50 border border-green-600/40 flex items-center justify-center">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-9 h-9 text-green-300"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
            </svg>
          </div>
          <div>
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest">Green Life Cannabis</p>
            <p className="text-green-200/60 text-xs mt-0.5">Wenatchee, Washington</p>
          </div>
        </div>

        {/* Question */}
        <div className="space-y-2">
          <h1 className="text-white text-2xl font-extrabold tracking-tight">Are you 21 or older?</h1>
          <p className="text-green-300/60 text-sm">
            Washington State law requires you to be 21+ to purchase cannabis.
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={confirm}
            className="flex-1 py-3.5 px-6 rounded-2xl bg-green-500 hover:bg-green-400 active:bg-green-600 text-white font-bold text-base transition-all shadow-lg shadow-green-900/40 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-green-400 focus:ring-offset-2 focus:ring-offset-green-950"
          >
            Yes, I&apos;m 21+
          </button>
          <button
            onClick={deny}
            className="flex-1 py-3.5 px-6 rounded-2xl border border-green-800 hover:border-green-700 hover:bg-green-900/40 text-green-400 hover:text-green-300 font-semibold text-base transition-all focus:outline-none focus:ring-2 focus:ring-green-800"
          >
            No, exit
          </button>
        </div>

        <p className="text-green-300/60 text-xs leading-relaxed">
          By entering you confirm you are of legal age to purchase cannabis in Washington State.
        </p>
      </div>
    </div>
  );
}
