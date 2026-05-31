"use client";

import { useEffect, useId, useRef, useState } from "react";

// Customer Engagement Layer Ship 4 — public-site `/feedback` intake form.
//
// Sister component on seattle-cannabis-web. Backend lives in inv-App at
// `apps/staff/src/app/api/public/customer-feedback/route.ts` and writes
// into `customer_feedback` (see `PLAN_CUSTOMER_ENGAGEMENT_LAYER_2026_05_30.md`
// § 4). The two public sites POST to the per-store inv-App base:
//   greenlife-web         → https://brapp.greenlifecannabis.com
//   seattle-cannabis-web  → https://brapp.seattlecannabis.co
// The caller pins the `store` discriminator + the API base — this
// component just renders + submits.
//
// Two render modes:
//   - default (full page) — renders inside `/feedback`
//   - compact (modal) — renders inside the footer-modal trigger
// The compact prop dials down padding + headings; field set + validation
// are identical.
//
// **Defense-in-depth (caller-side):**
//   1. Cloudflare Turnstile widget — `NEXT_PUBLIC_TURNSTILE_SITE_KEY` must
//      be set on the public-site Vercel project. When absent we render an
//      amber placeholder + disable submit so the form fails-closed rather
//      than POSTing un-captcha'd. The backend ALSO rejects missing tokens,
//      so a half-shipped env var doesn't become an open spam funnel.
//   2. Honeypot — hidden `website` input. Naive bots fill every form
//      field; real users never see it. If filled the submit short-circuits
//      to a fake success state (no network call).
//   3. Length bounds — body 20..2000 chars enforced client-side AND
//      server-side. Contact email/phone optional.
//   4. Min/max + aria-required + role=alert on every error so screen
//      readers announce the friction.
//
// Brand voice (per `/CODE/Green Life/Inventory App/docs/brand-voice.md`):
// no exclamations on system copy, no corporate-stock failure language.
// Plain. Direct. "Send it over." not "Submit." "Got it — we'll be in
// touch if it needs a reply." not "Thank you for your valuable feedback."

const FEEDBACK_CATEGORIES = [
  {
    value: "suggestion",
    label: "Suggestion",
    hint: "An idea or change we should consider",
  },
  {
    value: "complaint",
    label: "Complaint",
    hint: "Something we got wrong — tell us what happened",
  },
  {
    value: "accessibility",
    label: "Accessibility",
    hint: "Trouble using the shop or site (ADA — we respond within 14 days)",
  },
  {
    value: "compliance",
    label: "Compliance",
    hint: "WSLCB / regulatory concern (we respond within 30 days)",
  },
  {
    value: "compliment",
    label: "Compliment",
    hint: "Something we did right — name names if you can",
  },
  { value: "other", label: "Other", hint: "Anything else on your mind" },
] as const;

type CategoryValue = (typeof FEEDBACK_CATEGORIES)[number]["value"];

const BODY_MIN = 20;
const BODY_MAX = 2000;
const NAME_MAX = 80;
const EMAIL_MAX = 120;
const PHONE_MAX = 30;

// Cloudflare Turnstile widget script — loaded on first render. The script
// hydrates any `.cf-turnstile` div on the page using the `data-sitekey` it
// finds there. We use `data-callback` to receive the resolved token via
// a stable window-scoped function name (one per FeedbackForm instance so
// the page + modal can coexist).
const TURNSTILE_SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

type SubmitState =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; id: string }
  | { kind: "error"; message: string };

interface FeedbackFormProps {
  /** API base to POST to — caller pins per-store. */
  apiBase: string;
  /** 'wen' | 'sea' — caller pins per-site. */
  store: "wen" | "sea";
  /** Modal mode dials down padding + headings + skips the page footer. */
  compact?: boolean;
  /** Callback after success — modal uses it to auto-close after a beat. */
  onSuccess?: () => void;
}

// We intentionally do NOT redeclare `window.turnstile` — `app/apply/page.tsx`
// already declares a narrower shape for the same global. Re-declaring a
// wider shape collides at the TS level (TS2717). Instead we treat the
// global as a structural type local to this file. Cloudflare's Turnstile
// runtime is the source of truth for the actual surface area; our typing
// is just enough to call the methods we use.
type TurnstileRender = (
  container: HTMLElement,
  opts: {
    sitekey: string;
    callback: (token: string) => void;
    "expired-callback"?: () => void;
    "error-callback"?: () => void;
    theme?: "light" | "dark" | "auto";
    size?: "normal" | "flexible" | "compact";
  },
) => string;
type TurnstileGlobal = {
  render?: TurnstileRender;
  reset?: (widgetId?: string) => void;
  remove?: (widgetId: string) => void;
};
function getTurnstile(): TurnstileGlobal | undefined {
  if (typeof window === "undefined") return undefined;
  return (window as unknown as { turnstile?: TurnstileGlobal }).turnstile;
}

export function FeedbackForm({ apiBase, store, compact = false, onSuccess }: FeedbackFormProps) {
  const formId = useId();
  const bodyId = `${formId}-body`;
  const nameId = `${formId}-name`;
  const emailId = `${formId}-email`;
  const phoneId = `${formId}-phone`;
  const errorId = `${formId}-error`;

  const [category, setCategory] = useState<CategoryValue>("suggestion");
  const [body, setBody] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [honeypot, setHoneypot] = useState(""); // catches naive bots
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<SubmitState>({ kind: "idle" });

  const turnstileContainerRef = useRef<HTMLDivElement | null>(null);
  const turnstileWidgetIdRef = useRef<string | null>(null);

  const siteKey =
    typeof process !== "undefined" && process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
      : "";
  const turnstileConfigured = siteKey.length > 0;

  // Load Turnstile script once, then render the widget into our container.
  // Each mounted FeedbackForm gets its own widget id so page + modal both
  // work without colliding on the same token.
  useEffect(() => {
    if (!turnstileConfigured) return;
    if (typeof window === "undefined") return;

    function renderWidget() {
      if (!turnstileContainerRef.current) return;
      const ts = getTurnstile();
      if (!ts?.render) return;
      if (turnstileWidgetIdRef.current) return; // already rendered
      try {
        const id = ts.render(turnstileContainerRef.current, {
          sitekey: siteKey,
          callback: (token: string) => setTurnstileToken(token),
          "expired-callback": () => setTurnstileToken(null),
          "error-callback": () => setTurnstileToken(null),
          theme: "auto",
          size: compact ? "compact" : "flexible",
        });
        turnstileWidgetIdRef.current = id;
      } catch {
        // Turnstile render can throw if the container is already managed;
        // swallow + leave the form usable (token will stay null → submit
        // disabled, banner explains).
      }
    }

    if (getTurnstile()?.render) {
      renderWidget();
      return;
    }
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${TURNSTILE_SCRIPT_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", renderWidget, { once: true });
      return;
    }
    const s = document.createElement("script");
    s.src = TURNSTILE_SCRIPT_SRC;
    s.async = true;
    s.defer = true;
    s.addEventListener("load", renderWidget, { once: true });
    document.head.appendChild(s);

    return () => {
      const widgetId = turnstileWidgetIdRef.current;
      const ts = getTurnstile();
      if (widgetId && ts?.remove) {
        try {
          ts.remove(widgetId);
        } catch {
          // best-effort cleanup
        }
      }
      turnstileWidgetIdRef.current = null;
    };
  }, [turnstileConfigured, siteKey, compact]);

  const trimmedBody = body.trim();
  const bodyTooShort = trimmedBody.length > 0 && trimmedBody.length < BODY_MIN;
  const bodyTooLong = trimmedBody.length > BODY_MAX;
  const submitDisabled =
    submitState.kind === "submitting" ||
    trimmedBody.length < BODY_MIN ||
    trimmedBody.length > BODY_MAX ||
    (turnstileConfigured && !turnstileToken);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (submitState.kind === "submitting") return;

    // Honeypot — naive bot fills every field. Return a fake success to
    // avoid telegraphing the trap.
    if (honeypot.trim().length > 0) {
      setSubmitState({ kind: "success", id: "honeypot" });
      return;
    }

    if (trimmedBody.length < BODY_MIN) {
      setSubmitState({
        kind: "error",
        message: `Tell us a bit more — at least ${BODY_MIN} characters.`,
      });
      return;
    }
    if (trimmedBody.length > BODY_MAX) {
      setSubmitState({
        kind: "error",
        message: `Keep it under ${BODY_MAX} characters.`,
      });
      return;
    }
    if (turnstileConfigured && !turnstileToken) {
      setSubmitState({
        kind: "error",
        message: "Spam check didn't complete — wait a moment and try again.",
      });
      return;
    }

    setSubmitState({ kind: "submitting" });
    try {
      const res = await fetch(`${apiBase}/api/public/customer-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category,
          body: trimmedBody,
          contactName: contactName.trim() || undefined,
          contactEmail: contactEmail.trim() || undefined,
          contactPhone: contactPhone.trim() || undefined,
          store,
          pagePath: typeof window !== "undefined" ? window.location.pathname : "/feedback",
          turnstileToken: turnstileToken ?? "",
        }),
        signal: AbortSignal.timeout(15000),
      });
      if (res.ok) {
        const json = (await res.json().catch(() => ({}))) as { id?: string };
        setSubmitState({ kind: "success", id: json.id ?? "ok" });
        // Reset the Turnstile widget so a second submit in the same
        // mount needs a fresh token (single-use).
        const ts = getTurnstile();
        if (ts?.reset && turnstileWidgetIdRef.current) {
          try {
            ts.reset(turnstileWidgetIdRef.current);
          } catch {
            // best-effort
          }
        }
        setTurnstileToken(null);
        onSuccess?.();
        return;
      }
      let message = "Couldn't send that — try again in a minute.";
      if (res.status === 429) {
        message = "Easy there — too many submissions from this connection. Take a beat and try again.";
      } else if (res.status === 403) {
        message = "Spam check rejected — refresh the page and try again.";
      } else if (res.status === 400) {
        const json = (await res.json().catch(() => ({}))) as { error?: string };
        message = json.error ?? "Check the form for errors and try again.";
      }
      setSubmitState({ kind: "error", message });
    } catch (err) {
      const isAbort = err instanceof Error && err.name === "AbortError";
      setSubmitState({
        kind: "error",
        message: isAbort
          ? "The request timed out — check your connection and try again."
          : "Network blip — try again in a moment.",
      });
    }
  }

  // Success state — terminal for this mount. Keep the message short, no
  // exclamation marks per brand voice. Modal can auto-close via onSuccess.
  if (submitState.kind === "success") {
    return (
      <div
        role="status"
        aria-live="polite"
        className={
          compact
            ? "py-4 px-2 text-sm"
            : "rounded-2xl border border-green-200 bg-green-50 p-6 sm:p-8 text-center"
        }
      >
        <div className={compact ? "text-green-900 font-bold text-base" : "text-green-900 font-extrabold text-lg sm:text-xl"}>
          Got it.
        </div>
        <p className={compact ? "text-green-800 text-sm mt-1" : "text-green-800 mt-2 text-sm sm:text-base"}>
          We&apos;ll be in touch if it needs a reply.
        </p>
      </div>
    );
  }

  // 44px min touch target everywhere (Apple HIG — memo § 1). Tailwind
  // py-3 + text-base hits ~44px; radio button hit area gets explicit
  // padding so the whole label is tappable.
  const inputClasses =
    "w-full rounded-xl border border-stone-300 bg-white px-3 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-green-500 focus:outline-none focus:ring-2 focus:ring-green-200";

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      aria-describedby={submitState.kind === "error" ? errorId : undefined}
      className={compact ? "space-y-4" : "space-y-6"}
    >
      {/* Category radios — labels are 44px+ tap targets each. */}
      <fieldset className="space-y-2">
        <legend className={compact ? "text-xs font-bold text-stone-700 uppercase tracking-widest" : "text-sm font-bold text-stone-800"}>
          What kind of feedback?
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {FEEDBACK_CATEGORIES.map((opt) => {
            const checked = category === opt.value;
            return (
              <label
                key={opt.value}
                className={[
                  "flex items-start gap-3 rounded-xl border p-3 cursor-pointer transition-colors min-h-[44px]",
                  checked
                    ? "border-green-500 bg-green-50"
                    : "border-stone-200 bg-white hover:border-stone-300",
                ].join(" ")}
              >
                <input
                  type="radio"
                  name={`${formId}-category`}
                  value={opt.value}
                  checked={checked}
                  onChange={() => setCategory(opt.value)}
                  className="mt-0.5 h-4 w-4 text-green-600"
                  aria-describedby={`${formId}-${opt.value}-hint`}
                />
                <span className="text-sm text-stone-900">
                  <span className="font-semibold">{opt.label}</span>
                  <span
                    id={`${formId}-${opt.value}-hint`}
                    className="block text-xs text-stone-500 mt-0.5"
                  >
                    {opt.hint}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      {/* Body — required, length-bound. Live counter under the field. */}
      <div className="space-y-1.5">
        <label htmlFor={bodyId} className={compact ? "text-xs font-bold text-stone-700 uppercase tracking-widest" : "text-sm font-bold text-stone-800"}>
          Your message
        </label>
        <textarea
          id={bodyId}
          name="body"
          required
          aria-required="true"
          aria-invalid={bodyTooShort || bodyTooLong}
          minLength={BODY_MIN}
          maxLength={BODY_MAX}
          rows={compact ? 4 : 6}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Tell us what you're thinking…"
          className={inputClasses}
        />
        <div className="flex items-center justify-between text-xs">
          <span
            className={
              bodyTooShort || bodyTooLong
                ? "text-red-700"
                : "text-stone-500"
            }
          >
            {bodyTooShort
              ? `Need at least ${BODY_MIN} characters (you have ${trimmedBody.length}).`
              : bodyTooLong
                ? `Trim down — ${trimmedBody.length} / ${BODY_MAX}.`
                : `${trimmedBody.length} / ${BODY_MAX} characters`}
          </span>
        </div>
      </div>

      {/* Optional contact fields — three columns at desktop, stacked on mobile. */}
      <div className={compact ? "space-y-3" : "grid grid-cols-1 sm:grid-cols-3 gap-3"}>
        <div className="space-y-1.5">
          <label htmlFor={nameId} className="text-xs font-semibold text-stone-700">
            Name <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <input
            id={nameId}
            name="contactName"
            type="text"
            maxLength={NAME_MAX}
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
            placeholder="Optional"
            autoComplete="name"
            className={inputClasses}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={emailId} className="text-xs font-semibold text-stone-700">
            Email <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <input
            id={emailId}
            name="contactEmail"
            type="email"
            maxLength={EMAIL_MAX}
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            placeholder="Optional — only if you want a reply."
            autoComplete="email"
            className={inputClasses}
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor={phoneId} className="text-xs font-semibold text-stone-700">
            Phone <span className="text-stone-400 font-normal">(optional)</span>
          </label>
          <input
            id={phoneId}
            name="contactPhone"
            type="tel"
            maxLength={PHONE_MAX}
            value={contactPhone}
            onChange={(e) => setContactPhone(e.target.value)}
            placeholder="Optional — only if you want a reply."
            autoComplete="tel"
            className={inputClasses}
          />
        </div>
      </div>

      {/* Honeypot — visually hidden BUT not display:none (real screen
          readers ignore aria-hidden, and display:none can be detected by
          some bots). tabindex=-1 keeps it out of keyboard nav. */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          left: "-9999px",
          width: "1px",
          height: "1px",
          overflow: "hidden",
        }}
      >
        <label htmlFor={`${formId}-website`}>Leave blank</label>
        <input
          id={`${formId}-website`}
          type="text"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
        />
      </div>

      {/* Turnstile widget OR amber placeholder when env var missing. */}
      {turnstileConfigured ? (
        <div className="space-y-1">
          <div
            ref={turnstileContainerRef}
            className="cf-turnstile"
            data-sitekey={siteKey}
          />
          <p className="text-[11px] text-stone-400">
            Spam protection by Cloudflare Turnstile — no tracking cookies.
          </p>
        </div>
      ) : (
        <div
          role="status"
          className="rounded-xl border border-amber-300 bg-amber-50 px-3 py-2.5 text-xs text-amber-900"
        >
          Spam protection pending setup — submissions disabled until configured.
        </div>
      )}

      {/* Error state — role=alert + aria-live polite so screen readers
          announce without stealing focus. */}
      {submitState.kind === "error" && (
        <div
          id={errorId}
          role="alert"
          aria-live="polite"
          className="rounded-xl border border-red-300 bg-red-50 px-3 py-2.5 text-sm text-red-900"
        >
          {submitState.message}
        </div>
      )}

      <button
        type="submit"
        disabled={submitDisabled}
        className={[
          "w-full sm:w-auto rounded-xl px-6 py-3 text-sm font-bold transition-colors min-h-[44px]",
          submitDisabled
            ? "bg-stone-200 text-stone-500 cursor-not-allowed"
            : "bg-green-600 hover:bg-green-700 text-white",
        ].join(" ")}
      >
        {submitState.kind === "submitting" ? "Sending…" : "Send it over."}
      </button>
    </form>
  );
}
