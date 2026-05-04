"use client";

// Public-site /apply — apply-to-work intake form.
//
// POSTs multipart/form-data to the inventoryapp /api/applications endpoint
// (canonical prod URL: inventoryapp-ivory.vercel.app, NOT inventoryapp.vercel.app
// — see reference_canonical_prod_urls memory). The endpoint handles CORS,
// rate-limits 3/hr/IP, sends a Resend ack email, persists the resume to Vercel
// Blob, and returns { ok: true, applicantId } on success.
//
// COMPLIANCE — frozen into both this form AND the inventoryapp API:
//  - NO photo upload (WA RCW 49.60 / EEOC pre-offer photo discrimination risk)
//  - NO SSN, NO DOB (post-offer only)
//  - 21+ confirmation is REQUIRED (WAC 314-55-115; cannabis retail floor)
// Don't add a photo field, "headshot" field, "selfie" field, or any pre-offer
// identifier beyond what's here. The API validates the same set; both layers
// must stay in lock-step or the API will silently 400.
//
// Cloudflare Turnstile: rendered when NEXT_PUBLIC_TURNSTILE_SITE_KEY is set.
// When unset, the widget is skipped — the inventoryapp API has its own
// in-memory rate-limit (3/hr/IP) as a backstop, and Doug can flip the env var
// on without redeploying the form.

import { useState, useRef, useEffect, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

const API_URL = "https://inventoryapp-ivory.vercel.app/api/applications";
const POSITIONS_API =
  "https://inventoryapp-ivory.vercel.app/api/positions/open?store=wenatchee";
const SOURCE_ORIGIN = "greenlife-web";
const MAX_RESUME_BYTES = 10 * 1024 * 1024; // 10MB (mirror API)

type Position = "budtender" | "inventory" | "lead" | "other";
type StorePref = "wenatchee" | "seattle" | "either";

// Shape returned by inventoryapp /api/positions/open. role_match values come
// from the canonical role taxonomy on the inventoryapp side ('budtender' |
// 'inventory_manager' | 'lead' | 'manager' | 'general_manager' | 'purchasing'
// | 'bookkeeper' | 'other'). The form's select uses a slightly narrower set
// so we map via mapRoleMatchToFormPosition() — anything we can't pre-select
// cleanly falls back to "other".
interface OpenPosition {
  id: string;
  title: string;
  role_match?: string | null;
  store_origin?: string | null;
  description_md?: string | null;
  pay_range?: string | null;
  hours_pattern?: string | null;
  posted_at?: string | null;
}

function mapRoleMatchToFormPosition(roleMatch: string | null | undefined): Position {
  switch (roleMatch) {
    case "budtender":
      return "budtender";
    case "inventory_manager":
    case "purchasing":
      return "inventory";
    case "lead":
    case "manager":
    case "general_manager":
      return "lead";
    default:
      return "other";
  }
}

interface Reference {
  name: string;
  relationship: string;
  phone: string;
  email: string;
}

const EMPTY_REF: Reference = { name: "", relationship: "", phone: "", email: "" };

declare global {
  interface Window {
    turnstile?: {
      render: (
        el: HTMLElement,
        opts: { sitekey: string; callback: (token: string) => void; "error-callback"?: () => void }
      ) => string;
      reset: (id?: string) => void;
    };
    onTurnstileLoad?: () => void;
  }
}

// Default export wraps the client component in a Suspense boundary so that
// `useSearchParams()` inside ApplyForm doesn't bail out the whole tree to
// client-render — Next.js 16 enforces this for any route that reads search
// params on the client. The fallback is a quiet skeleton that matches the
// final form's hero so there's no layout jump on hydration.
export default function ApplyPage() {
  return (
    <Suspense fallback={<ApplyFormSkeleton />}>
      <ApplyForm />
    </Suspense>
  );
}

function ApplyFormSkeleton() {
  return (
    <main className="min-h-[80vh] bg-stone-50 py-16">
      <div className="max-w-md mx-auto px-4 text-center">
        <p className="text-stone-500 text-sm">Loading application form…</p>
      </div>
    </main>
  );
}

function ApplyForm() {
  const searchParams = useSearchParams();
  const positionIdParam = searchParams.get("position");

  // Position deep-link state — when /careers links to /apply?position={id} we
  // fetch the position from inventoryapp, pre-select the closest role, show
  // a pill at the top of the form, and pass `positionId` along to the API.
  // Failure modes (fetch error, position no longer open) all fall back to the
  // standard form silently — the user can still submit a generic application.
  const [positionDeepLink, setPositionDeepLink] = useState<OpenPosition | null>(null);
  const [positionStaleNotice, setPositionStaleNotice] = useState(false);

  // Form state
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState<Position>("budtender");
  const [storePref, setStorePref] = useState<StorePref>("wenatchee");
  const [coverLetter, setCoverLetter] = useState("");
  // Personality prompts — written-only signal (no photo) per WA RCW 49.60 +
  // EEOC pre-offer guidance. Both optional; server clips at 500/1000 chars.
  const [productPitch, setProductPitch] = useState("");
  const [recoveryStory, setRecoveryStory] = useState("");
  const [availability, setAvailability] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [resumeError, setResumeError] = useState<string | null>(null);
  const [refs, setRefs] = useState<Reference[]>([{ ...EMPTY_REF }]);
  const [age21Confirmed, setAge21Confirmed] = useState(false);
  const [hasWaWorkerPermit, setHasWaWorkerPermit] = useState<boolean | null>(null);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const turnstileRef = useRef<HTMLDivElement>(null);
  const turnstileSiteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  // Load + render Cloudflare Turnstile when site-key is available. Script tag
  // is loaded once on mount; widget renders into the ref. If the script fails
  // (Cloudflare blocked, network drop), we silently skip and let the API
  // rate-limit handle abuse.
  useEffect(() => {
    if (!turnstileSiteKey || !turnstileRef.current) return;
    // If script already loaded (warm navigation), render directly.
    if (window.turnstile) {
      window.turnstile.render(turnstileRef.current, {
        sitekey: turnstileSiteKey,
        callback: (token) => setTurnstileToken(token),
        "error-callback": () => setTurnstileToken(null),
      });
      return;
    }
    const id = "cf-turnstile-script";
    if (document.getElementById(id)) return;
    const script = document.createElement("script");
    script.id = id;
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?onload=onTurnstileLoad";
    script.async = true;
    script.defer = true;
    window.onTurnstileLoad = () => {
      if (turnstileRef.current && window.turnstile) {
        window.turnstile.render(turnstileRef.current, {
          sitekey: turnstileSiteKey,
          callback: (token) => setTurnstileToken(token),
          "error-callback": () => setTurnstileToken(null),
        });
      }
    };
    document.head.appendChild(script);
  }, [turnstileSiteKey]);

  // Resolve `?position=` deep-link → fetch the matching position, pre-select
  // the role select, show a pill. AbortController on cleanup so a fast
  // unmount/navigate doesn't setState on an unmounted component. All failure
  // paths are silent — the form remains usable without pre-selection.
  useEffect(() => {
    if (!positionIdParam) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch(POSITIONS_API, { signal: ctrl.signal });
        if (!res.ok) return;
        const json = (await res.json().catch(() => null)) as
          | { positions?: OpenPosition[] }
          | null;
        if (!json || !Array.isArray(json.positions)) return;
        const match = json.positions.find((p) => p.id === positionIdParam);
        if (!match) {
          // Position id present in URL but not in the open-positions list —
          // either filled or pulled. Show a subtle "no longer open" notice so
          // the applicant knows why we didn't pre-fill, and let them apply
          // anyway with the default selection.
          setPositionStaleNotice(true);
          return;
        }
        setPositionDeepLink(match);
        setPosition(mapRoleMatchToFormPosition(match.role_match));
      } catch {
        // Network drop, CORS, parse error — silently fall back to the default
        // form. The applicant is unaffected.
      }
    })();
    return () => ctrl.abort();
  }, [positionIdParam]);

  const handleResumeChange = useCallback((file: File | null) => {
    setResumeError(null);
    if (!file) {
      setResume(null);
      return;
    }
    // PDF-only — match API contract. Some browsers report empty MIME on .pdf
    // upload (Safari sometimes), so check filename extension as a fallback.
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      setResumeError("Resume must be a PDF.");
      setResume(null);
      return;
    }
    if (file.size > MAX_RESUME_BYTES) {
      setResumeError("Resume must be 10MB or smaller.");
      setResume(null);
      return;
    }
    setResume(file);
  }, []);

  function updateRef(i: number, patch: Partial<Reference>) {
    setRefs((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)));
  }

  function addRef() {
    if (refs.length >= 3) return;
    setRefs((prev) => [...prev, { ...EMPTY_REF }]);
  }

  function removeRef(i: number) {
    setRefs((prev) => (prev.length === 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  // Client-side gates that mirror the server contract. Server-side is the
  // source of truth — these keep the user from a wasted round-trip on
  // obvious misses.
  const canSubmit =
    !submitting &&
    fullName.trim().length > 0 &&
    /^\S+@\S+\.\S+$/.test(email.trim()) &&
    phone.trim().length > 0 &&
    resume !== null &&
    refs[0].name.trim().length > 0 &&
    refs[0].phone.trim().length > 0 &&
    age21Confirmed;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError(null);

    if (!canSubmit || !resume) return;

    setSubmitting(true);

    const fd = new FormData();
    fd.append("fullName", fullName.trim());
    fd.append("email", email.trim());
    fd.append("phone", phone.trim());
    fd.append("positionInterestedIn", position);
    fd.append("storePreference", storePref);
    fd.append("coverLetter", coverLetter.trim());
    fd.append("productRecommendationPitch", productPitch.trim());
    fd.append("customerRecoveryStory", recoveryStory.trim());
    fd.append("availability", availability.trim());
    fd.append("age21Confirmed", String(age21Confirmed));
    if (hasWaWorkerPermit !== null) {
      fd.append("hasWaWorkerPermit", String(hasWaWorkerPermit));
    }
    // References — only include filled ones (first is required, others optional).
    const cleanedRefs = refs
      .map((r) => ({
        name: r.name.trim(),
        relationship: r.relationship.trim(),
        phone: r.phone.trim(),
        email: r.email.trim(),
      }))
      .filter((r) => r.name.length > 0);
    fd.append("references", JSON.stringify(cleanedRefs));
    fd.append("sourceOrigin", SOURCE_ORIGIN);
    // When the applicant arrived from /careers?position={id} and the position
    // resolved cleanly, pass the id along so the inventoryapp side can link
    // the application back to the posting. Field is omitted when there's no
    // deep-link or the position turned out to be no-longer-open. The
    // inventoryapp /api/applications endpoint may ignore positionId today —
    // that's fine; this wires the field for a follow-up server change.
    if (positionDeepLink) fd.append("positionId", positionDeepLink.id);
    if (turnstileToken) fd.append("turnstileToken", turnstileToken);
    fd.append("resume", resume, resume.name);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        body: fd,
        // No credentials — endpoint is public + CORS-enabled for our apex.
      });

      if (res.ok) {
        const json = (await res.json().catch(() => ({}))) as {
          ok?: boolean;
          applicantId?: string;
        };
        if (json.ok) {
          setSuccess(true);
          // Hard redirect so back-button doesn't restore form state with
          // the resume file intact (browsers can't repopulate File anyway).
          window.location.href = "/apply/thanks";
          return;
        }
        setSubmitError("We received your application but the server response looked off. Please email us if you don't hear back in 1–2 weeks.");
        return;
      }

      // Non-2xx — surface server message when present, otherwise generic.
      const errorJson = (await res.json().catch(() => null)) as { error?: string } | null;
      if (res.status === 429) {
        setSubmitError("Too many submissions from this network. Please wait an hour and try again, or email us.");
      } else if (res.status === 413) {
        setSubmitError("Your resume is too large. The limit is 10MB.");
      } else if (errorJson?.error && typeof errorJson.error === "string") {
        setSubmitError(errorJson.error);
      } else {
        setSubmitError(`We couldn't submit your application (server returned ${res.status}). Please try again or email us directly.`);
      }
    } catch (err) {
      // Network drop, CORS misconfig, DNS — all surface here.
      setSubmitError(
        err instanceof Error && err.message
          ? `Network issue: ${err.message}. Please try again.`
          : "Network issue. Please check your connection and try again."
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    // The redirect above is the primary success path; this is a fallback in
    // case the navigator was blocked.
    return (
      <main className="min-h-[80vh] bg-stone-50 py-16">
        <div className="max-w-md mx-auto px-4 text-center">
          <p className="text-stone-700">Thanks! Redirecting…</p>
          <Link href="/apply/thanks" className="text-green-700 underline mt-4 inline-block">
            Click here if nothing happens.
          </Link>
        </div>
      </main>
    );
  }

  return (
    <>
      {/* Page header — matches the gradient/dot-grid hero used across the site. */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10 sm:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Careers</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Apply to work with us</h1>
          <p className="text-green-300/80 mt-2 text-sm sm:text-base">
            Wenatchee or Seattle — we&apos;re always interested in great people.
          </p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-10">
          {/* ── Position deep-link pill (when /careers linked here with ?position=) ── */}
          {positionDeepLink && (
            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 p-4 flex items-start gap-3">
              <span
                aria-hidden
                className="mt-0.5 inline-flex w-7 h-7 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-800 text-sm font-bold"
              >
                ✓
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-wider text-green-700">
                  Applying for
                </p>
                <p className="text-sm font-semibold text-stone-900 mt-0.5">
                  {positionDeepLink.title}
                  {positionDeepLink.pay_range && (
                    <span className="text-stone-600 font-normal">
                      {" "}— {positionDeepLink.pay_range}
                    </span>
                  )}
                </p>
                <Link
                  href="/careers"
                  className="text-xs text-green-700 hover:text-green-800 underline mt-1 inline-block"
                >
                  ← Back to all open roles
                </Link>
              </div>
            </div>
          )}

          {/* ── Stale-link notice (id was in URL but position is no longer open) ── */}
          {positionStaleNotice && !positionDeepLink && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
              That role isn&apos;t open right now — feel free to apply for another. We&apos;ll match you up if a fit
              opens up.{" "}
              <Link href="/careers" className="underline font-semibold">
                See current openings →
              </Link>
            </div>
          )}

          <p className="text-stone-600 text-sm leading-relaxed mb-6">
            Tell us a bit about yourself, attach your resume, and share three references. We review every application
            and reach out within 1–2 weeks if there&apos;s a fit.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* ── Identity ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full name" required>
                <input
                  type="text"
                  required
                  autoComplete="name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                />
              </Field>
              <Field label="Email" required>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={inputClass}
                />
              </Field>
            </div>

            <Field label="Phone" required>
              <input
                type="tel"
                required
                autoComplete="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
              />
            </Field>

            {/* ── Position + store preference ── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Position interested in" required>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as Position)}
                  className={inputClass}
                >
                  <option value="budtender">Budtender</option>
                  <option value="inventory">Inventory / Receiving</option>
                  <option value="lead">Lead / Shift Lead</option>
                  <option value="other">Something else</option>
                </select>
              </Field>
              <Field label="Availability" hint="Full-time, part-time, weekends, etc.">
                <input
                  type="text"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value)}
                  className={inputClass}
                  placeholder="e.g. Part-time, weekends + evenings"
                />
              </Field>
            </div>

            <Field label="Store preference" required>
              <div className="grid grid-cols-3 gap-2">
                {(
                  [
                    { v: "wenatchee", l: "Wenatchee" },
                    { v: "seattle", l: "Seattle" },
                    { v: "either", l: "Either" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={opt.v}
                    className={`flex items-center justify-center px-3 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition-colors ${
                      storePref === opt.v
                        ? "border-green-700 bg-green-50 text-green-800"
                        : "border-stone-300 bg-white text-stone-700 hover:border-green-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="storePreference"
                      value={opt.v}
                      checked={storePref === opt.v}
                      onChange={() => setStorePref(opt.v)}
                      className="sr-only"
                    />
                    {opt.l}
                  </label>
                ))}
              </div>
            </Field>

            {/* ── Cover letter ── */}
            <Field
              label="Tell us about yourself"
              hint="Optional but encouraged — what draws you to retail cannabis, where you've worked, what you'd bring."
            >
              <textarea
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                rows={5}
                className={`${inputClass} resize-y`}
                placeholder="A few sentences is plenty."
              />
            </Field>

            {/* ── Resume ── */}
            <Field label="Resume (PDF)" required hint="Up to 10MB. PDF only.">
              <ResumeDrop file={resume} onFile={handleResumeChange} error={resumeError} />
            </Field>

            {/* ── Personality prompts (written-only — no photo per WA RCW 49.60 / EEOC) ── */}
            <Field label="What's a strain or product you'd love to recommend to a customer, and why?">
              <textarea
                value={productPitch}
                onChange={(e) => setProductPitch(e.target.value.slice(0, 500))}
                rows={4}
                maxLength={500}
                className={`${inputClass} resize-y`}
                placeholder="A few sentences is plenty."
              />
              <span className="block text-[11px] text-stone-400 mt-1">
                Optional — share as much or as little as you&apos;d like. {productPitch.length} / 500
              </span>
            </Field>

            <Field label="Tell us about a time you turned a frustrated customer into a happy one.">
              <textarea
                value={recoveryStory}
                onChange={(e) => setRecoveryStory(e.target.value.slice(0, 1000))}
                rows={5}
                maxLength={1000}
                className={`${inputClass} resize-y`}
                placeholder="What happened, what you did, how it landed."
              />
              <span className="block text-[11px] text-stone-400 mt-1">
                Optional — share as much or as little as you&apos;d like. {recoveryStory.length} / 1000
              </span>
            </Field>

            {/* ── References ── */}
            <div>
              <p className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                References <span className="text-red-600">*</span>
              </p>
              <p className="text-[11px] text-stone-400 mb-3">
                First reference required. Add up to 3 — past managers preferred.
              </p>
              <div className="space-y-3">
                {refs.map((r, i) => (
                  <div
                    key={i}
                    className="rounded-2xl border border-stone-200 bg-stone-50/40 p-4 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                        Reference {i + 1}
                        {i === 0 && <span className="text-red-600 ml-1">*</span>}
                      </span>
                      {refs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeRef(i)}
                          className="text-xs text-stone-400 hover:text-red-600 font-medium"
                        >
                          Remove
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <input
                        type="text"
                        placeholder="Name"
                        required={i === 0}
                        value={r.name}
                        onChange={(e) => updateRef(i, { name: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="text"
                        placeholder="Relationship (e.g. Past manager)"
                        value={r.relationship}
                        onChange={(e) => updateRef(i, { relationship: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="tel"
                        placeholder="Phone"
                        required={i === 0}
                        value={r.phone}
                        onChange={(e) => updateRef(i, { phone: e.target.value })}
                        className={inputClass}
                      />
                      <input
                        type="email"
                        placeholder="Email (optional)"
                        value={r.email}
                        onChange={(e) => updateRef(i, { email: e.target.value })}
                        className={inputClass}
                      />
                    </div>
                  </div>
                ))}
              </div>
              {refs.length < 3 && (
                <button
                  type="button"
                  onClick={addRef}
                  className="mt-3 inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-green-700 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                >
                  + Add another reference
                </button>
              )}
            </div>

            {/* ── WA worker permit (optional) ── */}
            <Field
              label="WA cannabis worker permit"
              hint="Optional — let us know if you already have one. We can help you get one if you don't."
            >
              <div className="flex gap-2">
                {(
                  [
                    { v: true, l: "Yes, I have one" },
                    { v: false, l: "Not yet" },
                  ] as const
                ).map((opt) => (
                  <label
                    key={String(opt.v)}
                    className={`flex-1 flex items-center justify-center px-3 py-2.5 rounded-xl border text-sm font-medium cursor-pointer transition-colors ${
                      hasWaWorkerPermit === opt.v
                        ? "border-green-700 bg-green-50 text-green-800"
                        : "border-stone-300 bg-white text-stone-600 hover:border-green-400"
                    }`}
                  >
                    <input
                      type="radio"
                      name="hasWaWorkerPermit"
                      checked={hasWaWorkerPermit === opt.v}
                      onChange={() => setHasWaWorkerPermit(opt.v)}
                      className="sr-only"
                    />
                    {opt.l}
                  </label>
                ))}
              </div>
            </Field>

            {/* ── 21+ confirmation (REQUIRED, big + prominent) ── */}
            <div
              className={`rounded-2xl border-2 p-5 transition-colors ${
                age21Confirmed
                  ? "border-green-600 bg-green-50/60"
                  : "border-stone-300 bg-stone-50"
              }`}
            >
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={age21Confirmed}
                  onChange={(e) => setAge21Confirmed(e.target.checked)}
                  className="mt-0.5 w-5 h-5 rounded border-stone-400 text-green-700 focus:ring-green-600 cursor-pointer shrink-0"
                  required
                />
                <span className="text-sm text-stone-800 leading-relaxed">
                  <span className="font-bold">I am 21 years of age or older.</span>{" "}
                  Required by Washington State (WAC 314-55-115) for cannabis retail employment.
                </span>
              </label>
            </div>

            {/* ── Cloudflare Turnstile (only when env var present) ── */}
            {turnstileSiteKey ? (
              <div ref={turnstileRef} className="flex justify-center" />
            ) : null}

            {/* ── Compliance footer ── */}
            <p className="text-[11px] text-stone-400 leading-relaxed">
              We don&apos;t collect photos, Social Security numbers, or birthdays at the application stage —
              that&apos;s post-offer paperwork only, per WA RCW 49.60 and EEOC pre-offer guidance.
            </p>

            {/* ── Submit + error ── */}
            {submitError && (
              <div
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
              >
                {submitError}
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full px-5 py-3.5 rounded-xl text-sm font-bold transition-colors shadow-sm ${
                canSubmit
                  ? "bg-green-700 hover:bg-green-600 text-white"
                  : "bg-stone-200 text-stone-400 cursor-not-allowed"
              }`}
            >
              {submitting ? "Submitting…" : "Send application"}
            </button>

            <p className="text-[11px] text-stone-400 text-center">
              By submitting, you confirm the information is accurate.
            </p>
          </form>
        </div>
      </main>
    </>
  );
}

// ── Shared inputs ─────────────────────────────────────────────────────────

const inputClass =
  "w-full px-3.5 py-2.5 rounded-xl border border-stone-300 bg-white text-stone-900 text-sm focus:outline-none focus:border-green-700 focus:ring-2 focus:ring-green-200";

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
        {label}
        {required && <span className="text-red-600 ml-1">*</span>}
      </span>
      {children}
      {hint && <span className="block text-[11px] text-stone-400 mt-1">{hint}</span>}
    </label>
  );
}

// Drag-and-drop resume picker. Falls back to a click-to-select when the user's
// browser doesn't fire the drop event (mobile Safari for example).
function ResumeDrop({
  file,
  onFile,
  error,
}: {
  file: File | null;
  onFile: (f: File | null) => void;
  error: string | null;
}) {
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          const f = e.dataTransfer.files?.[0];
          if (f) onFile(f);
        }}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className={`flex flex-col items-center justify-center gap-2 px-4 py-8 rounded-2xl border-2 border-dashed cursor-pointer transition-colors ${
          dragOver
            ? "border-green-700 bg-green-50"
            : file
              ? "border-green-500 bg-green-50/50"
              : "border-stone-300 bg-stone-50 hover:border-green-400 hover:bg-stone-100/60"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf,.pdf"
          onChange={(e) => onFile(e.target.files?.[0] ?? null)}
          className="hidden"
        />
        {file ? (
          <>
            <svg
              className="w-7 h-7 text-green-700"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm font-semibold text-stone-800">{file.name}</span>
            <span className="text-xs text-stone-500">
              {(file.size / 1024 / 1024).toFixed(2)} MB
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFile(null);
              }}
              className="text-xs text-stone-400 hover:text-red-600 mt-1"
            >
              Remove
            </button>
          </>
        ) : (
          <>
            <svg
              className="w-7 h-7 text-stone-400"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M7 16a4 4 0 01-.88-7.9 5 5 0 019.9-1.46A4.5 4.5 0 0117.5 16M9 13l3-3m0 0l3 3m-3-3v9"
              />
            </svg>
            <span className="text-sm font-semibold text-stone-700">
              Drop your resume PDF here
            </span>
            <span className="text-xs text-stone-500">or click to choose a file</span>
          </>
        )}
      </div>
      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
    </div>
  );
}
