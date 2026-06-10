"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Login step 1 — phone input. POSTs to /api/rewards/request-code,
// then routes to /rewards/verify with phone in the query string.
//
// The request-code endpoint always returns ok regardless of whether
// the phone is in our customers table (privacy posture per route
// header comment), so success-path ALWAYS routes to /verify. The
// verify path is where actual matching happens.

export function LoginForm() {
  const router = useRouter();
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      setErr("Enter a 10-digit phone number.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/rewards/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: digits }),
        signal: AbortSignal.timeout(10000),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; demoCode?: string };
      if (!res.ok) {
        setErr(data.error ?? "Could not send code. Please try again.");
        setBusy(false);
        return;
      }
      // demoCode is only present when SMS is unconfigured (preview/dev).
      // Surface it in dev so the tester can complete the flow without
      // an external SMS. Production should never see this branch (server
      // only emits demoCode when SMS is unconfigured), but defense-in-depth:
      // also gate on NODE_ENV so a server-side regression (env-var typo,
      // Twilio outage, key-rotation race) can't silently leak the OTP into
      // a customer's browser console where browser extensions / shoulder-
      // surfers / shared screens could capture it.
      if (data.demoCode && process.env.NODE_ENV !== "production") {
        console.log(`[rewards-login] demo code: ${data.demoCode}`);
      }
      router.push(`/rewards/verify?phone=${encodeURIComponent(digits)}`);
    } catch {
      setErr("Network error. Please try again.");
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label
          htmlFor="phone"
          className="block text-xs font-bold text-stone-700 uppercase tracking-wide mb-2"
        >
          Phone number
        </label>
        <input
          id="phone"
          type="tel"
          autoComplete="tel"
          inputMode="numeric"
          placeholder="(509) 555-0100"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          disabled={busy}
          className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 focus:outline-none disabled:bg-stone-100 disabled:text-stone-400"
        />
      </div>

      {err && (
        <div role="alert" className="text-sm text-red-700 font-medium">
          {err}
        </div>
      )}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-2xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold py-3.5 text-base transition-all hover:-translate-y-0.5 shadow-md shadow-emerald-900/20 disabled:opacity-60 disabled:hover:translate-y-0"
      >
        {busy ? "Sending code…" : "Send my code →"}
      </button>
    </form>
  );
}
