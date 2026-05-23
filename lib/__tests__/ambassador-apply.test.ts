// Pin tests for lib/ambassador-apply.ts — Ambassador Program v0.2 Phase F
// apply-form pure helpers. File is byte-identical between GLW + SCC
// (lockstep file per file header); these tests run on both stacks.
//
// Coverage:
//   1. parseFollowerCount — K/M shorthand + plain numbers + edge cases
//   2. normalizeHandle — strip @ + URL prefix + lowercase + length bounds
//   3. verifyHandleUrl — per-platform URL shape
//   4. parsePayoutMode — safe-default to "store_credit"
//   5. isValidEmail / isValidPhone / normalizeZip — shape validation
//   6. firstNameLastInitial — privacy mask + edge cases
//   7. resolveFollowerTierFromCount — tier bands + boundary semantics
//   8. tierBadgeEmoji — exhaustive enum dispatch
//   9. validateApplyForm — required-field gating + cash_with_w9 last-name rule
//  10. constants — AMBASSADOR_CONTRACT_VERSION + AMBASSADOR_YTD_CAP_CENTS pins
//  11. lockstep file invariant (header comment present)
//  12. PII-safety — no medical/efficacy vocab in source

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import {
  parseFollowerCount,
  normalizeHandle,
  verifyHandleUrl,
  parsePayoutMode,
  isValidEmail,
  isValidPhone,
  normalizeZip,
  firstNameLastInitial,
  resolveFollowerTierFromCount,
  tierBadgeEmoji,
  validateApplyForm,
  AMBASSADOR_CONTRACT_VERSION,
  AMBASSADOR_YTD_CAP_CENTS,
  FOLLOWER_TIER_THRESHOLDS,
} from "../ambassador-apply.ts";

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC = readFileSync(join(__dirname, "..", "ambassador-apply.ts"), "utf8");

// ── 1. parseFollowerCount ──────────────────────────────────────────────

test("parseFollowerCount: plain integer", () => {
  assert.equal(parseFollowerCount("12345"), 12345);
  assert.equal(parseFollowerCount("0"), 0);
});

test("parseFollowerCount: K shorthand", () => {
  assert.equal(parseFollowerCount("12K"), 12000);
  assert.equal(parseFollowerCount("12k"), 12000);
  assert.equal(parseFollowerCount("12.5K"), 12500);
  assert.equal(parseFollowerCount(".5K"), 500);
});

test("parseFollowerCount: M shorthand", () => {
  assert.equal(parseFollowerCount("1M"), 1_000_000);
  assert.equal(parseFollowerCount("1.5M"), 1_500_000);
  assert.equal(parseFollowerCount("1m"), 1_000_000);
});

test("parseFollowerCount: commas + whitespace tolerated", () => {
  assert.equal(parseFollowerCount(" 12,345 "), 12345);
  assert.equal(parseFollowerCount("12,500"), 12500);
  assert.equal(parseFollowerCount("1,000,000"), 1_000_000);
});

test("parseFollowerCount: invalid input rejected", () => {
  assert.equal(parseFollowerCount(""), null);
  assert.equal(parseFollowerCount("  "), null);
  assert.equal(parseFollowerCount("abc"), null);
  assert.equal(parseFollowerCount("1.5KK"), null);
  assert.equal(parseFollowerCount("1.5XX"), null);
  assert.equal(parseFollowerCount("K"), null);
  assert.equal(parseFollowerCount("1.5.5K"), null);
  assert.equal(parseFollowerCount(null), null);
  assert.equal(parseFollowerCount(undefined), null);
});

test("parseFollowerCount: bounds — negatives + 1B+ rejected", () => {
  assert.equal(parseFollowerCount("-5"), null); // regex doesn't allow leading minus
  assert.equal(parseFollowerCount("2000000000"), null); // >1B
});

// ── 2. normalizeHandle ─────────────────────────────────────────────────

test("normalizeHandle: strip @ + lowercase", () => {
  assert.equal(normalizeHandle("@Sarah"), "sarah");
  assert.equal(normalizeHandle("Sarah"), "sarah");
  assert.equal(normalizeHandle("  @sarah  "), "sarah");
});

test("normalizeHandle: strip URL prefixes for IG/TikTok/YouTube", () => {
  assert.equal(normalizeHandle("https://instagram.com/sarah"), "sarah");
  assert.equal(normalizeHandle("https://www.instagram.com/sarah/"), "sarah");
  assert.equal(normalizeHandle("https://www.tiktok.com/@sarah"), "sarah");
  assert.equal(normalizeHandle("youtube.com/c/sarah"), "sarah");
  assert.equal(normalizeHandle("youtube.com/@sarah"), "sarah");
});

test("normalizeHandle: querystring / fragment stripped", () => {
  assert.equal(normalizeHandle("https://instagram.com/sarah?foo=bar"), "sarah");
  assert.equal(normalizeHandle("instagram.com/sarah#bio"), "sarah");
});

test("normalizeHandle: invalid input rejected", () => {
  assert.equal(normalizeHandle(""), null);
  assert.equal(normalizeHandle("   "), null);
  assert.equal(normalizeHandle("@"), null);
  assert.equal(normalizeHandle("has space"), null);
  assert.equal(normalizeHandle("a".repeat(31)), null); // >30 chars
  assert.equal(normalizeHandle(null), null);
});

test("normalizeHandle: allowed chars only (a-z0-9._)", () => {
  assert.equal(normalizeHandle("sarah_k"), "sarah_k");
  assert.equal(normalizeHandle("sarah.k"), "sarah.k");
  assert.equal(normalizeHandle("sarah-k"), null); // hyphen NOT allowed (IG-style)
});

// ── 3. verifyHandleUrl ─────────────────────────────────────────────────

test("verifyHandleUrl: IG / TikTok / YouTube URL shape", () => {
  assert.equal(verifyHandleUrl("instagram", "sarah"), "https://www.instagram.com/sarah");
  assert.equal(verifyHandleUrl("tiktok", "sarah"), "https://www.tiktok.com/@sarah");
  assert.equal(verifyHandleUrl("youtube", "sarah"), "https://www.youtube.com/@sarah");
});

test("verifyHandleUrl: null handle returns null", () => {
  assert.equal(verifyHandleUrl("instagram", null), null);
  assert.equal(verifyHandleUrl("instagram", ""), null);
  assert.equal(verifyHandleUrl("instagram", "has space"), null);
});

// ── 4. parsePayoutMode ─────────────────────────────────────────────────

test("parsePayoutMode: cash_with_w9 + safe defaults", () => {
  assert.equal(parsePayoutMode("cash_with_w9"), "cash_with_w9");
  assert.equal(parsePayoutMode("store_credit"), "store_credit");
  assert.equal(parsePayoutMode("anything-else"), "store_credit");
  assert.equal(parsePayoutMode(null), "store_credit");
  assert.equal(parsePayoutMode(undefined), "store_credit");
});

// ── 5. shape validators ────────────────────────────────────────────────

test("isValidEmail: shape", () => {
  assert.equal(isValidEmail("a@b.co"), true);
  assert.equal(isValidEmail("sarah.k@example.com"), true);
  assert.equal(isValidEmail("plainstring"), false);
  assert.equal(isValidEmail("a@b"), false);
  assert.equal(isValidEmail(""), false);
  assert.equal(isValidEmail(null), false);
});

test("isValidPhone: digit count", () => {
  assert.equal(isValidPhone("(509) 663-9980"), true);
  assert.equal(isValidPhone("+15096639980"), true);
  assert.equal(isValidPhone("5096639980"), true);
  assert.equal(isValidPhone("509-663"), false); // 6 digits
  assert.equal(isValidPhone(""), false);
  assert.equal(isValidPhone(null), false);
});

test("normalizeZip: 5 or 5+4", () => {
  assert.equal(normalizeZip("98801"), "98801");
  assert.equal(normalizeZip("98801-1234"), "98801-1234");
  assert.equal(normalizeZip(" 98801 "), "98801");
  assert.equal(normalizeZip("1234"), null);
  assert.equal(normalizeZip("abcde"), null);
  assert.equal(normalizeZip(null), null);
});

// ── 6. firstNameLastInitial ────────────────────────────────────────────

test("firstNameLastInitial: privacy mask", () => {
  assert.equal(firstNameLastInitial("Sarah Kim"), "Sarah K.");
  assert.equal(firstNameLastInitial("Sarah"), "Sarah"); // single name, no period
  assert.equal(firstNameLastInitial("  Sarah Kim  "), "Sarah K.");
  assert.equal(firstNameLastInitial("Sarah  Kim"), "Sarah K."); // multi-space safe
  assert.equal(firstNameLastInitial(""), "");
  assert.equal(firstNameLastInitial(null), "");
  assert.equal(firstNameLastInitial("Sarah-Jane Kim"), "Sarah-Jane K.");
});

// ── 7. resolveFollowerTierFromCount ────────────────────────────────────

test("resolveFollowerTierFromCount: boundary semantics", () => {
  assert.equal(resolveFollowerTierFromCount(null), "standard");
  assert.equal(resolveFollowerTierFromCount(0), "standard");
  assert.equal(resolveFollowerTierFromCount(9999), "standard");
  assert.equal(resolveFollowerTierFromCount(10000), "silver");
  assert.equal(resolveFollowerTierFromCount(49999), "silver");
  assert.equal(resolveFollowerTierFromCount(50000), "gold");
  assert.equal(resolveFollowerTierFromCount(99999), "gold");
  assert.equal(resolveFollowerTierFromCount(100000), "platinum");
  assert.equal(resolveFollowerTierFromCount(1_000_000), "platinum");
});

test("resolveFollowerTierFromCount: invalid → standard", () => {
  assert.equal(resolveFollowerTierFromCount(-1), "standard");
  assert.equal(resolveFollowerTierFromCount(Number.NaN), "standard");
  assert.equal(resolveFollowerTierFromCount(Number.POSITIVE_INFINITY), "standard");
});

// ── 8. tierBadgeEmoji ──────────────────────────────────────────────────

test("tierBadgeEmoji: exhaustive enum", () => {
  assert.equal(tierBadgeEmoji("standard"), "🪙");
  assert.equal(tierBadgeEmoji("silver"), "🥈");
  assert.equal(tierBadgeEmoji("gold"), "🥇");
  assert.equal(tierBadgeEmoji("platinum"), "💎");
});

// ── 9. validateApplyForm ───────────────────────────────────────────────

test("validateApplyForm: minimal happy path passes (store_credit)", () => {
  assert.equal(
    validateApplyForm({
      firstName: "Sarah",
      lastName: null,
      email: "sarah@example.com",
      phone: "(509) 663-9980",
      zip: "98801",
      igHandle: "sarah",
      igFollowers: "12K",
      payoutMode: "store_credit",
      ageAttested: true,
      contractAccepted: true,
    }),
    null,
  );
});

test("validateApplyForm: cash_with_w9 requires last name", () => {
  const err = validateApplyForm({
    firstName: "Sarah",
    lastName: null,
    email: "sarah@example.com",
    phone: "(509) 663-9980",
    zip: "98801",
    igHandle: "sarah",
    igFollowers: "100K",
    payoutMode: "cash_with_w9",
    ageAttested: true,
    contractAccepted: true,
  });
  assert.ok(err, "expected an error for missing last name");
  assert.match(err!, /last name/i);
});

test("validateApplyForm: missing age attestation rejected", () => {
  const err = validateApplyForm({
    firstName: "Sarah",
    lastName: null,
    email: "sarah@example.com",
    phone: "(509) 663-9980",
    zip: "98801",
    igHandle: "sarah",
    igFollowers: "12K",
    payoutMode: "store_credit",
    ageAttested: false,
    contractAccepted: true,
  });
  assert.ok(err);
  assert.match(err!, /21/);
});

test("validateApplyForm: missing contract acceptance rejected", () => {
  const err = validateApplyForm({
    firstName: "Sarah",
    lastName: null,
    email: "sarah@example.com",
    phone: "(509) 663-9980",
    zip: "98801",
    igHandle: "sarah",
    igFollowers: "12K",
    payoutMode: "store_credit",
    ageAttested: true,
    contractAccepted: false,
  });
  assert.ok(err);
  assert.match(err!, /agreement/i);
});

// ── 10. constants ──────────────────────────────────────────────────────

test("AMBASSADOR_CONTRACT_VERSION is a versioned string", () => {
  assert.equal(typeof AMBASSADOR_CONTRACT_VERSION, "string");
  assert.match(AMBASSADOR_CONTRACT_VERSION, /^\d{4}\.\d+$/); // e.g. "2026.1"
});

test("AMBASSADOR_YTD_CAP_CENTS is $1,800 (per Doug-confirmed cap)", () => {
  assert.equal(AMBASSADOR_YTD_CAP_CENTS, 180_000);
});

test("FOLLOWER_TIER_THRESHOLDS match v0.2 spec table", () => {
  assert.equal(FOLLOWER_TIER_THRESHOLDS.silver, 10_000);
  assert.equal(FOLLOWER_TIER_THRESHOLDS.gold, 50_000);
  assert.equal(FOLLOWER_TIER_THRESHOLDS.platinum, 100_000);
});

// ── 11. lockstep invariant ─────────────────────────────────────────────

test("source file declares lockstep with seattle-cannabis-web", () => {
  assert.match(SRC, /byte-identical.*seattle-cannabis-web|lockstep/i);
});

// ── 12. no medical/efficacy vocab in source ────────────────────────────

test("source file carries no WAC 314-55-155 efficacy vocabulary", () => {
  // Same ban-list scan as ambassador-briefs pin tests. Drift would also
  // trip scripts/check-efficacy-claims.mjs on push, but pinning here
  // catches it at lib-test time.
  const banned = [
    /\btreats\b/i,
    /\bcures\b/i,
    /\bheals\b/i,
    /\brelieves\b/i,
    /\btherapeutic for\b/i,
    /\bhelps with (pain|anxiety|insomnia|depression)\b/i,
  ];
  for (const re of banned) {
    assert.equal(re.test(SRC), false, `banned WAC vocab matched: ${re.source}`);
  }
});
