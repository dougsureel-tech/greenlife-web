"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

// Canonical staff URL (brapp.*), not the Vercel-internal alias. Same fix
// pattern as apply/careers ports same-day. Sister of the canonical-URL arc.
const API_URL = "https://brapp.greenlifecannabis.com/api/vendor-access";
const STORE_ORIGIN = "wenatchee";

const ERROR_LABEL: Record<string, string> = {
  rate_limited: "We've had a few requests from your network already today — try again in an hour, or email us directly.",
  invalid_json: "Couldn't submit your request — try again, or email us directly.",
  missing_company_name: "Company name is required.",
  missing_contact_name: "Contact name is required.",
  invalid_email: "Enter a valid email address.",
  insert_failed: "Couldn't save your request — try again, or email us directly.",
};

export function VendorAccessForm() {
  const router = useRouter();
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [brandConfirmation, setBrandConfirmation] = useState("");
  const [intent, setIntent] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          companyName,
          contactName,
          email,
          phone: phone || null,
          brandConfirmation: brandConfirmation || null,
          intent: intent || null,
          storeOrigin: STORE_ORIGIN,
        }),
        signal: AbortSignal.timeout(15000),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(ERROR_LABEL[data.error ?? ""] ?? "Couldn't submit your request — try again, or email us.");
        setSubmitting(false);
        return;
      }
      router.push("/vendor-access/thanks");
    } catch {
      setError("Couldn't reach us — check your connection and try again.");
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <Field
        label="Company name"
        required
        value={companyName}
        onChange={setCompanyName}
        placeholder="e.g. Sungrown"
        autoComplete="organization"
      />
      <Field
        label="Your name"
        required
        value={contactName}
        onChange={setContactName}
        placeholder="First + last"
        autoComplete="name"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field
          label="Email"
          type="email"
          required
          value={email}
          onChange={setEmail}
          placeholder="you@brand.com"
        />
        <Field
          label="Phone (optional)"
          type="tel"
          value={phone}
          onChange={setPhone}
          placeholder="(509) ___-____"
        />
      </div>

      <Field
        label="Are you the brand, or do you represent it?"
        value={brandConfirmation}
        onChange={setBrandConfirmation}
        placeholder="e.g. I'm the founder · I run their wholesale · marketing rep"
      />

      <label className="block">
        <span className="text-sm font-semibold text-stone-700 mb-1.5 block">
          What do you want to upload or update?
        </span>
        <textarea
          value={intent}
          onChange={(e) => setIntent(e.target.value)}
          rows={4}
          placeholder="Logo · product photos · brand kit · update existing imagery · other"
          className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
        />
      </label>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting || !companyName || !contactName || !email}
        className="w-full inline-flex items-center justify-center px-5 py-3 rounded-xl bg-green-700 hover:bg-green-600 disabled:bg-stone-300 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors"
      >
        {submitting ? "Sending…" : "Request access"}
      </button>

      <p className="text-xs text-stone-500 text-center">
        We read every request ourselves. You&apos;ll hear back within two business days.
      </p>
    </form>
  );
}

function Field({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
  autoComplete,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  /** WHATWG autocomplete token (organization/name/email/tel/etc). When
   *  unset, falls back to type-based derivation. */
  autoComplete?: string;
}) {
  // Type-based fallback for email/tel; explicit override via prop wins.
  // Pre-fix text inputs (type=text) got `undefined` — browser autofill
  // + password managers couldn't suggest stored values. /vendor-access
  // "Company name" + "Your name" inputs were missing autoComplete.
  // Caught 2026-05-10 by /loop tick 58 form-autocomplete audit.
  const resolvedAutoComplete =
    autoComplete ??
    (type === "email" ? "email" : type === "tel" ? "tel" : undefined);
  return (
    <label className="block">
      <span className="text-sm font-semibold text-stone-700 mb-1.5 block">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </span>
      <input
        type={type}
        autoComplete={resolvedAutoComplete}
        inputMode={type === "email" ? "email" : type === "tel" ? "tel" : undefined}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full bg-white border border-stone-300 rounded-lg px-3 py-2.5 text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500"
      />
    </label>
  );
}
