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

export function StrainFinderClient() {
  const router = useRouter();
  const [stepIdx, setStepIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<StepKey, string>>({
    vibe: "",
    form: "",
    strain: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const step = STEPS[stepIdx];
  const isLast = stepIdx === STEPS.length - 1;

  function pick(value: string) {
    const next = { ...answers, [step.key]: value };
    setAnswers(next);
    if (isLast) {
      submit(next);
    } else {
      setStepIdx(stepIdx + 1);
    }
  }

  function back() {
    if (stepIdx > 0) setStepIdx(stepIdx - 1);
  }

  function submit(final: Record<StepKey, string>) {
    setSubmitting(true);
    const params = new URLSearchParams();
    // vibe is currently informational — neither /menu nor /order filter on
    // it. We still pass it for future use (e.g. analytics or a future
    // recommendation engine).
    if (final.vibe) params.set("vibe", final.vibe);
    if (final.form) params.set("category", final.form);
    if (final.strain) params.set("strain", final.strain);
    // Redirect to /order (native menu) instead of /menu (Boost embed) — only
    // /order reads these params, so a hand-off to /menu was a dead-end UX
    // and the whole quiz felt useless.
    router.push(params.toString() ? `/order?${params}` : "/order");
  }

  const progress = ((stepIdx + 1) / STEPS.length) * 100;

  // Selected-pick chips for the "your picks so far" recap row. Built fresh
  // each render — one per answered step. Acts as breadcrumb + back-nav: tap
  // a chip to jump back to that step (same behavior as ← Back, but
  // direct-jump instead of one step at a time).
  const picksSoFar = STEPS.slice(0, stepIdx).flatMap((s, i) => {
    const v = answers[s.key];
    if (!v) return [];
    const opt = s.options.find((o) => o.value === v);
    if (!opt) return [];
    return [{ stepIndex: i, key: s.key, label: opt.label, emoji: opt.emoji }];
  });

  return (
    <div className="space-y-6">
      {/* Progress strip — aria-live so screen-reader users hear step changes
          announced. The visible label rotates step→step but a screen reader
          would otherwise have to manually re-scan to know it advanced. */}
      <div className="space-y-2" aria-live="polite">
        <div className="flex justify-between text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">
          <span>
            Step {stepIdx + 1} of {STEPS.length}
          </span>
          <span className="capitalize">{step.key}</span>
        </div>
        <div
          className="h-1.5 rounded-full bg-stone-200 overflow-hidden"
          role="progressbar"
          aria-valuenow={Math.round(progress)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Quiz progress: step ${stepIdx + 1} of ${STEPS.length}`}
        >
          <div
            className="h-full bg-gradient-to-r from-green-600 to-emerald-400 transition-all duration-300 motion-reduce:transition-none"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Picks-so-far breadcrumb — only renders once the customer has at least
          one answer locked. Lets them direct-jump back instead of mashing
          Back. "No idea / Surprise me / No pref" don't render here (their
          opt.value is empty so `!v` filters them out) — that's intentional,
          a skip isn't a "pick" worth recapping. */}
      {picksSoFar.length > 0 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
            Your picks
          </span>
          {picksSoFar.map((p) => (
            <button
              key={p.key}
              onClick={() => setStepIdx(p.stepIndex)}
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-green-50 border border-green-200 text-[11px] font-bold text-green-800 hover:bg-green-100 hover:border-green-300 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-1"
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

      {/* Question */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-stone-900">{step.question}</h2>
        <p className="text-sm text-stone-600">{step.intro}</p>
      </div>

      {/* Options grid — `motion-reduce:` strips the hover lift for users who
          opt out of motion in their OS settings. Focus-visible (not focus)
          so we don't ring-flash on mouse click. */}
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

      {/* Footer controls */}
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
    </div>
  );
}
