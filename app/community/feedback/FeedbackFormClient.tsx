"use client";

import { useState } from "react";

// Client island for the open-channel feedback form per PLAN §14.3.
// POSTs to /api/community/submit-feedback (public + rate-limited).

type Status = "idle" | "sending" | "ok" | "error";

export function FeedbackFormClient() {
  const [text, setText] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMsg(null);
    try {
      const res = await fetch("/api/community/submit-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          contactEmail: contactEmail || undefined,
        }),
      });
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
      if (!res.ok) {
        setStatus("error");
        setMsg((json.error as string) ?? "Couldn't send. Try again.");
        return;
      }
      setStatus("ok");
      setMsg("Got it. Manager reads everything that comes in here.");
      setText("");
      setContactEmail("");
    } catch {
      setStatus("error");
      setMsg("Couldn't reach us — check your connection and try again.");
    }
  }

  const remaining = 1000 - text.length;

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-stone-900" htmlFor="feedback-text">
          What&apos;s on your mind?
        </label>
        <textarea
          id="feedback-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={1000}
          rows={6}
          placeholder="Product idea, vendor we should carry, something we got wrong — anything."
          required
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900 resize-y"
        />
        <p
          className={`text-xs ${remaining < 100 ? "text-amber-700 font-semibold" : "text-stone-500"}`}
        >
          {remaining} characters left
        </p>
      </div>

      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-stone-900" htmlFor="contact-email">
          Email (optional — if you want a reply)
        </label>
        <input
          id="contact-email"
          type="email"
          value={contactEmail}
          onChange={(e) => setContactEmail(e.target.value)}
          maxLength={254}
          placeholder="you@example.com"
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
        />
      </div>

      <button
        type="submit"
        disabled={status === "sending" || text.length < 5}
        className="w-full rounded-xl bg-green-700 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 transition-colors"
      >
        {status === "sending" ? "Sending..." : "Send to manager"}
      </button>

      {msg && (
        <p
          role="status"
          className={`text-sm font-semibold ${status === "error" ? "text-red-700" : "text-green-700"}`}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
