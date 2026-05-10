"use client";

import { useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import type { PortalUser } from "@/lib/portal";

export function ProfileForm({ user }: { user: PortalUser }) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [smsOptIn, setSmsOptIn] = useState(user.smsOptIn);
  const [emailOptIn, setEmailOptIn] = useState(user.emailOptIn);
  const [frequencyPref, setFrequencyPref] = useState<"low" | "standard" | "high">(user.frequencyPref ?? "standard");
  const [noSubstitutePref, setNoSubstitutePref] = useState(user.noSubstitutePref);
  const [heroesSelfAttestType, setHeroesSelfAttestType] = useState<string | null>(user.heroesSelfAttestType ?? null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, smsOptIn, emailOptIn, frequencyPref, noSubstitutePref, heroesSelfAttestType }),
      });
      if (!res.ok) throw new Error(`save failed (${res.status})`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("[profile] save failed", e instanceof Error ? e.name : String(e));
      setError("Couldn't save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Profile fields */}
      <div className="rounded-2xl border border-stone-200 bg-white divide-y divide-stone-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 space-y-1.5">
          <label
            htmlFor="profile-name"
            className="text-xs font-semibold uppercase tracking-wide text-stone-400 block"
          >
            Full Name
          </label>
          <input
            id="profile-name"
            type="text"
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full bg-transparent text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none"
          />
        </div>
        <div className="px-5 py-4 space-y-1.5">
          <label
            htmlFor="profile-phone"
            className="text-xs font-semibold uppercase tracking-wide text-stone-400 block"
          >
            Phone Number
          </label>
          <input
            id="profile-phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(509) 555-0100"
            className="w-full bg-transparent text-stone-900 text-sm placeholder:text-stone-300 focus:outline-none"
          />
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-stone-800">SMS Notifications</div>
            <div className="text-xs text-stone-400 mt-0.5">Text me when my order is ready</div>
          </div>
          <button type="button"
            onClick={() => setSmsOptIn(!smsOptIn)}
            aria-checked={smsOptIn}
            role="switch"
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${smsOptIn ? "bg-green-600" : "bg-stone-200"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${smsOptIn ? "translate-x-5" : ""}`}
            />
          </button>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-stone-800">Email Notifications</div>
            <div className="text-xs text-stone-400 mt-0.5">Email receipts + the monthly newsletter</div>
            <div className="text-[11px] text-green-700 mt-1">Either toggle on = 0.5 pt per $1 spent (vs 0.25)</div>
          </div>
          <button type="button"
            onClick={() => setEmailOptIn(!emailOptIn)}
            aria-checked={emailOptIn}
            role="switch"
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${emailOptIn ? "bg-green-600" : "bg-stone-200"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${emailOptIn ? "translate-x-5" : ""}`}
            />
          </button>
        </div>
        <div className="px-5 py-4 space-y-2">
          <div>
            <div className="text-sm font-medium text-stone-800">Update Frequency</div>
            <div className="text-xs text-stone-400 mt-0.5">
              How often you&apos;d like to hear from us. STOP works anytime.
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {([
              { value: "low", label: "Just essentials", sub: "≤2 / month" },
              { value: "standard", label: "Standard", sub: "≤4 / month" },
              { value: "high", label: "More updates", sub: "≤8 / month" },
            ] as const).map((opt) => {
              const selected = frequencyPref === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFrequencyPref(opt.value)}
                  aria-pressed={selected}
                  className={`rounded-xl border px-3 py-2.5 text-left transition-all ${
                    selected
                      ? "border-green-600 bg-green-50 text-green-900 shadow-sm"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <div className="text-xs font-semibold">{opt.label}</div>
                  <div className="text-[11px] mt-0.5 opacity-80">{opt.sub}</div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="px-5 py-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-medium text-stone-800">No Substitutions</div>
            <div className="text-xs text-stone-400 mt-0.5">Don&apos;t swap unavailable items — leave them off my order</div>
          </div>
          <button type="button"
            onClick={() => setNoSubstitutePref(!noSubstitutePref)}
            aria-checked={noSubstitutePref}
            role="switch"
            className={`relative w-11 h-6 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 ${noSubstitutePref ? "bg-green-600" : "bg-stone-200"}`}
          >
            <span
              className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${noSubstitutePref ? "translate-x-5" : ""}`}
            />
          </button>
        </div>
        <div className="px-5 py-4 space-y-2">
          <div>
            <div className="text-sm font-medium text-stone-800">Heroes Discount</div>
            <div className="text-xs text-stone-400 mt-0.5">
              Military, veterans, first responders, healthcare &amp; K-12 teachers.
              Bring your credential to verify at the counter — this just lets us know to expect it.
            </div>
          </div>
          <select
            value={heroesSelfAttestType ?? ""}
            onChange={(e) => setHeroesSelfAttestType(e.target.value || null)}
            className="w-full bg-stone-50 border border-stone-200 rounded-lg text-sm text-stone-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">None captured</option>
            <option value="active_military">Active Military</option>
            <option value="veteran">Veteran</option>
            <option value="first_responder">First Responder</option>
            <option value="healthcare">Healthcare Worker</option>
            <option value="k12_teacher">K-12 Teacher</option>
          </select>
        </div>
      </div>

      {/* Save button + confirmation */}
      <div className="space-y-2">
        <button type="button"
          onClick={save}
          disabled={saving}
          className={`w-full py-3 rounded-2xl font-semibold text-sm transition-all ${
            saved
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-green-700 hover:bg-green-600 text-white shadow-sm hover:-translate-y-0.5 disabled:opacity-60"
          }`}
        >
          {saved ? (
            <span className="flex items-center justify-center gap-2">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Saved!
            </span>
          ) : saving ? (
            "Saving…"
          ) : (
            "Save Changes"
          )}
        </button>
        {error && (
          <p className="text-xs text-red-600 text-center" role="alert">
            {error}
          </p>
        )}
      </div>

      {/* Account info */}
      <div className="rounded-2xl border border-stone-200 bg-white divide-y divide-stone-100 overflow-hidden shadow-sm">
        <div className="px-5 py-4 space-y-0.5">
          <div className="text-xs font-semibold uppercase tracking-wide text-stone-400">Email</div>
          <div className="text-sm text-stone-700">{user.email}</div>
        </div>
        <div className="px-5 py-4">
          <SignOutButton redirectUrl="/">
            <button className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors">
              Sign out of account
            </button>
          </SignOutButton>
        </div>
      </div>
    </div>
  );
}
