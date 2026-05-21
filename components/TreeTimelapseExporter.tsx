"use client";

// Tree-Timelapse client island — C2 of
// /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md.
//
// Mounts on /account/tree-growth and gives the customer three actions:
//   1. PREVIEW — render the animated SVG inline (no recording).
//   2. DOWNLOAD MP4 — uses the browser MediaRecorder API to capture the
//      animated SVG into an MP4/WebM the customer can save to camera
//      roll. No new deps required (MediaRecorder is in every modern
//      browser since Chrome 47 / Safari 14.1 / Firefox 25).
//   3. COPY SHARE LINK — copies the canonical share URL to clipboard.
//
// WAC: button copy + landing copy uses process + experience vocabulary
// only. No effects, no efficacy, no consumption claims.
//
// Brand: emerald accent (GLW). Sister-port in seattle-cannabis-web flips to
// indigo via the ACCENT_CLASSES constant.
//
// Strict NEW-files-only: this file is the WHOLE client surface. It
// pulls the animated SVG from /api/tree-growth/export.mp4 (which is a
// SAME-ORIGIN endpoint — no CORS concerns) and renders it inside an
// <img> + a hidden offscreen <canvas> for the MediaRecorder capture.

import { useState, useRef } from "react";

const ACCENT_CLASSES = {
  // Emerald accent for GLW. Sister-port in seattle-cannabis-web swaps to indigo.
  buttonPrimary:
    "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white border-emerald-500",
  buttonSecondary:
    "border-emerald-400/40 hover:bg-emerald-500/10 text-emerald-100",
  banner: "bg-green-950/60 border-emerald-500/30 text-emerald-100",
  link: "text-emerald-300 hover:text-emerald-200 underline-offset-2",
};

const EXPORT_URL = "/api/tree-growth/export.mp4";

type ExporterProps = {
  /** Customer's display name from portal_users.name. */
  displayName: string;
  /** Year range covered by the current export, e.g. "2025" or "2025-2026". */
  yearRange: string;
  /** Total purchases reflected in the mock timeline (for chrome label). */
  visitCount: number;
  /** Distinct strain count (for chrome label). */
  distinctStrainCount: number;
};

export function TreeTimelapseExporter({
  displayName,
  yearRange,
  visitCount,
  distinctStrainCount,
}: ExporterProps) {
  const [recording, setRecording] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);

  const previewSrc = `${EXPORT_URL}?name=${encodeURIComponent(displayName)}&preview=1`;
  const shareSrc = `${EXPORT_URL}?name=${encodeURIComponent(displayName)}`;

  async function handleRecord() {
    if (typeof window === "undefined") return;
    setErrorMsg(null);
    setDownloadUrl(null);

    // MediaRecorder + canvas.captureStream is supported in Chromium,
    // Firefox, and Safari 14.1+. We feature-test and degrade gracefully.
    const HTMLCanvas = (window as unknown as { HTMLCanvasElement: typeof HTMLCanvasElement })
      .HTMLCanvasElement;
    if (
      typeof MediaRecorder === "undefined" ||
      typeof HTMLCanvas === "undefined" ||
      typeof HTMLCanvas.prototype.captureStream !== "function"
    ) {
      setErrorMsg(
        "Your browser doesn't support direct download. Use the preview link and screen-record from there.",
      );
      return;
    }

    try {
      setRecording(true);
      // Fetch the animated SVG as a data URL.
      const res = await fetch(shareSrc, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`Server returned ${res.status}`);
      }
      const svgText = await res.text();
      const blobUrl = URL.createObjectURL(
        new Blob([svgText], { type: "image/svg+xml;charset=utf-8" }),
      );

      // Offscreen canvas at 9:16 (the SVG's native viewBox).
      const canvas = document.createElement("canvas");
      canvas.width = 540; // half-resolution for MediaRecorder speed
      canvas.height = 960;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        throw new Error("Canvas 2D context unavailable");
      }

      // Load the SVG into an Image, then redraw onto canvas at ~30fps
      // for 15s. SVG SMIL animations don't tick when drawn to canvas
      // (canvas takes a single-instant snapshot), so we re-fetch via
      // <img src=data:...&t={timestamp}> on each frame. Practical
      // alternative: rasterize per-frame. For mock-mode v1, simpler
      // is better — we render a static "summary" frame and let the
      // SMIL play in the inline preview.
      //
      // The customer's actual SHARE asset is the SVG itself (link),
      // not the MP4 — MP4 is a convenience export. Future ship adds
      // server-side ffmpeg rendering for proper per-frame video.
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = blobUrl;
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("SVG image load failed"));
      });

      const stream = canvas.captureStream(30);
      // mp4 mime support varies; fall back through preference order.
      const mimeCandidates = [
        "video/mp4;codecs=avc1.42E01E",
        "video/webm;codecs=vp9",
        "video/webm;codecs=vp8",
        "video/webm",
      ];
      const mimeType = mimeCandidates.find((m) =>
        typeof MediaRecorder.isTypeSupported === "function" && MediaRecorder.isTypeSupported(m),
      );
      const chunks: Blob[] = [];
      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      recorderRef.current = recorder;
      recorder.ondataavailable = (ev) => {
        if (ev.data && ev.data.size > 0) chunks.push(ev.data);
      };
      recorder.start();

      // Render loop — re-draw the SVG snapshot every 100ms for 15s.
      // SVG SMIL ticks inside the Image element when its `src` updates,
      // but in practice the cached blob URL won't re-animate. We get
      // an acceptable summary by drawing a single frame; future ship
      // upgrades to server-side ffmpeg per-frame rasterization.
      const start = performance.now();
      const TOTAL_MS = 15000;
      function tick() {
        const elapsed = performance.now() - start;
        if (!ctx) return;
        ctx.fillStyle = "#0f172a";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        try {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        } catch {
          // CSP / taint issues — skip frame.
        }
        if (elapsed < TOTAL_MS) {
          requestAnimationFrame(tick);
        }
      }
      tick();

      setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, TOTAL_MS + 200);

      await new Promise<void>((resolve) => {
        recorder.onstop = () => resolve();
      });

      const blob = new Blob(chunks, { type: mimeType ?? "video/webm" });
      const objectUrl = URL.createObjectURL(blob);
      setDownloadUrl(objectUrl);
      URL.revokeObjectURL(blobUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "unknown error";
      setErrorMsg(`Couldn't capture: ${msg}`);
    } finally {
      setRecording(false);
    }
  }

  async function handleCopyShareLink() {
    setCopyState("idle");
    try {
      const fullUrl =
        typeof window !== "undefined" ? new URL(shareSrc, window.location.origin).toString() : shareSrc;
      await navigator.clipboard.writeText(fullUrl);
      setCopyState("copied");
      setTimeout(() => setCopyState("idle"), 1800);
    } catch {
      setCopyState("error");
    }
  }

  return (
    <div className="space-y-4">
      <div className={`rounded-lg border p-4 text-sm ${ACCENT_CLASSES.banner}`}>
        <p className="font-medium">
          Your strain journey · <span className="opacity-90">{yearRange}</span>
        </p>
        <p className="opacity-80">
          {distinctStrainCount} distinct strain{distinctStrainCount === 1 ? "" : "s"} across {visitCount} visit
          {visitCount === 1 ? "" : "s"}. The animation fills in chronologically.
        </p>
      </div>

      <div className="rounded-xl overflow-hidden border border-emerald-500/20 bg-slate-950">
        {/* The animated SVG itself — the share-worthy artifact. Inline
            <img> with src pointing at the route lets the browser tick the
            SMIL animations natively. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          ref={imgRef}
          src={previewSrc}
          alt={`Time-lapse of your strain journey covering ${yearRange}`}
          className="w-full h-auto"
          loading="lazy"
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleRecord}
          disabled={recording}
          className={`px-4 py-2 rounded-lg border font-semibold text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${ACCENT_CLASSES.buttonPrimary}`}
        >
          {recording ? "Recording…" : "Download video"}
        </button>
        <button
          type="button"
          onClick={handleCopyShareLink}
          className={`px-4 py-2 rounded-lg border font-semibold text-sm transition ${ACCENT_CLASSES.buttonSecondary}`}
        >
          {copyState === "copied" ? "Link copied" : copyState === "error" ? "Copy failed" : "Copy share link"}
        </button>
        <a
          href={shareSrc}
          target="_blank"
          rel="noopener noreferrer"
          className={`px-4 py-2 rounded-lg border font-semibold text-sm transition ${ACCENT_CLASSES.buttonSecondary}`}
        >
          Open share view
        </a>
      </div>

      {downloadUrl && (
        <p className="text-sm">
          <a
            href={downloadUrl}
            download={`strain-journey-${yearRange}.${downloadUrl.includes("mp4") ? "mp4" : "webm"}`}
            className={ACCENT_CLASSES.link}
          >
            Save to device
          </a>
          <span className="opacity-70"> · The file will open in a new tab if your browser doesn't auto-download.</span>
        </p>
      )}
      {errorMsg && <p className="text-sm text-amber-300">{errorMsg}</p>}

      <p className="text-xs text-slate-400">
        WA state · 21+ only · process and experience only · receipt-verified purchase history
      </p>
    </div>
  );
}
