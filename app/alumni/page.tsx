"use client";

import { useState, useMemo } from "react";
import { TEAM } from "@/lib/team";
import { STORE } from "@/lib/store";

// Self-serve alumni "soft login" page.
//
// Doug's spec 2026-05-02: alumni can create their own profile by typing a
// secret at the prompt. The secret is the first 4 letters of their first
// name (lowercased). The form does NOT tell them this — the prompt is
// vague on purpose so word-of-mouth ("Doug told me to put my first
// initials") is part of the gate. They evolve into the system over time.
//
// v1 limitations (no DB / no email infra on the public site yet):
//  - "Login" is client-side string match against the existing team.ts
//    alumni roster.
//  - "Sign up" form doesn't actually persist; on submit it opens the
//    user's mail client with a pre-filled message to Doug. He manually
//    updates lib/team.ts + adds the photo to public/team/.
//  - v2 (when public-site email infra ships): replace mailto with a real
//    API route that writes to a `featured_partners` table and uploads the
//    portrait to Vercel Blob.
//
// Why this is acceptable as v1: Doug needs a URL he can hand off TODAY;
// the page does the gating + collection right; the persistence is a
// 5-minute manual step until infra is ready.

// Build the secret table from team.ts. Only "alumni" era qualifies — current
// staff have other channels. Each entry: 4-letter lowercased prefix → member.
const ALUMNI_SECRETS = TEAM.filter((m) => m.era === "alumni").map((m) => ({
  secret: m.name.slice(0, 4).toLowerCase(),
  name: m.name,
  role: m.role,
}));

export default function AlumniLoginPage() {
  const [input, setInput] = useState("");
  const [matched, setMatched] = useState<{ name: string; role: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Form fields shown after match
  const [displayName, setDisplayName] = useState("");
  const [realName, setRealName] = useState("");
  const [email, setEmail] = useState("");
  const [bio, setBio] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleKnock(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const candidate = input.trim().toLowerCase();
    if (!candidate) {
      setError("Try again.");
      return;
    }
    const hit = ALUMNI_SECRETS.find((s) => s.secret === candidate);
    if (!hit) {
      // Stay vague on purpose — don't tell them what's wrong.
      setError("That doesn't match. Try again.");
      return;
    }
    setMatched({ name: hit.name, role: hit.role });
    setDisplayName(hit.name);
    setRealName(hit.name);
  }

  // Build the mailto: link for Doug. v1 backend.
  const mailtoHref = useMemo(() => {
    if (!matched) return "";
    const subject = encodeURIComponent(`Alumni profile signup — ${matched.name}`);
    const lines = [
      `Hi Doug,`,
      ``,
      `${displayName || matched.name} just signed in at greenlifecannabis.com/alumni:`,
      ``,
      `• Display name: ${displayName || "(none — use first name)"}`,
      `• Real name: ${realName || "(same as display)"}`,
      `• Role when active: ${matched.role}`,
      `• Email / contact: ${email || "(not provided)"}`,
      ``,
      `Bio (one-liner for the alumni grid):`,
      bio || "(not provided)",
      ``,
      `Photo: I'll send it separately, please use the avatar initials until then.`,
      ``,
      `— Sent via the Green Life alumni self-serve form`,
    ].join("\n");
    return `mailto:${STORE.email}?subject=${subject}&body=${encodeURIComponent(lines)}`;
  }, [matched, displayName, realName, email, bio]);

  function handleSignupSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    // The mailto link does the actual send. We just open it in a new
    // window so the page state survives if their mail client is slow.
    if (typeof window !== "undefined" && mailtoHref) {
      window.location.href = mailtoHref;
    }
  }

  return (
    <main className="min-h-[80vh] bg-stone-50 py-16 sm:py-24">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        {!matched ? (
          <KnockCard input={input} setInput={setInput} onSubmit={handleKnock} error={error} />
        ) : !submitted ? (
          <SignupCard
            matched={matched}
            displayName={displayName}
            setDisplayName={setDisplayName}
            realName={realName}
            setRealName={setRealName}
            email={email}
            setEmail={setEmail}
            bio={bio}
            setBio={setBio}
            onSubmit={handleSignupSubmit}
          />
        ) : (
          <ThanksCard matched={matched} mailtoHref={mailtoHref} />
        )}
      </div>
    </main>
  );
}

// ── Knock prompt (the gate) ────────────────────────────────────────────────

function KnockCard({
  input,
  setInput,
  onSubmit,
  error,
}: {
  input: string;
  setInput: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
}) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">Sign in</p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-2">
        Welcome back.
      </h1>
      <p className="text-stone-600 text-sm mt-3 leading-relaxed">
        If you&apos;re someone we&apos;ve worked with — staff past or present, or someone
        we&apos;ve featured — type your secret to sign in.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-3">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          className="w-full px-4 py-3 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-base font-mono tracking-wide focus:outline-none focus:border-green-700 focus:bg-white"
          placeholder=""
          aria-label="Sign-in secret"
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full px-4 py-3 rounded-xl bg-green-800 hover:bg-green-700 text-white text-sm font-bold transition-colors"
        >
          Sign in
        </button>
      </form>

      <p className="text-stone-400 text-xs mt-6 leading-relaxed">
        Not sure if you&apos;re on the list? Reach out to {STORE.email} and we&apos;ll point you in
        the right direction.
      </p>
    </div>
  );
}

// ── Signup form (post-match) ───────────────────────────────────────────────

function SignupCard({
  matched,
  displayName,
  setDisplayName,
  realName,
  setRealName,
  email,
  setEmail,
  bio,
  setBio,
  onSubmit,
}: {
  matched: { name: string; role: string };
  displayName: string;
  setDisplayName: (s: string) => void;
  realName: string;
  setRealName: (s: string) => void;
  email: string;
  setEmail: (s: string) => void;
  bio: string;
  setBio: (s: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-10">
      <p className="text-xs font-bold uppercase tracking-[0.18em] text-green-700">
        Welcome back, {matched.name}
      </p>
      <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight mt-2">
        Set up your profile.
      </h1>
      <p className="text-stone-600 text-sm mt-3 leading-relaxed">
        Quick info now, evolves over time. Your portrait can come later — just send it to{" "}
        {STORE.email} when you&apos;re ready.
      </p>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <Field label="Display name" hint="What we call you on the alumni page.">
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:border-green-700 focus:bg-white"
            required
          />
        </Field>
        <Field label="Real name" hint="If different — for our records, not public.">
          <input
            type="text"
            value={realName}
            onChange={(e) => setRealName(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:border-green-700 focus:bg-white"
          />
        </Field>
        <Field label="Email or phone" hint="So Doug can follow up about your portrait.">
          <input
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:border-green-700 focus:bg-white"
          />
        </Field>
        <Field label="One-liner (optional)" hint="A sentence about you. Edit anytime.">
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            rows={3}
            className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-stone-50 text-stone-900 text-sm focus:outline-none focus:border-green-700 focus:bg-white resize-none"
          />
        </Field>

        <button
          type="submit"
          className="w-full px-4 py-3 rounded-xl bg-green-800 hover:bg-green-700 text-white text-sm font-bold transition-colors"
        >
          Send to Doug →
        </button>
        <p className="text-stone-400 text-[11px] leading-relaxed">
          This opens your email client with a pre-filled note. Hit send and Doug picks it up from
          there. We&apos;ll wire real persistence soon — for now this is the cleanest path.
        </p>
      </form>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
        {label}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-stone-400 mt-1">{hint}</span>}
    </label>
  );
}

// ── Thanks (post-submit) ───────────────────────────────────────────────────

function ThanksCard({
  matched,
  mailtoHref,
}: {
  matched: { name: string; role: string };
  mailtoHref: string;
}) {
  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-8 sm:p-10 text-center">
      <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-800 mx-auto">
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7" aria-hidden="true">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
        </svg>
      </div>
      <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight mt-5">
        Thanks, {matched.name}.
      </h1>
      <p className="text-stone-600 text-sm mt-3 leading-relaxed">
        Your email client should have opened with the details. Hit send and Doug&apos;ll pick it
        up from there.
      </p>
      <p className="text-stone-500 text-xs mt-5 leading-relaxed">
        If nothing happened, your browser may have blocked it.{" "}
        <a href={mailtoHref} className="text-green-700 font-semibold hover:underline">
          Click here
        </a>{" "}
        to open it manually.
      </p>
      <a
        href="/"
        className="inline-block mt-7 px-5 py-2.5 rounded-xl border border-stone-300 hover:border-green-300 text-sm font-semibold text-stone-700 hover:text-green-700 transition-colors"
      >
        Back to the shop →
      </a>
    </div>
  );
}
