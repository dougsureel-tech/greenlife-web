"use client";

import { useState, useTransition, useEffect, useRef } from "react";
import Link from "next/link";
import { LEARN_TOPICS } from "@/lib/learn-topics";
import { markLearnStepDone, unmarkLearnStep } from "./actions";

type Props = {
  initialCompletedIds: string[];
  signedIn: boolean;
};

export function LearnProgress({ initialCompletedIds, signedIn }: Props) {
  const [completed, setCompleted] = useState<Set<string>>(new Set(initialCompletedIds));
  const [pending, startTransition] = useTransition();
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const justCompletedRef = useRef<HTMLDivElement>(null);

  // Auto-scroll the topic into view when marked done so the next one is visible
  useEffect(() => {
    if (justCompletedRef.current) {
      justCompletedRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [completed]);

  function toggle(stepId: string) {
    if (!signedIn) return;
    setPendingIds((prev) => new Set(prev).add(stepId));
    const wasCompleted = completed.has(stepId);
    // Optimistic update
    setCompleted((prev) => {
      const next = new Set(prev);
      if (wasCompleted) next.delete(stepId);
      else next.add(stepId);
      return next;
    });
    startTransition(async () => {
      try {
        if (wasCompleted) await unmarkLearnStep(stepId);
        else await markLearnStepDone(stepId);
      } catch {
        // Revert on failure
        setCompleted((prev) => {
          const next = new Set(prev);
          if (wasCompleted) next.add(stepId);
          else next.delete(stepId);
          return next;
        });
      } finally {
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(stepId);
          return next;
        });
      }
    });
  }

  const total = LEARN_TOPICS.length;
  const done = completed.size;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const allDone = done === total && total > 0;

  return (
    <>
      {/* Top progress bar (signed-in only) */}
      {signedIn && (
        <section className="sticky top-0 z-20 -mx-4 sm:mx-0 px-4 sm:px-0 bg-zinc-950/80 backdrop-blur border-b border-zinc-800/60 py-3">
          <div className="flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-[11px] font-bold uppercase tracking-widest text-emerald-400">
                  Cannabis 101 progress
                </span>
                <span className="text-xs text-zinc-300 tabular-nums font-semibold">
                  {done} / {total}
                </span>
              </div>
              <div className="h-1.5 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
            {allDone && (
              <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold whitespace-nowrap">
                ✓ All done
              </span>
            )}
          </div>
        </section>
      )}

      {/* Layout: sidebar + topics */}
      <div className="grid lg:grid-cols-[220px_1fr] gap-6 lg:gap-8 mt-6">
        {/* Sidebar (sticky on desktop) */}
        {signedIn && (
          <aside className="hidden lg:block">
            <div className="sticky top-20 space-y-1">
              <p className="text-[11px] font-bold uppercase tracking-widest text-zinc-500 mb-2 px-2">
                Topics
              </p>
              <nav className="space-y-0.5">
                {LEARN_TOPICS.map((t, i) => {
                  const isDone = completed.has(t.id);
                  return (
                    <a
                      key={t.id}
                      href={`#${t.id}`}
                      className="flex items-center gap-2 px-2 py-1.5 rounded-md text-xs hover:bg-zinc-800/60 transition-colors group"
                    >
                      <span
                        className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] shrink-0 ${
                          isDone
                            ? "bg-emerald-500 text-emerald-950 font-bold"
                            : "bg-zinc-800 text-zinc-600 border border-zinc-700"
                        }`}
                      >
                        {isDone ? "✓" : i + 1}
                      </span>
                      <span className={`truncate ${isDone ? "text-zinc-500 line-through" : "text-zinc-300 group-hover:text-zinc-100"}`}>
                        {t.title}
                      </span>
                    </a>
                  );
                })}
              </nav>
            </div>
          </aside>
        )}

        {/* Topics column */}
        <div className="space-y-4 min-w-0">
          {!signedIn && (
            <div className="rounded-xl border border-emerald-700/30 bg-emerald-950/20 px-4 py-3 flex items-center justify-between gap-3">
              <p className="text-xs text-emerald-200">
                <span className="font-semibold">Want to track your progress?</span> Sign in and we&apos;ll save which topics you&apos;ve read.
              </p>
              <Link
                href="/sign-in"
                className="shrink-0 text-xs px-3 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold whitespace-nowrap"
              >
                Sign in
              </Link>
            </div>
          )}

          {LEARN_TOPICS.map((t, i) => {
            const isDone = completed.has(t.id);
            const isPending = pendingIds.has(t.id);
            return (
              <article
                key={t.id}
                id={t.id}
                ref={isDone ? justCompletedRef : null}
                className={`rounded-2xl border p-5 sm:p-6 transition-all ${
                  isDone
                    ? "border-emerald-700/30 bg-emerald-950/10"
                    : "border-zinc-800 bg-zinc-900/40 hover:border-zinc-700"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="text-3xl shrink-0 leading-none mt-1" aria-hidden="true">{t.icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono text-zinc-600">#{i + 1}</span>
                      <h2 className={`text-lg sm:text-xl font-semibold ${isDone ? "text-emerald-200" : "text-zinc-100"}`}>
                        {t.title}
                      </h2>
                      {isDone && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                          ✓ READ
                        </span>
                      )}
                    </div>
                    <p className="mt-2 text-sm sm:text-base text-zinc-400 leading-relaxed">{t.body}</p>
                    {signedIn && (
                      <div className="mt-4">
                        <button
                          type="button"
                          onClick={() => toggle(t.id)}
                          disabled={pending && isPending}
                          className={`text-xs font-semibold px-3.5 py-1.5 rounded-full transition-all disabled:opacity-50 ${
                            isDone
                              ? "bg-zinc-800 hover:bg-zinc-700 text-zinc-300"
                              : "bg-emerald-600 hover:bg-emerald-500 text-white"
                          }`}
                        >
                          {isPending
                            ? "…"
                            : isDone
                            ? "Mark unread"
                            : "Got it ✓"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}

          {/* Completion celebration */}
          {signedIn && allDone && (
            <div className="rounded-2xl border border-emerald-500/40 bg-gradient-to-br from-emerald-950/40 via-zinc-900 to-zinc-950 p-6 sm:p-8 text-center mt-6">
              <div className="text-5xl mb-3">🎓</div>
              <h3 className="text-2xl font-bold text-white">Cannabis 101 — graduated.</h3>
              <p className="text-sm text-zinc-300 mt-2 max-w-md mx-auto">
                You&apos;ve read every topic. Come in and put it into practice — or browse the menu.
              </p>
              <div className="mt-5 flex flex-wrap justify-center gap-3">
                <Link
                  href="/menu"
                  className="inline-flex items-center gap-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 px-6 py-3 text-sm font-semibold text-white"
                >
                  Browse the menu →
                </Link>
                <Link
                  href="/visit"
                  className="inline-flex items-center gap-1.5 rounded-full border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-200 hover:bg-zinc-900"
                >
                  Plan a visit
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
