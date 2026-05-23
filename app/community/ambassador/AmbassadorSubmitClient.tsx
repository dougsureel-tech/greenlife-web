"use client";

import { useState } from "react";

// Client island for the inline submission form on /community/ambassador.
//
// Two modes selectable via radio toggle:
//   - "video"  → POST multipart to /api/community/upload-video
//   - "review" → POST JSON to /api/community/submit-review
//
// Compliance attestation is a required checkbox on the video path; the
// upload-video API rejects with 422 if attestCompliance !== "true".
//
// State machine:
//   "idle" → user picks a brief (video) or pastes URL (review) → "sending"
//   "sending" → on response → "ok" | "error"
//   "ok" / "error" → idle reset after 6s

type Mode = "video" | "review";
type Status = "idle" | "sending" | "ok" | "error";

type BriefRow = { id: string; title: string; targetSeconds: number };

export function AmbassadorSubmitClient({ briefs }: { briefs: BriefRow[] }) {
  const [mode, setMode] = useState<Mode>("video");
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string | null>(null);

  // Shared
  const [budtender, setBudtender] = useState("");

  // Video state
  const [briefId, setBriefId] = useState<string>(briefs[0]?.id ?? "");
  const [attest, setAttest] = useState(false);
  const [file, setFile] = useState<File | null>(null);

  // Review state
  const [reviewUrl, setReviewUrl] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setMsg(null);
    try {
      if (mode === "video") {
        if (!file) {
          setStatus("error");
          setMsg("Pick a video to upload.");
          return;
        }
        if (!attest) {
          setStatus("error");
          setMsg("Check the compliance box first.");
          return;
        }
        const form = new FormData();
        form.set("briefId", briefId);
        form.set("attestCompliance", "true");
        if (budtender) form.set("mentionedBudtender", budtender);
        form.set("video", file);
        const res = await fetch("/api/community/upload-video", {
          method: "POST",
          body: form,
        });
        const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (!res.ok) {
          setStatus("error");
          setMsg((json.error as string) ?? "Couldn't upload. Try again.");
          return;
        }
        setStatus("ok");
        setMsg("Got it. Manager will review within 48 hours.");
        setFile(null);
        setAttest(false);
        setBudtender("");
      } else {
        const res = await fetch("/api/community/submit-review", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            reviewUrl,
            mentionedBudtender: budtender || undefined,
          }),
        });
        const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
        if (!res.ok) {
          setStatus("error");
          setMsg((json.error as string) ?? "Couldn't submit. Try again.");
          return;
        }
        setStatus("ok");
        setMsg(
          (json.message as string) ??
            "Thanks — we'll verify within 24 hours and apply your credit.",
        );
        setReviewUrl("");
        setBudtender("");
      }
    } catch {
      setStatus("error");
      setMsg("Network problem. Try again in a minute.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      {/* Mode toggle */}
      <fieldset className="space-y-2">
        <legend className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
          Pick your path
        </legend>
        <div className="flex gap-3 flex-wrap">
          <label className={`flex-1 min-w-[200px] cursor-pointer rounded-2xl border p-4 transition-colors ${mode === "video" ? "border-green-600 bg-green-50" : "border-stone-200 bg-white hover:border-stone-300"}`}>
            <input
              type="radio"
              name="mode"
              value="video"
              checked={mode === "video"}
              onChange={() => setMode("video")}
              className="sr-only"
            />
            <div className="font-bold text-stone-900 text-sm">Upload a video</div>
            <div className="text-stone-600 text-xs mt-1">15-60 sec · earn $25+ credit</div>
          </label>
          <label className={`flex-1 min-w-[200px] cursor-pointer rounded-2xl border p-4 transition-colors ${mode === "review" ? "border-green-600 bg-green-50" : "border-stone-200 bg-white hover:border-stone-300"}`}>
            <input
              type="radio"
              name="mode"
              value="review"
              checked={mode === "review"}
              onChange={() => setMode("review")}
              className="sr-only"
            />
            <div className="font-bold text-stone-900 text-sm">Paste your review</div>
            <div className="text-stone-600 text-xs mt-1">Google review URL · earn $10 credit</div>
          </label>
        </div>
      </fieldset>

      {mode === "video" && (
        <>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-stone-900" htmlFor="briefId">
              Pick a brief
            </label>
            <select
              id="briefId"
              value={briefId}
              onChange={(e) => setBriefId(e.target.value)}
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
            >
              {briefs.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.title} · ~{b.targetSeconds}s
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-stone-900" htmlFor="budtender-v">
              Budtender first name (optional)
            </label>
            <input
              id="budtender-v"
              type="text"
              value={budtender}
              onChange={(e) => setBudtender(e.target.value)}
              maxLength={80}
              placeholder="First name only"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-stone-900" htmlFor="video-file">
              Your video (mp4, mov, or webm · 100MB max)
            </label>
            <input
              id="video-file"
              type="file"
              accept="video/mp4,video/quicktime,video/webm"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm text-stone-700 file:mr-3 file:rounded-xl file:border-0 file:bg-green-700 file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-green-600"
            />
          </div>

          <label className="flex items-start gap-3 cursor-pointer rounded-xl bg-amber-50 border border-amber-200 p-4">
            <input
              type="checkbox"
              checked={attest}
              onChange={(e) => setAttest(e.target.checked)}
              className="mt-0.5"
            />
            <span className="text-sm text-amber-900 leading-relaxed">
              I recorded this outside the store. No one under 21 is on camera. No
              smoking, dabbing, or vaping is shown. I didn&apos;t make medical or
              effect claims about any product.
            </span>
          </label>
        </>
      )}

      {mode === "review" && (
        <>
          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-stone-900" htmlFor="review-url">
              Paste your Google review URL
            </label>
            <input
              id="review-url"
              type="url"
              value={reviewUrl}
              onChange={(e) => setReviewUrl(e.target.value)}
              maxLength={600}
              placeholder="https://www.google.com/maps/..."
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
              required
            />
            <p className="text-xs text-stone-500">
              Copy the link from your review confirmation screen, or from the Google Maps share menu.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="block text-sm font-bold text-stone-900" htmlFor="budtender-r">
              Budtender first name in your review (optional)
            </label>
            <input
              id="budtender-r"
              type="text"
              value={budtender}
              onChange={(e) => setBudtender(e.target.value)}
              maxLength={80}
              placeholder="First name only"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="w-full rounded-xl bg-green-700 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 transition-colors"
      >
        {status === "sending" ? "Sending..." : mode === "video" ? "Upload video" : "Submit review"}
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
