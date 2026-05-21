// Tests for `lib/safe-redirect.ts` — open-redirect guard for Clerk's
// post-sign-in redirect + router.push() + redirect() targets that take
// attacker-controlled `?redirect_url=` / `?from=` / `?returnTo=` params.
//
// Why pinned: this is a security-class pure function. A regression that
// loosens any of the 4 layered checks (must start "/", must NOT start
// "//", must NOT start "/\", must NOT contain "://") re-opens
// open-redirect / OAuth-style trust-handoff abuse on every redirect
// surface on the public site. The 512-char cap is the DoS belt.
//
// Pin every layer explicitly — silent loosening of any single check
// would pass a typecheck + render-test.
//
// Run with:  pnpm test:all

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { safeRedirectPath } from "../safe-redirect.ts";

// ── Falsy + edge inputs ─────────────────────────────────────────────────

describe("safeRedirectPath — falsy + edge inputs", () => {
  test("null returns fallback", () => {
    assert.equal(safeRedirectPath(null), "/");
  });
  test("undefined returns fallback", () => {
    assert.equal(safeRedirectPath(undefined), "/");
  });
  test("empty string returns fallback", () => {
    assert.equal(safeRedirectPath(""), "/");
  });
  test("custom fallback honored on null", () => {
    assert.equal(safeRedirectPath(null, "/account"), "/account");
  });
  test("custom fallback honored on rejected input", () => {
    assert.equal(safeRedirectPath("https://attacker.com/x", "/account"), "/account");
  });
});

// ── Happy paths ─────────────────────────────────────────────────────────

describe("safeRedirectPath — happy paths", () => {
  test("simple relative path passes", () => {
    assert.equal(safeRedirectPath("/menu"), "/menu");
  });
  test("nested relative path passes", () => {
    assert.equal(safeRedirectPath("/account/orders"), "/account/orders");
  });
  test("path with query string passes", () => {
    assert.equal(safeRedirectPath("/menu?cat=flower&sort=price"), "/menu?cat=flower&sort=price");
  });
  test("path with hash passes", () => {
    assert.equal(safeRedirectPath("/about#hours"), "/about#hours");
  });
  test("path with both query + hash passes", () => {
    assert.equal(safeRedirectPath("/deals?id=42#callout"), "/deals?id=42#callout");
  });
});

// ── Layer 1: must start with "/" ────────────────────────────────────────

describe("safeRedirectPath — Layer 1 must start with /", () => {
  test("relative without leading / rejected", () => {
    assert.equal(safeRedirectPath("menu"), "/");
  });
  test("javascript: URL rejected", () => {
    assert.equal(safeRedirectPath("javascript:alert(1)"), "/");
  });
  test("data: URL rejected", () => {
    assert.equal(safeRedirectPath("data:text/html,<script>"), "/");
  });
  test("absolute http URL rejected", () => {
    assert.equal(safeRedirectPath("http://attacker.com/phish"), "/");
  });
  test("absolute https URL rejected", () => {
    assert.equal(safeRedirectPath("https://attacker.com/phish"), "/");
  });
});

// ── Layer 2: must NOT start with // (protocol-relative) ─────────────────

describe("safeRedirectPath — Layer 2 blocks protocol-relative //", () => {
  test("//attacker.com path rejected", () => {
    assert.equal(safeRedirectPath("//attacker.com/phish"), "/");
  });
  test("//x.y.z rejected", () => {
    assert.equal(safeRedirectPath("//evil.example.com"), "/");
  });
  test("// alone rejected", () => {
    assert.equal(safeRedirectPath("//"), "/");
  });
});

// ── Layer 3: must NOT start with /\ (Windows path-trick) ────────────────

describe("safeRedirectPath — Layer 3 blocks /\\ Windows path-trick", () => {
  test("/\\\\attacker.com rejected", () => {
    assert.equal(safeRedirectPath("/\\attacker.com"), "/");
  });
  test("/\\\\evil.host/x rejected", () => {
    assert.equal(safeRedirectPath("/\\evil.host/x"), "/");
  });
});

// ── Layer 4: must NOT contain :// anywhere ──────────────────────────────

describe("safeRedirectPath — Layer 4 blocks :// anywhere", () => {
  test("/path?x=https://attacker.com rejected (URL-embed in query)", () => {
    assert.equal(safeRedirectPath("/path?x=https://attacker.com"), "/");
  });
  test("/path#https://attacker.com rejected (URL-embed in hash)", () => {
    assert.equal(safeRedirectPath("/path#https://attacker.com"), "/");
  });
  test("/embed/http://x.y rejected (any :// substring)", () => {
    assert.equal(safeRedirectPath("/embed/http://x.y"), "/");
  });
});

// ── Length cap (DoS belt) ───────────────────────────────────────────────

describe("safeRedirectPath — 512-char DoS belt", () => {
  test("exactly 512 chars passes (boundary inclusive)", () => {
    const path = "/" + "a".repeat(511);
    assert.equal(path.length, 512);
    assert.equal(safeRedirectPath(path), path);
  });
  test("513 chars truncated to 512", () => {
    const path = "/" + "a".repeat(512);
    assert.equal(path.length, 513);
    const out = safeRedirectPath(path);
    assert.equal(out.length, 512);
    assert.equal(out, path.slice(0, 512));
  });
  test("oversized 10,000 chars truncated to 512", () => {
    const path = "/" + "x".repeat(9999);
    const out = safeRedirectPath(path);
    assert.equal(out.length, 512);
  });
});
