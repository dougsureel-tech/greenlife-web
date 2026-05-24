"use client";

import { useState } from "react";
import {
  normalizeHandle,
  verifyHandleUrl,
  parsePayoutMode,
  validateApplyForm,
  type PayoutMode,
} from "@/lib/ambassador-apply";

// Client island for the Ambassador apply form. Posts a single multipart
// form to /api/community/ambassador-apply. Heavy use of progressive
// validation: pure-fn validators from lib/ambassador-apply run in-browser
// BEFORE the network round-trip so most rejections happen client-side
// without burning rate-limit budget. Server then re-validates with the
// SAME pure fns (no client/server drift class).
//
// Multipart fields posted:
//   firstName · lastName? · email · phone · zip
//   instagramHandle · instagramFollowers
//   tiktokHandle? · tiktokFollowers?
//   youtubeHandle? · youtubeFollowers?
//   payoutMode (store_credit | cash_with_w9)
//   ageAttested ("true")
//   contractAccepted ("true")
//   publicListingOptIn ("true" | "false")
//   openText?
//   instagramScreenshot (File, image/* required)
//   driverLicense (File, image/*)
//   w9 (File, optional — required iff payoutMode==="cash_with_w9")
//
// State machine: idle → submitting → ok | error

type Status = "idle" | "submitting" | "ok" | "error";

export function ApplyForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState<string | null>(null);

  // Text inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [zip, setZip] = useState("");
  const [igHandle, setIgHandle] = useState("");
  const [igFollowers, setIgFollowers] = useState("");
  const [igVerifyUrl, setIgVerifyUrl] = useState<string | null>(null);
  const [tiktokHandle, setTiktokHandle] = useState("");
  const [tiktokFollowers, setTiktokFollowers] = useState("");
  const [youtubeHandle, setYoutubeHandle] = useState("");
  const [youtubeFollowers, setYoutubeFollowers] = useState("");
  const [openText, setOpenText] = useState("");

  // Radio + checkbox state
  const [payoutMode, setPayoutMode] = useState<PayoutMode>("store_credit");
  const [ageAttested, setAgeAttested] = useState(false);
  const [contractAccepted, setContractAccepted] = useState(false);
  const [publicListingOptIn, setPublicListingOptIn] = useState(false);

  // File inputs
  const [igScreenshot, setIgScreenshot] = useState<File | null>(null);
  const [driverLicense, setDriverLicense] = useState<File | null>(null);
  const [w9File, setW9File] = useState<File | null>(null);

  function onIgBlur() {
    const norm = normalizeHandle(igHandle);
    setIgVerifyUrl(norm ? verifyHandleUrl("instagram", norm) : null);
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setMsg(null);

    // Client-side pure-fn validation. SAME validator runs server-side, so
    // these errors mirror what the API would return — no drift.
    const err = validateApplyForm({
      firstName,
      lastName,
      email,
      phone,
      zip,
      igHandle,
      igFollowers,
      payoutMode,
      ageAttested,
      contractAccepted,
    });
    if (err) {
      setStatus("error");
      setMsg(err);
      return;
    }

    // Required file uploads (mode-conditional).
    if (!igScreenshot) {
      setStatus("error");
      setMsg("Instagram profile screenshot required (1 image, JPG/PNG).");
      return;
    }
    if (!driverLicense) {
      setStatus("error");
      setMsg("Add a photo of your driver's license so we can confirm you're 21+.");
      return;
    }
    if (payoutMode === "cash_with_w9" && !w9File) {
      setStatus("error");
      setMsg("W-9 form required for cash payout (PDF or JPG/PNG).");
      return;
    }

    try {
      const form = new FormData();
      form.set("firstName", firstName.trim());
      if (lastName.trim()) form.set("lastName", lastName.trim());
      form.set("email", email.trim());
      form.set("phone", phone.trim());
      form.set("zip", zip.trim());
      form.set("instagramHandle", igHandle.trim());
      form.set("instagramFollowers", igFollowers.trim());
      if (tiktokHandle.trim()) form.set("tiktokHandle", tiktokHandle.trim());
      if (tiktokFollowers.trim()) form.set("tiktokFollowers", tiktokFollowers.trim());
      if (youtubeHandle.trim()) form.set("youtubeHandle", youtubeHandle.trim());
      if (youtubeFollowers.trim()) form.set("youtubeFollowers", youtubeFollowers.trim());
      form.set("payoutMode", payoutMode);
      form.set("ageAttested", "true");
      form.set("contractAccepted", "true");
      form.set("publicListingOptIn", publicListingOptIn ? "true" : "false");
      if (openText.trim()) form.set("openText", openText.trim());
      form.set("instagramScreenshot", igScreenshot);
      form.set("driverLicense", driverLicense);
      if (w9File) form.set("w9", w9File);

      const res = await fetch("/api/community/ambassador-apply", {
        method: "POST",
        body: form,
      });
      const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;

      if (!res.ok) {
        setStatus("error");
        setMsg((json.error as string) ?? "Couldn't submit. Try again.");
        return;
      }

      // Redirect to the thanks page on success.
      window.location.href = "/community/ambassador/apply/thanks";
    } catch {
      setStatus("error");
      setMsg("Couldn't reach us — check your connection and try again.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      {/* Name */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-stone-900" htmlFor="firstName">
            First name <span className="text-red-600">*</span>
          </label>
          <input
            id="firstName"
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            maxLength={80}
            required
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-stone-900" htmlFor="lastName">
            Last name {payoutMode === "cash_with_w9" ? <span className="text-red-600">*</span> : <span className="text-stone-400">(optional)</span>}
          </label>
          <input
            id="lastName"
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            maxLength={80}
            required={payoutMode === "cash_with_w9"}
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
          />
        </div>
      </div>

      {/* Email + phone + zip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5 sm:col-span-2">
          <label className="block text-sm font-bold text-stone-900" htmlFor="email">
            Email <span className="text-red-600">*</span>
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            maxLength={254}
            required
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-stone-900" htmlFor="phone">
            Phone <span className="text-red-600">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            maxLength={30}
            required
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-stone-900" htmlFor="zip">
          ZIP <span className="text-red-600">*</span>
        </label>
        <input
          id="zip"
          type="text"
          value={zip}
          onChange={(e) => setZip(e.target.value)}
          maxLength={10}
          required
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
        />
      </div>

      {/* Instagram */}
      <fieldset className="space-y-3 rounded-xl bg-stone-50 border border-stone-200 p-4">
        <legend className="text-sm font-bold text-stone-900 px-2">
          Instagram <span className="text-red-600">*</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700" htmlFor="igHandle">
              Handle (no @)
            </label>
            <input
              id="igHandle"
              type="text"
              value={igHandle}
              onChange={(e) => setIgHandle(e.target.value)}
              onBlur={onIgBlur}
              maxLength={30}
              required
              placeholder="sarah_k"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
            />
            {igVerifyUrl && (
              <a
                href={igVerifyUrl}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs text-green-700 underline hover:text-green-800"
              >
                Verify: {igVerifyUrl} →
              </a>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-stone-700" htmlFor="igFollowers">
              Followers (try 12K, 1.5M, 12500)
            </label>
            <input
              id="igFollowers"
              type="text"
              value={igFollowers}
              onChange={(e) => setIgFollowers(e.target.value)}
              maxLength={20}
              required
              placeholder="12K"
              className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-stone-700" htmlFor="igScreenshot">
            Profile screenshot (showing follower count) <span className="text-red-600">*</span>
          </label>
          <input
            id="igScreenshot"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
            onChange={(e) => setIgScreenshot(e.target.files?.[0] ?? null)}
            required
            className="w-full text-sm text-stone-700 file:mr-3 file:rounded-xl file:border-0 file:bg-green-700 file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-green-600"
          />
        </div>
      </fieldset>

      {/* TikTok (optional) */}
      <fieldset className="space-y-3 rounded-xl bg-stone-50 border border-stone-200 p-4">
        <legend className="text-sm font-bold text-stone-900 px-2">
          TikTok <span className="text-stone-400">(optional)</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={tiktokHandle}
            onChange={(e) => setTiktokHandle(e.target.value)}
            maxLength={30}
            placeholder="Handle (no @)"
            aria-label="TikTok handle"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
          />
          <input
            type="text"
            value={tiktokFollowers}
            onChange={(e) => setTiktokFollowers(e.target.value)}
            maxLength={20}
            placeholder="Followers (12K, 1.5M)"
            aria-label="TikTok followers"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
          />
        </div>
      </fieldset>

      {/* YouTube (optional) */}
      <fieldset className="space-y-3 rounded-xl bg-stone-50 border border-stone-200 p-4">
        <legend className="text-sm font-bold text-stone-900 px-2">
          YouTube <span className="text-stone-400">(optional)</span>
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            type="text"
            value={youtubeHandle}
            onChange={(e) => setYoutubeHandle(e.target.value)}
            maxLength={30}
            placeholder="Handle (no @)"
            aria-label="YouTube handle"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
          />
          <input
            type="text"
            value={youtubeFollowers}
            onChange={(e) => setYoutubeFollowers(e.target.value)}
            maxLength={20}
            placeholder="Subscribers (12K, 1.5M)"
            aria-label="YouTube subscribers"
            className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
          />
        </div>
      </fieldset>

      {/* Payout mode */}
      <fieldset className="space-y-3">
        <legend className="text-sm font-bold text-stone-900">
          How should we pay you?
        </legend>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label
            className={`cursor-pointer rounded-xl border p-4 transition-colors ${
              payoutMode === "store_credit"
                ? "border-green-600 bg-green-50"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <input
              type="radio"
              name="payoutMode"
              value="store_credit"
              checked={payoutMode === "store_credit"}
              onChange={() => setPayoutMode(parsePayoutMode("store_credit"))}
              className="sr-only"
            />
            <div className="font-bold text-stone-900 text-sm">Store credit (default)</div>
            <div className="text-stone-600 text-xs mt-1">
              Credit applies on your next visit. No W-9 needed.
            </div>
          </label>
          <label
            className={`cursor-pointer rounded-xl border p-4 transition-colors ${
              payoutMode === "cash_with_w9"
                ? "border-green-600 bg-green-50"
                : "border-stone-200 bg-white hover:border-stone-300"
            }`}
          >
            <input
              type="radio"
              name="payoutMode"
              value="cash_with_w9"
              checked={payoutMode === "cash_with_w9"}
              onChange={() => setPayoutMode(parsePayoutMode("cash_with_w9"))}
              className="sr-only"
            />
            <div className="font-bold text-stone-900 text-sm">Cash, with W-9</div>
            <div className="text-stone-600 text-xs mt-1">
              Cash payout via ACH. Requires W-9 + full last name. Year-end 1099-NEC if total &gt; $600.
            </div>
          </label>
        </div>
      </fieldset>

      {/* DL upload */}
      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-stone-900" htmlFor="dl">
          Driver&apos;s license (age verification) <span className="text-red-600">*</span>
        </label>
        <input
          id="dl"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={(e) => setDriverLicense(e.target.files?.[0] ?? null)}
          required
          className="w-full text-sm text-stone-700 file:mr-3 file:rounded-xl file:border-0 file:bg-green-700 file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-green-600"
        />
        <p className="text-xs text-stone-500">
          Used once to verify 21+. Stored privately; never shared or republished.
        </p>
      </div>

      {/* W-9 upload (conditional) */}
      {payoutMode === "cash_with_w9" && (
        <div className="space-y-1.5">
          <label className="block text-sm font-bold text-stone-900" htmlFor="w9">
            W-9 form <span className="text-red-600">*</span>
          </label>
          <input
            id="w9"
            type="file"
            accept="application/pdf,image/jpeg,image/png"
            onChange={(e) => setW9File(e.target.files?.[0] ?? null)}
            required
            className="w-full text-sm text-stone-700 file:mr-3 file:rounded-xl file:border-0 file:bg-green-700 file:px-4 file:py-2 file:text-white file:font-semibold hover:file:bg-green-600"
          />
          <p className="text-xs text-stone-500">
            Download a blank W-9 from{" "}
            <a
              href="https://www.irs.gov/pub/irs-pdf/fw9.pdf"
              target="_blank"
              rel="noreferrer noopener"
              className="underline text-green-700"
            >
              IRS.gov
            </a>{" "}
            and upload here. PDF or photo OK.
          </p>
        </div>
      )}

      {/* Open text */}
      <div className="space-y-1.5">
        <label className="block text-sm font-bold text-stone-900" htmlFor="openText">
          What brought you here? <span className="text-stone-400">(optional)</span>
        </label>
        <textarea
          id="openText"
          value={openText}
          onChange={(e) => setOpenText(e.target.value)}
          maxLength={1000}
          rows={3}
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-stone-900"
        />
        <p className="text-xs text-stone-500">{openText.length} / 1000</p>
      </div>

      {/* Age attestation */}
      <label className="flex items-start gap-3 cursor-pointer rounded-xl bg-amber-50 border border-amber-200 p-4">
        <input
          type="checkbox"
          checked={ageAttested}
          onChange={(e) => setAgeAttested(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm text-amber-900 leading-relaxed">
          I&apos;m 21+. (WSLCB requires this — no exceptions.)
        </span>
      </label>

      {/* Contract acceptance */}
      <label className="flex items-start gap-3 cursor-pointer rounded-xl bg-green-50 border border-green-200 p-4">
        <input
          type="checkbox"
          checked={contractAccepted}
          onChange={(e) => setContractAccepted(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm text-green-900 leading-relaxed">
          I have read the four clauses above + agree to the Independent-Contractor Relationship
          Agreement as an independent creator (not as an employee).
        </span>
      </label>

      {/* Phase G opt-in */}
      <label className="flex items-start gap-3 cursor-pointer rounded-xl bg-stone-50 border border-stone-200 p-4">
        <input
          type="checkbox"
          checked={publicListingOptIn}
          onChange={(e) => setPublicListingOptIn(e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm text-stone-800 leading-relaxed">
          Add me to the public ambassador list at /community/ambassadors
          <span className="text-stone-500"> (first name + last initial only; you can opt out anytime).</span>
        </span>
      </label>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-xl bg-green-700 hover:bg-green-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3 transition-colors"
      >
        {status === "submitting" ? "Sending…" : "Send application"}
      </button>

      {msg && (
        <p
          role="status"
          className={`text-sm font-semibold ${status === "error" ? "text-red-700" : "text-green-700"}`}
        >
          {msg}
        </p>
      )}
    </form>
  );
}
