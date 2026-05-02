"use client";

import { useState } from "react";
import { SignOutButton } from "@clerk/nextjs";
import type { PortalUser } from "@/lib/portal";

export function ProfileForm({ user }: { user: PortalUser }) {
  const [name, setName] = useState(user.name ?? "");
  const [phone, setPhone] = useState(user.phone ?? "");
  const [smsOptIn, setSmsOptIn] = useState(user.smsOptIn);
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
        body: JSON.stringify({ name, phone, smsOptIn }),
      });
      if (!res.ok) throw new Error(`save failed (${res.status})`);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      console.error("[profile] save failed", e);
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
          <button
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
      </div>

      {/* Save button + confirmation */}
      <div className="space-y-2">
        <button
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
