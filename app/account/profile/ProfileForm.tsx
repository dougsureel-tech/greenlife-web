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

  async function save() {
    setSaving(true);
    await fetch("/api/profile", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, phone, smsOptIn }),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-stone-700">Phone</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(509) 555-0100"
            className="w-full rounded-lg border border-stone-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        <div className="flex items-center justify-between py-2 border-t border-stone-100">
          <div>
            <div className="text-sm font-medium text-stone-800">SMS Notifications</div>
            <div className="text-xs text-stone-400">Get a text when your order is ready</div>
          </div>
          <button
            onClick={() => setSmsOptIn(!smsOptIn)}
            className={`relative w-11 h-6 rounded-full transition-colors ${smsOptIn ? "bg-green-600" : "bg-stone-200"}`}
          >
            <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${smsOptIn ? "translate-x-5" : ""}`} />
          </button>
        </div>
        <button
          onClick={save}
          disabled={saving}
          className="w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-medium text-sm transition-colors disabled:opacity-60"
        >
          {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
        </button>
      </div>

      <div className="rounded-xl border border-stone-200 bg-white p-5 space-y-3">
        <div className="text-sm font-medium text-stone-700">Account</div>
        <div className="text-sm text-stone-500">{user.email}</div>
        <SignOutButton redirectUrl="/">
          <button className="text-sm text-red-600 hover:text-red-500 font-medium">Sign out</button>
        </SignOutButton>
      </div>
    </div>
  );
}
