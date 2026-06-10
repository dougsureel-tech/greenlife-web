"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Login step 2 — 6-digit code input. POSTs to /api/rewards/verify-code.
// On success, the server sets glw_rewards_session cookie + we route
// to /rewards/dashboard.

export function VerifyForm({ phone }: { phone: string }) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!/^\d{6}$/.test(code)) {
      setErr("Code should be 6 digits.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/rewards/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
        signal: AbortSignal.timeout(10000),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok) {
        setErr(data.error ?? "Code is invalid or expired. Try again.");
        setBusy(false);
        return;
      }
      router.push("/rewards/dashboard");
    } catch {
      setErr("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="code"
          className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2"
        >
          6-digit code
        </label>
        <input
          id="code"
          type="text"
          autoComplete="one-time-code"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          placeholder="• • • • • •"
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          disabled={busy}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-2xl tracking-[0.4em] text-center font-mono text-stone-900 placeholder:text-stone-300 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none disabled:bg-stone-100 disabled:text-stone-400"
        />
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 font-medium">
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={busy || code.length !== 6}
        className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3.5 text-base transition-all hover:-translate-y-0.5 shadow-md shadow-emerald-900/20 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {busy ? "Verifying…" : "Verify code →"}
      </button>
    </form>
  );
}
