"use client";

import { useEffect, useState } from "react";
import { FeedbackForm } from "./FeedbackForm";

// Customer Engagement Layer Ship 4 — footer-modal entry point.
//
// Sits in the SiteFooter and opens a compact-mode `<FeedbackForm />`.
// Stays a Client Component so the Server-Component footer can remain
// static — only this trigger + the modal it controls cross the
// hydration boundary.
//
// **Accessibility:**
//   - The trigger is a real `<button>` (not an anchor) so SR users
//     hear "button" not "link" — opening the modal is an action,
//     not a navigation.
//   - The modal closes on `Escape` keypress, click-outside, and the
//     in-modal X-close button. After successful submit it auto-closes
//     after ~2.5s so the customer sees the confirmation card before it
//     vanishes.
//   - Focus management is intentionally minimal — the browser's native
//     dialog-element scoping handles tab capture; we just open + close.
//   - `aria-modal` + `role="dialog"` + `aria-labelledby` per WAI-ARIA
//     authoring guide.

interface FeedbackModalTriggerProps {
  apiBase: string;
  store: "wen" | "sea";
  /** Tailwind classes applied to the trigger button (so the footer can
   * style it as a plain link inline). */
  triggerClassName?: string;
  /** Visible label on the trigger. */
  triggerLabel?: string;
}

export function FeedbackModalTrigger({
  apiBase,
  store,
  triggerClassName,
  triggerLabel = "Tell us how we're doing",
}: FeedbackModalTriggerProps) {
  const [open, setOpen] = useState(false);

  // Close on Escape — only while open (avoid stealing global Esc).
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while the modal is open so a long form on mobile
  // doesn't fight the page's scroll position.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  function handleSuccess() {
    // Give the customer ~2.5s to see the confirmation card before the
    // modal dismisses itself.
    window.setTimeout(() => setOpen(false), 2500);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={
          triggerClassName ??
          "text-[11px] text-green-400/70 hover:text-white transition-colors underline-offset-4 hover:underline"
        }
      >
        {triggerLabel}
      </button>

      {open && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="feedback-modal-title"
          className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4"
        >
          {/* Backdrop — clickthrough closes. */}
          <button
            type="button"
            aria-label="Close feedback form"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-black/60 cursor-default"
          />

          {/* Sheet — bottom-sheet on mobile, centered modal on desktop. */}
          <div className="relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto bg-white text-stone-900 rounded-t-2xl sm:rounded-2xl shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-stone-100 bg-white px-5 py-3">
              <h2
                id="feedback-modal-title"
                className="text-base font-extrabold text-stone-900"
              >
                Tell us how we&apos;re doing.
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="rounded-lg p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-900 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="px-5 py-5">
              <p className="text-xs text-stone-500 mb-4">
                Got a suggestion, a complaint, or something we should know? We read every one.
              </p>
              <FeedbackForm
                apiBase={apiBase}
                store={store}
                compact
                onSuccess={handleSuccess}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
