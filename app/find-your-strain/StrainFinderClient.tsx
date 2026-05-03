"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { withAttr } from "@/lib/attribution";

type StepKey = "vibe" | "form" | "strain";
type Choice = { value: string; emoji: string; label: string; sub?: string };

const STEPS: { key: StepKey; question: string; intro: string; options: Choice[] }[] = [
  {
    key: "vibe",
    question: "What's the moment?",
    intro: "Pick the feeling. We'll match the cannabis to it.",
    options: [
      { value: "chill", emoji: "😌", label: "Chill", sub: "Wind down · low-key" },
      { value: "energize", emoji: "⚡", label: "Energize", sub: "Get going · stay sharp" },
      { value: "sleep", emoji: "💤", label: "Sleepy", sub: "Bedtime · body-heavy" },
      { value: "creative", emoji: "🎨", label: "Creative", sub: "Focus · flow state" },
      { value: "social", emoji: "🥂", label: "Social", sub: "Friends · good company" },
      { value: "", emoji: "🤷", label: "No idea", sub: "Show me what's good" },
    ],
  },
  {
    key: "form",
    question: "How do you want to take it?",
    intro: "Different forms hit differently — pick the one that fits the day.",
    options: [
      { value: "Flower", emoji: "🌿", label: "Flower", sub: "Classic · roll your own" },
      { value: "Pre-Rolls", emoji: "🫙", label: "Pre-rolls", sub: "Ready to go" },
      { value: "Edibles", emoji: "🍬", label: "Edibles", sub: "Discreet · long lasting" },
      { value: "Vapes", emoji: "💨", label: "Vapes", sub: "Quick · clean" },
      { value: "Concentrates", emoji: "💎", label: "Concentrates", sub: "Strongest · advanced" },
      { value: "", emoji: "✨", label: "Surprise me", sub: "Open to anything" },
    ],
  },
  {
    key: "strain",
    question: "Sativa, indica, or hybrid?",
    intro: "Quick rule of thumb: indica = body, sativa = head, hybrid = both.",
    options: [
      { value: "sativa", emoji: "☀️", label: "Sativa", sub: "Daytime · uplifting" },
      { value: "indica", emoji: "🌙", label: "Indica", sub: "Nighttime · relaxing" },
      { value: "hybrid", emoji: "🍃", label: "Hybrid", sub: "Best of both" },
      { value: "", emoji: "🤝", label: "No pref", sub: "All three are good" },
    ],
  },
];

// Hack #6 capture-card gate — read at module load. Next inlines
// NEXT_PUBLIC_* at build time so this compiles to a constant boolean
// per deployment. When false, the entire capture step is omitted from
// the flow and the quiz behaves exactly as it did pre-Hack-#6 (last
// pick → straight to /order).
const CAPTURE_ENABLED = process.env.NEXT_PUBLIC_QUIZ_NURTURE_ENABLED === "true";

export function StrainFinderClient() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<StepKey, string>>({
    vibe: "",
    form: "",
    strain: "",
  });
  const [submitting, setSubmitting] = useState(false);

  // Capture-step state — only used when CAPTURE_ENABLED. `phase` flips
  // to "capture" after the last quiz pick instead of routing straight
  // to /order. The Skip link bypasses capture and continues to /order.
  type Phase = "quiz" | "capture";
  const [phase, setPhase] = useState<Phase>("quiz");
  const [email, setEmail] = useState("");
  const [captureState, setCaptureState] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");
  const [captureError, setCaptureError] = useState<string | null>(null);
  // Lock in the answers we'll route + capture with at the moment the
  // last pick fires, so a parallel re-render can't race the submit.
  const [finalAnswers, setFinalAnswers] = useState<Record<StepKey, string> | null>(null);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  function pick(value: string) {
    const next = { ...answers, [step.key]: value };
    setAnswers(next);
    if (isLast) {
      // Capture-enabled flow: pause at the capture card. Otherwise:
      // legacy behavior — redirect straight to /order.
      if (CAPTURE_ENABLED) {
        setFinalAnswers(next);
        setPhase("capture");
      } else {
        redirectToOrder(next);
      }
    } else {
      setStepIdx(stepIdx + 1);
    }
  }

  function back() {
    if (phase === "capture") {
      // Step back from capture → re-show last quiz step. Don't lose
      // their pick so they don't have to re-tap.
      setPhase("quiz");
      setFinalAnswers(null);
      return;
    }
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  function buildOrderUrl(final: Record<StepKey, string>): string {
    const params = new URLSearchParams();
    if (final.vibe) params.set("vibe", final.vibe);
    if (final.form) params.set("category", final.form);
    if (final.strain) params.set("strain", final.strain);
    return params.toString() ? `/order?${params}` : "/order";
  }

  function redirectToOrder(final: Record<StepKey, string>) {
    setSubmitting(true);
    router.push(buildOrderUrl(final));
  }

  function skipCapture() {
    if (!finalAnswers) return;
    redirectToOrder(finalAnswers);
  }

  async function submitCapture(e: React.FormEvent) {
    e.preventDefault();
    if (!finalAnswers) return;
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setCaptureError("Please enter a valid email.");
      setCaptureState("error");
      return;
    }
    setCaptureError(null);
    setCaptureState("submitting");
    try {
      const res = await fetch("/api/quiz/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmed,
          vibe: finalAnswers.vibe || null,
          strain_type: finalAnswers.strain || null,
          category: finalAnswers.form || null,
        }),
      });
      // Capture is best-effort — even if the API errors we route to
      // /order anyway so the customer never sees a dead-end. Show a
      // brief success ack first.
      if (res.ok) {
        setCaptureState("success");
        // Short delay so the success message registers before the
        // route transition.
        setTimeout(() => redirectToOrder(finalAnswers), 800);
      } else {
        // Graceful degrade — show a soft error, but still let them
        // proceed via the Skip link below. We DO NOT auto-redirect on
        // error because the error might be "invalid email" and they
        // need to retry.
        setCaptureState("error");
        const data = await res.json().catch(() => ({}));
        setCaptureError(
          (data as { error?: string })?.error ?? "Couldn't save your email — try again or skip.",
        );
      }
    } catch {
      setCaptureState("error");
      setCaptureError("Network hiccup — try again or skip below.");
    }
  }

  const progress =
    phase === "capture" ? 100 : ((stepIdx + 1) / STEPS.length) * 100;

  // Selected-pick chips — built fresh each render. In capture phase we
  // show ALL three picks so the customer sees what we'll route them to.
  const picksSoFar =
    phase === "capture"
      ? STEPS.flatMap((s) => {
          const v = (finalAnswers ?? answers)[s.key];
          if (!v) return [];
          const opt = s.options.find((o) => o.value === v);
          if (!opt) return [];
          return [{ stepIndex: STEPS.indexOf(s), key: s.key, label: opt.label, emoji: opt.emoji }];
        })
      : STEPS.slice(0, stepIdx).flatMap((s, i) => {
          const v = answers[s.key];
          if (!v) return [];
          const opt = s.options.find((o) => o.value === v);
          if (!opt) return [];
          return [{ stepIndex: i, key: s.key, label: opt.label, emoji: opt.emoji }];
        });

  return (
    <div className="space-y-6">
      {/* Progress strip */}
      <div className="space-y-2" aria-live="polite">
        <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          <span>
            {phase === "capture"
              ? "Match ready"
              : `Step ${stepIdx + 1} of ${STEPS.length}`}
          </span>
          <span className="capitalize">{phase === "capture" ? "deal" : step.key}</span>
        </div>
        <div
          className="h-1.5 rounded-full bg-stone-200 overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={
            phase === "capture"
              ? "Quiz complete — capture step"
              : `Quiz progress: step ${stepIdx + 1} of ${STEPS.length}`
          }
        >
          <div
            className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-300 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Picks-so-far breadcrumb */}
      {picksSoFar.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            {phase === "capture" ? "Your match" : "Your picks"}
          </span>
          {picksSoFar.map((p) => (
            <button
              key={p.key}
              onClick={() => {
                // From capture, jumping to a quiz step undoes the
                // capture phase + lets them revise. From quiz, normal
                // direct-jump back-nav.
                if (phase === "capture") {
                  setPhase("quiz");
                  setFinalAnswers(null);
                }
                setStepIdx(p.stepIndex);
              }}
              disabled={submitting || captureState === "submitting"}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[11px] font-bold text-green-800 hover:bg-green-100 hover:border-green-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1 disabled:opacity-50"
              aria-label={`Edit your ${p.key} pick: ${p.label}`}
            >
              <span aria-hidden>{p.emoji}</span>
              {p.label}
              <span className="text-green-600 opacity-60" aria-hidden>
                ✎
              </span>
            </button>
          ))}
        </div>
      )}

      {phase === "quiz" ? (
        <>
          {/* Question */}
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">
              {step.question}
            </h2>
            <p className="text-sm text-stone-600">{step.intro}</p>
          </div>

          {/* Options grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {step.options.map((opt) => {
              const selected = answers[step.key] === opt.value && opt.value !== "";
              return (
                <button
                  key={opt.label}
                  onClick={() => pick(opt.value)}
                  disabled={submitting}
                  aria-pressed={selected}
                  className={`group relative rounded-2xl border p-4 sm:p-5 text-left transition-all hover:scale-[1.02] motion-reduce:hover:scale-100 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${
                    selected
                      ? "border-green-600 bg-green-50 shadow-md"
                      : "border-stone-200 bg-white hover:border-green-300 hover:shadow-sm"
                  }`}
                >
                  <div className="text-3xl mb-1.5" aria-hidden>
                    {opt.emoji}
                  </div>
                  <div
                    className={`text-sm font-semibold transition-colors ${selected ? "text-green-800" : "text-stone-900 group-hover:text-green-700"}`}
                  >
                    {opt.label}
                  </div>
                  {opt.sub && <div className="mt-0.5 text-[11px] text-stone-500 leading-snug">{opt.sub}</div>}
                </button>
              );
            })}
          </div>

          {/* Footer controls — quiz phase */}
          <div className="flex items-center justify-between pt-2">
            <button
              onClick={back}
              disabled={stepIdx === 0 || submitting}
              className="text-xs text-stone-500 hover:text-stone-700 disabled:opacity-30 disabled:cursor-not-allowed font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded px-1"
            >
              ← Back
            </button>
            <Link
              href={withAttr("/menu", "quiz", "skip")}
              className="text-xs text-stone-500 hover:text-stone-700 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded px-1"
            >
              Open the live menu →
            </Link>
          </div>

          {submitting && (
            <p
              className="text-center text-sm text-green-700 font-semibold animate-pulse motion-reduce:animate-none"
              role="status"
            >
              Finding your matches…
            </p>
          )}
        </>
      ) : (
        // ── Capture step (Hack #6) ────────────────────────────────────
        // Only renders when NEXT_PUBLIC_QUIZ_NURTURE_ENABLED=true (gated
        // at module load via CAPTURE_ENABLED const). The "Skip → see
        // results" link routes straight to /order with the same params
        // the legacy submit() used.
        <form
          onSubmit={submitCapture}
          className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 sm:p-7 space-y-4"
          aria-labelledby="capture-headline"
        >
          <div className="text-center space-y-2">
            <h2
              id="capture-headline"
              className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900"
            >
              Get your match emailed + a first-visit deal
            </h2>
            <p className="text-sm text-stone-600">
              We&rsquo;ll send your match + a first-visit deal. Reply STOP to
              unsubscribe.
            </p>
          </div>

          <div className="space-y-3">
            <label htmlFor="capture-email" className="sr-only">
              Email address
            </label>
            <input
              id="capture-email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={captureState === "submitting" || captureState === "success"}
              className="w-full rounded-xl border border-stone-300 bg-white px-4 py-3 text-base text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-60"
              aria-invalid={captureState === "error"}
              aria-describedby={captureError ? "capture-error" : undefined}
            />

            <button
              type="submit"
              disabled={
                captureState === "submitting" || captureState === "success"
              }
              className="w-full rounded-xl bg-green-700 text-white font-semibold text-base py-3 hover:bg-green-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {captureState === "submitting"
                ? "Sending…"
                : captureState === "success"
                  ? "Sent! Loading your matches…"
                  : "Send it"}
            </button>

            {captureError && (
              <p
                id="capture-error"
                role="alert"
                className="text-sm text-red-700 text-center font-medium"
              >
                {captureError}
              </p>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-green-200">
            <button
              type="button"
              onClick={back}
              disabled={captureState === "submitting"}
              className="text-xs text-stone-500 hover:text-stone-700 disabled:opacity-30 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded px-1"
            >
              ← Back
            </button>
            <button
              type="button"
              onClick={skipCapture}
              disabled={captureState === "submitting" || captureState === "success"}
              className="text-xs text-stone-500 hover:text-stone-700 disabled:opacity-30 font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 rounded px-1"
            >
              Skip → see results
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
