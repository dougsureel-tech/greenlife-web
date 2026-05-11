// Source-defense pin for `proxy.ts` (root-level Next.js middleware).
// Sister of scc lib/__tests__/proxy-defense.test.ts. v29.905 shipped
// the CANONICAL_HOST allow-list defense — same site-wide-outage
// prevention pattern.

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROXY_SRC = readFileSync(join(__dirname, "..", "..", "proxy.ts"), "utf-8");

describe("proxy.ts — CANONICAL_HOST allow-list defense (v29.905)", () => {
  test("declares ALLOWED_CANONICAL_HOSTS Set with the canonical hostname", () => {
    assert.match(
      PROXY_SRC,
      /const ALLOWED_CANONICAL_HOSTS\s*=\s*new Set\(\[[\s\S]{0,200}"www\.greenlifecannabis\.com"/,
      "proxy.ts must declare ALLOWED_CANONICAL_HOSTS Set containing the canonical www hostname",
    );
  });

  test("CANONICAL_HOST is computed via IIFE that validates env against the allow-list", () => {
    assert.match(
      PROXY_SRC,
      /const CANONICAL_HOST\s*=\s*\(\(\)\s*=>\s*\{[\s\S]{0,400}ALLOWED_CANONICAL_HOSTS\.has\(env\)[\s\S]{0,200}return\s+env/,
      "proxy.ts must validate env via ALLOWED_CANONICAL_HOSTS.has(env) before returning it",
    );
  });

  test("CANONICAL_HOST fallback is the hardcoded canonical", () => {
    assert.match(
      PROXY_SRC,
      /return\s+"https?:\/\/www\.greenlifecannabis\.com"|return\s+"www\.greenlifecannabis\.com"/,
      "proxy.ts must hardcode the canonical fallback (not interpolate env)",
    );
  });

  test("does NOT use the OLD unsafe form `process.env.NEXT_PUBLIC_CANONICAL_HOST || \"<literal>\"`", () => {
    assert.ok(
      !/const\s+CANONICAL_HOST\s*=\s*process\.env\.NEXT_PUBLIC_CANONICAL_HOST\s*\|\|\s*["']/.test(PROXY_SRC),
      "proxy.ts regressed to inline `env || literal` — use ALLOWED_CANONICAL_HOSTS allow-list (v29.905)",
    );
  });

  test("ALWAYS_CANONICAL_HOSTS still preserved as belt-and-suspenders", () => {
    assert.match(
      PROXY_SRC,
      /const ALWAYS_CANONICAL_HOSTS\s*=\s*new Set\(\[[\s\S]{0,200}"www\.greenlifecannabis\.com"/,
      "proxy.ts must keep ALWAYS_CANONICAL_HOSTS as separate belt-and-suspenders defense",
    );
  });
});
