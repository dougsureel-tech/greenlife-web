"use client";

/**
 * VoiceMemoRecorder — C11 client island.
 *
 * 15-second hard-capped MediaRecorder. Renders the WAC-safe prompt +
 * Layer 1 attestation checkbox + record/stop/preview/submit controls.
 *
 * Default-off: parent screen decides whether to render this island
 * based on `voiceMemoEnabled()` + `canRecordForStrain()`. The island
 * itself does NOT call those helpers — it's a dumb UI primitive.
 *
 * NEVER imports lib/db.ts / lib/strains.ts. Posts to
 * /api/voice-memo/upload which does the server-side validation,
 * blob persistence, and Layer 2 moderation.
 *
 * Sister-port to scc + glw — byte-identical except the accent prop
 * (indigo for SCC / emerald for GLW) is wired per-stack at the
 * mounting page.
 */

import { useEffect, useRef, useState } from "react";

type AccentColor = "indigo" | "emerald";

type RecorderState =
  | "idle"
  | "permission-denied"
  | "recording"
  | "stopped"
  | "uploading"
  | "uploaded"
  | "error";

export type VoiceMemoRecorderProps = {
  strainSlug: string;
  strainName: string;
  prompt: string;
  attestLabel: string;
  maxMs: number;
  accent?: AccentColor;
  /** Optional override for the upload endpoint; defaults to the
   *  /api/voice-memo/upload route shipped in this commit. */
  uploadPath?: string;
  /** Optional callback invoked once the upload returns 2xx. */
  onSubmitted?: () => void;
};

const ACCENT_CLASSES: Record<
  AccentColor,
  { bg: string; bgHover: string; ring: string; text: string }
> = {
  indigo: {
    bg: "bg-indigo-600",
    bgHover: "hover:bg-indigo-700",
    ring: "focus-visible:ring-indigo-500",
    text: "text-indigo-700",
  },
  emerald: {
    bg: "bg-emerald-600",
    bgHover: "hover:bg-emerald-700",
    ring: "focus-visible:ring-emerald-500",
    text: "text-emerald-700",
  },
};

export function VoiceMemoRecorder(props: VoiceMemoRecorderProps) {
  const {
    strainSlug,
    strainName,
    prompt,
    attestLabel,
    maxMs,
    accent = "indigo",
    uploadPath = "/api/voice-memo/upload",
    onSubmitted,
  } = props;

  const accentCls = ACCENT_CLASSES[accent];

  const [state, setState] = useState<RecorderState>("idle");
  const [attest, setAttest] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<number>(0);
  const tickerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hardStopRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup on unmount — stops MediaRecorder, releases mic, revokes
  // preview blob URL. Critical because leaving the mic open is a
  // privacy footgun.
  useEffect(() => {
    return () => {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
        try {
          mediaRecorderRef.current.stop();
        } catch {
          /* swallow — best-effort cleanup */
        }
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }
      if (tickerRef.current) clearInterval(tickerRef.current);
      if (hardStopRef.current) clearTimeout(hardStopRef.current);
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
    // intentionally empty dep array — cleanup only on unmount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function reset() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setElapsedMs(0);
    setErrorMsg(null);
    chunksRef.current = [];
    setState("idle");
  }

  function pickMimeType(): string | undefined {
    if (typeof MediaRecorder === "undefined") return undefined;
    // Order matters — opus is preferred when available (smaller +
    // fastest server-side decode).
    const candidates = [
      "audio/webm;codecs=opus",
      "audio/webm",
      "audio/mp4",
      "audio/aac",
    ];
    for (const c of candidates) {
      try {
        if (MediaRecorder.isTypeSupported(c)) return c;
      } catch {
        /* try the next one */
      }
    }
    return undefined;
  }

  async function startRecording() {
    setErrorMsg(null);
    if (!attest) {
      setErrorMsg("Check the box first — that's the WAC-safety gate.");
      return;
    }
    if (typeof navigator === "undefined" || !navigator.mediaDevices) {
      setErrorMsg("Your browser doesn't expose a microphone API.");
      setState("error");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mimeType = pickMimeType();
      const mr = mimeType
        ? new MediaRecorder(stream, { mimeType })
        : new MediaRecorder(stream);
      mediaRecorderRef.current = mr;
      chunksRef.current = [];
      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      mr.onstop = () => {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || "audio/webm",
        });
        const url = URL.createObjectURL(blob);
        setPreviewUrl(url);
        setState("stopped");
        if (tickerRef.current) clearInterval(tickerRef.current);
        if (hardStopRef.current) clearTimeout(hardStopRef.current);
      };
      startedAtRef.current = Date.now();
      mr.start();
      setState("recording");
      // 100ms-tick UI counter so the 15s budget is visible.
      tickerRef.current = setInterval(() => {
        setElapsedMs(Date.now() - startedAtRef.current);
      }, 100);
      // HARD STOP — defense in depth against a stuck recorder. The UI
      // ticker can be paused (tab backgrounded) but this timeout fires
      // independently and respects the spec'd cap.
      hardStopRef.current = setTimeout(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
          mediaRecorderRef.current.stop();
        }
      }, maxMs);
    } catch (err) {
      const name = err instanceof Error ? err.name : "unknown";
      if (name === "NotAllowedError" || name === "PermissionDeniedError") {
        setState("permission-denied");
        setErrorMsg("Microphone permission denied. Allow mic access in your browser settings and try again.");
      } else {
        setState("error");
        setErrorMsg("Couldn't start recording. Try refreshing the page.");
      }
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
    }
  }

  async function submitRecording() {
    if (!previewUrl || chunksRef.current.length === 0) return;
    setState("uploading");
    setErrorMsg(null);
    try {
      const blob = new Blob(chunksRef.current, {
        type: mediaRecorderRef.current?.mimeType || "audio/webm",
      });
      // Hard re-check on the client too — defense in depth against a
      // manipulated DOM that clears `attest` between record + submit.
      if (!attest) {
        setState("error");
        setErrorMsg("Re-check the box and try again.");
        return;
      }
      if (blob.size === 0) {
        setState("error");
        setErrorMsg("Recording came through empty. Try again.");
        return;
      }
      const form = new FormData();
      form.set("strainSlug", strainSlug);
      form.set("durationMs", String(elapsedMs));
      form.set("attestExpectationsOnly", "true");
      form.set("audio", blob, "voice-memo." + (blob.type.includes("mp4") ? "m4a" : "webm"));
      const res = await fetch(uploadPath, { method: "POST", body: form });
      if (!res.ok) {
        // Don't surface server error text directly — it can include
        // moderation-category names that we don't want to leak (per
        // moderation doc Layer 2 anti-gaming).
        setState("error");
        setErrorMsg(
          res.status === 422
            ? "Thanks — this one didn't fit our 'what are you hoping for' prompt. You can re-record if you'd like."
            : res.status === 413
              ? "That recording was too large. Try a shorter clip."
              : "Couldn't save your memo. Try again in a moment.",
        );
        return;
      }
      setState("uploaded");
      if (onSubmitted) onSubmitted();
    } catch (err) {
      void err;
      setState("error");
      setErrorMsg("Couldn't save your memo. Check your connection and try again.");
    }
  }

  const remainingSec = Math.max(0, Math.ceil((maxMs - elapsedMs) / 1000));

  return (
    <section
      aria-labelledby="voice-memo-heading"
      className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm"
    >
      <h3 id="voice-memo-heading" className={`text-base font-semibold ${accentCls.text}`}>
        Oral history — {strainName}
      </h3>
      <p className="mt-2 text-sm text-stone-700">{prompt}</p>

      <label className="mt-4 flex items-start gap-2 text-sm text-stone-700">
        <input
          type="checkbox"
          checked={attest}
          onChange={(e) => setAttest(e.target.checked)}
          className="mt-1 h-4 w-4 cursor-pointer rounded border-stone-300"
          aria-describedby="voice-memo-attest-help"
        />
        <span>
          {attestLabel}
          <span id="voice-memo-attest-help" className="mt-1 block text-xs text-stone-500">
            We don't display medical or efficacy claims on strain pages — WAC 314-55-155.
          </span>
        </span>
      </label>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        {state === "idle" || state === "permission-denied" || state === "error" ? (
          <button
            type="button"
            onClick={startRecording}
            disabled={!attest}
            aria-label="Start 15-second recording"
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-stone-300 ${accentCls.bg} ${accentCls.bgHover} ${accentCls.ring}`}
          >
            <span aria-hidden="true">●</span> Record (15s)
          </button>
        ) : null}

        {state === "recording" ? (
          <button
            type="button"
            onClick={stopRecording}
            aria-label="Stop recording"
            className="inline-flex items-center gap-2 rounded-full bg-stone-800 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-stone-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2"
          >
            <span aria-hidden="true">■</span> Stop · {remainingSec}s left
          </button>
        ) : null}

        {state === "stopped" && previewUrl ? (
          <>
            <audio
              src={previewUrl}
              controls
              preload="metadata"
              aria-label="Preview your recording"
              className="max-w-full"
            />
            <button
              type="button"
              onClick={submitRecording}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${accentCls.bg} ${accentCls.bgHover} ${accentCls.ring}`}
            >
              Submit memo
            </button>
            <button
              type="button"
              onClick={reset}
              className="inline-flex items-center gap-2 rounded-full border border-stone-300 px-4 py-2 text-sm font-medium text-stone-700 hover:bg-stone-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 focus-visible:ring-offset-2"
            >
              Re-record
            </button>
          </>
        ) : null}

        {state === "uploading" ? (
          <span className="text-sm text-stone-600" aria-live="polite">
            Saving your memo…
          </span>
        ) : null}

        {state === "uploaded" ? (
          <span className={`text-sm font-medium ${accentCls.text}`} aria-live="polite">
            Thanks — your memo is in the queue for review.
          </span>
        ) : null}
      </div>

      {errorMsg ? (
        <p
          role="alert"
          className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800"
        >
          {errorMsg}
        </p>
      ) : null}

      <p className="mt-3 text-xs text-stone-500">
        15-second cap. Audio is private — only an anonymous text snippet may
        appear on the strain page after review. You can delete your memo from
        your account anytime.
      </p>
    </section>
  );
}
