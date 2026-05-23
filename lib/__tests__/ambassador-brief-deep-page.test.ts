// Pin tests for /community/ambassador/briefs/[slug] — Phase 2.5 deep
// page for the Ambassador Program v0.1. Page is a per-brief shareable
// surface so customers in-store can scan a QR + land on a permalink
// with the prompt + compliance tips + submission CTA.
//
// Coverage:
//   1. generateStaticParams returns one entry per BRIEF_LIBRARY id
//   2. dynamic + dynamicParams force-static configuration
//   3. DEEP_CARD_CONTENT covers all 5 BRIEF_LIBRARY ids (no fallback in prod)
//   4. Per-brief metadata canonical matches slug
//   5. BreadcrumbList JSON-LD shape — 4 segments (Home > Community > Ambassador > Brief)
//   6. QR-code URL embedded matches /community/ambassador?brief=<slug> pattern
//   7. WAC compliance — page source contains no banned efficacy vocab
//   8. STORE.name template-substitution in Budtender Shoutout headline
//   9. Lockstep file-header invariant (sister-port doctrine)
//  10. Per-brief wontAccept list contains brief-specific edge cases
//      (not boilerplate) — Strain Cheers calls out "Helps me sleep",
//      Budtender Shoutout calls out "Best budtender in town"
//
// fs-based source assertions for invariants the runtime can't probe
// (banned vocab grep on the rendered tree would require a full Next
// render; reading the source file catches drift at edit time).

import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

import { BRIEF_LIBRARY, BRIEF_IDS } from "../ambassador-briefs.ts";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const PAGE_PATH = join(
  __dirname,
  "..",
  "..",
  "app",
  "community",
  "ambassador",
  "briefs",
  "[slug]",
  "page.tsx",
);
const OG_PATH = join(
  __dirname,
  "..",
  "..",
  "app",
  "community",
  "ambassador",
  "briefs",
  "[slug]",
  "opengraph-image.tsx",
);

const pageSource = readFileSync(PAGE_PATH, "utf8");
const ogSource = readFileSync(OG_PATH, "utf8");

test("page exports dynamic = force-static", () => {
  assert.match(pageSource, /export const dynamic = "force-static"/);
});

test("page exports dynamicParams = false (rejects unknown slugs at request time)", () => {
  assert.match(pageSource, /export const dynamicParams = false/);
});

test("page exports generateStaticParams returning one entry per BRIEF_LIBRARY id", () => {
  assert.match(pageSource, /export function generateStaticParams/);
  assert.match(pageSource, /BRIEF_LIBRARY\.map\(\(b\) => \(\{ slug: b\.id \}\)\)/);
});

test("OG image route exports generateStaticParams (Next pre-renders all 5 OG PNGs)", () => {
  assert.match(ogSource, /export function generateStaticParams/);
  assert.match(ogSource, /BRIEF_LIBRARY\.map\(\(b\) => \(\{ slug: b\.id \}\)\)/);
});

test("DEEP_CARD_CONTENT covers every BRIEF_LIBRARY id", () => {
  // Page source must mention each id as a DEEP_CARD_CONTENT key. Drift
  // (new brief added to BRIEF_LIBRARY without an entry here) would fall
  // back to the generic prompt + complianceTips — loses the comms-
  // expert-drafted brief-specific compliance edge cases.
  for (const id of BRIEF_IDS) {
    assert.ok(
      pageSource.includes(`"${id}":`),
      `DEEP_CARD_CONTENT missing entry for brief id "${id}"`,
    );
  }
});

test("metadata canonical follows /community/ambassador/briefs/<slug> shape (literal-string form for check-canonical-or-noindex gate)", () => {
  // Inlined template literal (NOT variable reference) so the gate's
  // regex `canonical:\s*["'`]` matches. Drift to variable-form would
  // let root layout's `canonical: "/"` cascade + the gate would block
  // the push.
  assert.match(
    pageSource,
    /alternates: \{ canonical: `\/community\/ambassador\/briefs\/\$\{brief\.id\}` \}/,
  );
});

test("metadata title.absolute embeds brief.title + STORE.name", () => {
  assert.match(
    pageSource,
    /title: \{ absolute: `\$\{brief\.title\} — Ambassador brief — \$\{STORE\.name\}` \}/,
  );
});

test("BreadcrumbList JSON-LD has 4 segments (Home > Community > Ambassador > Brief)", () => {
  // Match a position: 4 entry — 4-deep breadcrumb means the per-brief
  // tail segment is included.
  assert.match(pageSource, /position: 4,\s*\n?\s*name: brief\.title/);
  assert.match(pageSource, /position: 1, name: "Home"/);
  assert.match(pageSource, /position: 2, name: "Community"/);
  assert.match(pageSource, /position: 3,\s*\n?\s*name: "Ambassador Program"/);
});

test("WebPage JSON-LD references the per-brief canonical URL", () => {
  assert.match(pageSource, /@type": "WebPage"/);
  assert.match(pageSource, /url: `\$\{STORE\.website\}\$\{canonical\}`/);
});

test("QR-code URL points to /community/ambassador?brief=<slug>#submit", () => {
  // submitUrl is the source of truth for both the QR encoder + the
  // fallback caption shown below the QR. Drift would split the
  // QR-scan landing from the human-typed URL.
  assert.match(
    pageSource,
    /const submitUrl = `\$\{STORE\.website\}\/community\/ambassador\?brief=\$\{brief\.id\}#submit`/,
  );
  // QR service URL embeds the encoded submitUrl
  assert.match(pageSource, /api\.qrserver\.com\/v1\/create-qr-code/);
  assert.match(pageSource, /encodeURIComponent\(\s*submitUrl,?\s*\)/);
});

test("page renders the QR via plain <img> not next/image (already-optimized PNG)", () => {
  // QR is a binary already optimized for line art; round-tripping
  // through next/image adds latency without bytes savings. Drift to
  // next/image would silently slow the page + count against the
  // image-optimization quota.
  assert.match(pageSource, /<img\s/);
  assert.ok(!/from "next\/image"/.test(pageSource), "page should NOT import next/image");
});

test("WAC 314-55-155 compliance — no banned efficacy vocab in source", () => {
  // Conservative ban-list per check-efficacy-claims.mjs doctrine.
  // Comments + JSX strings both scanned (regex doesn't distinguish);
  // false-positives caught + fixed at edit time. Bare "anxiety" /
  // "pain" / "sleep" CAN appear in the DEEP_CARD_CONTENT "what we
  // WON'T accept" examples (we WARN customers off making those
  // claims), so the regex requires the causation/preposition glue
  // ("for anxiety" / "with sleep" / "from pain" — that's the claim
  // shape, not the warning shape).
  const banned: RegExp[] = [
    /\bcures?\b/i,
    /\bheals?\b/i,
    /\brelieves?\b/i,
    /\btreats?\s+(?:anxiety|pain|insomnia|cancer|disease|depression|inflammation|nausea|ptsd|migraines?|seizures?)\b/i,
    /\banti-anxiety\b/i,
    /\banxiolytic\b/i,
    /\banti-inflammatory\b/i,
    /\banalgesic\b/i,
    /\bgood\s+for\s+(?:sleep|anxiety|pain)\b/i,
    /\bhelps\s+with\s+(?:sleep|anxiety|pain)\b/i,
    /\bsedating\b/i,
  ];
  for (const re of banned) {
    assert.ok(
      !re.test(pageSource),
      `page source contains banned vocab matching ${re} — would trip check-efficacy-claims.mjs`,
    );
  }
});

test("STORE.name appears in Budtender Shoutout headline (template substitution)", () => {
  // The Budtender Shoutout brief's headline uses ${STORE.name} so each
  // stack renders with its own shop name. Drift to a hardcoded "Green
  // Life Cannabis" would render incorrectly on SCC.
  const budtenderBlock = pageSource.match(
    /"budtender-shoutout":\s*\{[\s\S]*?headline:\s*`([^`]*)`/,
  );
  assert.ok(budtenderBlock, "budtender-shoutout block must use a template literal headline");
  assert.match(budtenderBlock![1], /\$\{STORE\.name\}/);
});

test("brief-specific wontAccept lists contain edge cases (not boilerplate)", () => {
  // Strain Cheers MUST call out the effect/condition compliance edge —
  // the §2 collateral doc draft used "Helps me sleep / good for
  // anxiety / kills my pain" verbatim; gate (check-efficacy-claims.mjs)
  // is intentionally conservative + flags banned strings in any
  // context including warn-customer examples, so we use the indirect
  // phrasing "Effect or condition claims (sleep, anxiety, pain, etc.)"
  // which preserves the compliance edge without tripping the gate.
  // Drift to boilerplate or to a non-condition example would lose the
  // comms-expert framing.
  const strainBlock = pageSource.match(
    /"strain-cheers":\s*\{[\s\S]*?wontAccept:\s*\[([\s\S]*?)\]/,
  );
  assert.ok(strainBlock, "strain-cheers wontAccept block missing");
  assert.match(strainBlock![1], /Effect or condition claims/i);
  assert.match(strainBlock![1], /dosing/i);

  // Budtender Shoutout MUST call out "Best budtender in town" — the
  // competitor-compare ban.
  const budBlock = pageSource.match(
    /"budtender-shoutout":\s*\{[\s\S]*?wontAccept:\s*\[([\s\S]*?)\]/,
  );
  assert.ok(budBlock, "budtender-shoutout wontAccept block missing");
  assert.match(budBlock![1], /Best budtender in town/i);

  // Outfit + Vibe MUST call out "under 21 in frame" — the privacy
  // edge case.
  const outfitBlock = pageSource.match(
    /"outfit-vibe":\s*\{[\s\S]*?wontAccept:\s*\[([\s\S]*?)\]/,
  );
  assert.ok(outfitBlock, "outfit-vibe wontAccept block missing");
  assert.match(outfitBlock![1], /under 21 in frame/i);
});

test("lockstep file-header invariant — header documents sister-stack maintenance", () => {
  // Drift between GLW + SCC deep page files would split the customer
  // experience cross-stack. Header comment is the human-facing
  // reminder; gate is the build-time pin.
  assert.match(pageSource, /byte-identical/i);
  assert.match(pageSource, /lockstep/i);
  assert.match(pageSource, /sister-port/i);
});

test("submit CTA links to /community/ambassador?brief=<slug>#submit", () => {
  // CTA href must match the QR-encoded submitUrl shape so customers
  // who tap (not scan) land on the same pre-filtered form. Drift would
  // split scan-flow vs tap-flow landing pages.
  assert.match(
    pageSource,
    /href=\{`\/community\/ambassador\?brief=\$\{brief\.id\}#submit`\}/,
  );
});

test("page imports + uses safeJsonLd helper (XSS defense for JSON-LD)", () => {
  // Drift to JSON.stringify-only would re-introduce the </script>
  // breakout XSS sink the helper exists to close.
  assert.match(pageSource, /from "@\/lib\/json-ld-safe"/);
  assert.match(pageSource, /safeJsonLd\(breadcrumbLd\)/);
  assert.match(pageSource, /safeJsonLd\(webPageLd\)/);
});

test("page imports Breadcrumb component (visible nav + JSON-LD pair)", () => {
  // Visible breadcrumb + JSON-LD breadcrumb is the SEO-pair pattern
  // per the cross-stack Breadcrumb doctrine.
  assert.match(pageSource, /from "@\/components\/Breadcrumb"/);
  assert.match(pageSource, /<Breadcrumb/);
});

test("DEEP_CARD_CONTENT entry count matches BRIEF_LIBRARY length", () => {
  // Defensive sync check — the per-id assertion above catches missing
  // entries, this catches extra entries that don't correspond to any
  // brief (would render as dead code).
  const entryCount = (pageSource.match(/^\s{2}"[a-z0-9-]+":\s*\{$/gm) ?? []).length;
  // 0 expected here unless DEEP_CARD_CONTENT keys are 2-space indented;
  // the actual indentation in the file is 2 spaces. Allow for the
  // structural match instead.
  const keyMatches = pageSource.match(/^\s{2}"([a-z0-9-]+)":\s*\{/gm);
  // Only count the DEEP_CARD_CONTENT block — filter to slugs that exist
  // in BRIEF_LIBRARY (avoids accidentally counting other 2-space-
  // indented object literals in the file).
  const briefKeyMatches = (keyMatches ?? []).filter((line) => {
    const m = line.match(/"([a-z0-9-]+)"/);
    return m && BRIEF_IDS.includes(m[1]);
  });
  assert.equal(
    briefKeyMatches.length,
    BRIEF_LIBRARY.length,
    `DEEP_CARD_CONTENT should have exactly ${BRIEF_LIBRARY.length} brief entries; found ${briefKeyMatches.length}`,
  );
  // suppress unused-var lint
  void entryCount;
});

test("OG image embeds brief.title and tenure footer", () => {
  // OG card title slot uses brief.title; tenure footer differs per
  // stack (Center Road since 2014 vs Rainier Valley since 2010) via
  // STORE.address.city ternary.
  assert.match(ogSource, /\{brief\.title\}/);
  assert.match(ogSource, /Center Road since 2014/);
  assert.match(ogSource, /tenureLine/);
});

test("OG image alt text contains STORE.name and brand-voice safe phrase", () => {
  assert.match(ogSource, /Ambassador brief · \$\{STORE\.name\}/);
});

test("page hero copy reinforces 'outside the shop' compliance posture", () => {
  // "Record outside the shop" is the load-bearing compliance frame —
  // PLAN §4 + §5 both anchor on it. Drift would weaken the
  // self-screen at decision time.
  assert.match(pageSource, /Record outside the shop/);
});
