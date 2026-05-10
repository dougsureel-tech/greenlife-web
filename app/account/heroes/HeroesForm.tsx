"use client";

import { useState } from "react";

export type HeroesAttestType =
  | "active_military"
  | "veteran"
  | "first_responder"
  | "healthcare"
  | "k12_teacher"
  | null;

const OPTIONS: { value: HeroesAttestType; label: string; hint: string }[] = [
  {
    value: "active_military",
    label: "Active Military",
    hint: "Active-duty CAC, dependent ID, or unit roster",
  },
  {
    value: "veteran",
    label: "Veteran",
    hint: "VA card, DD-214, or state-issued veteran designation on driver’s license",
  },
  {
    value: "first_responder",
    label: "First Responder",
    hint: "Police / Fire / EMS — agency-issued ID or badge",
  },
  {
    value: "healthcare",
    label: "Healthcare Worker",
    hint: "RN / LPN / MD license, hospital badge, or pharmacy ID",
  },
  {
    value: "k12_teacher",
    label: "K–12 Teacher",
    hint: "School district staff ID — public or private",
  },
];

export function HeroesForm({ current }: { current: HeroesAttestType }) {
  const [selected, setSelected] = useState<HeroesAttestType>(current);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = selected !== current;

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/heroes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selected }),
      });
      if (!res.ok) throw new Error(`save failed (${res.status})`);
      setSaved(true);
      setTimeout(() => setSaved(false), 4000);
    } catch (e) {
      console.error("[heroes] save failed", e);
      setError("Couldn’t save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  const currentOption = OPTIONS.find((o) => o.value === (saved ? selected : current));

  return (
    <div className="space-y-4">
      {/* Saved confirmation banner */}
      {saved && (
        <div className="rounded-2xl bg-green-50 border border-green-200 px-5 py-4 flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-green-600 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <div className="font-bold text-green-800 text-sm">Got it — we’ll have it on file.</div>
            {selected ? (
              <div className="text-green-700/80 text-xs mt-0.5">
                Show your {currentOption?.label.toLowerCase()} ID when you come in.
              </div>
            ) : (
              <div className="text-green-700/80 text-xs mt-0.5">Heroes discount cleared from your profile.</div>
            )}
          </div>
        </div>
      )}

      {/* Options */}
      <div className="rounded-2xl border border-stone-200 bg-white overflow-hidden shadow-sm divide-y divide-stone-100">
        {OPTIONS.map((opt) => (
          <label
            key={opt.value}
            className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${
              selected === opt.value ? "bg-green-50" : "hover:bg-stone-50"
            }`}
          >
            <div className="mt-0.5 shrink-0">
              <div
                className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                  selected === opt.value
                    ? "border-green-600 bg-green-600"
                    : "border-stone-300"
                }`}
              >
                {selected === opt.value && (
                  <div className="w-1.5 h-1.5 rounded-full bg-white" />
                )}
              </div>
            </div>
            <input
              type="radio"
              name="heroes-type"
              value={opt.value ?? ""}
              checked={selected === opt.value}
              onChange={() => setSelected(opt.value)}
              className="sr-only"
            />
            <div className="min-w-0">
              <div className="text-sm font-semibold text-stone-800">{opt.label}</div>
              <div className="text-xs text-stone-400 mt-0.5">{opt.hint}</div>
            </div>
          </label>
        ))}

        {/* Clear option */}
        <label
          className={`flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors ${
            selected === null ? "bg-stone-50" : "hover:bg-stone-50"
          }`}
        >
          <div className="mt-0.5 shrink-0">
            <div
              className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-colors ${
                selected === null ? "border-stone-500 bg-stone-500" : "border-stone-300"
              }`}
            >
              {selected === null && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
            </div>
          </div>
          <input
            type="radio"
            name="heroes-type"
            value=""
            checked={selected === null}
            onChange={() => setSelected(null)}
            className="sr-only"
          />
          <div className="min-w-0">
            <div className="text-sm font-semibold text-stone-500">None / prefer not to say</div>
            <div className="text-xs text-stone-400 mt-0.5">Clear this from your profile</div>
          </div>
        </label>
      </div>

      {/* Show-your-card callout */}
      {selected && (
        <div className="rounded-2xl bg-amber-50 border border-amber-200 px-5 py-4 flex items-start gap-3">
          <span className="text-lg shrink-0 mt-0.5" aria-hidden="true">🪪</span>
          <div>
            <div className="text-sm font-semibold text-amber-900">Bring your ID when you visit</div>
            <div className="text-xs text-amber-700/80 mt-0.5 leading-relaxed">
              We’ll need to see your {OPTIONS.find((o) => o.value === selected)?.label.toLowerCase()} ID at the
              counter to apply the discount. Cash only at pickup.
            </div>
          </div>
        </div>
      )}

      {/* Save */}
      <div className="space-y-2">
        <button type="button"
          onClick={save}
          disabled={saving || !dirty}
          className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${
            saved
              ? "bg-green-50 text-green-700 border border-green-200"
              : dirty
                ? "bg-green-700 hover:bg-green-600 text-white shadow-sm hover:-translate-y-0.5"
                : "bg-stone-100 text-stone-400 cursor-not-allowed"
          } disabled:opacity-60`}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </span>
          ) : saving ? (
            "Saving…"
          ) : (
            "Save"
          )}
        </button>
        {error && (
          <p className="text-xs text-red-600 text-center" role="alert">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
