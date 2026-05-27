// Pin tests for the /visit/from-<source> page helper + the new
// /visit/from-cashmere + /visit/from-wenatchee-heights pages shipped
// under SEO_AUDIT_AUTONOMOUS_WINS_2026_05_26 Tech-SEO #3 cross-stack
// parity scope.
//
// What's pinned:
//   - URL builder produces canonical STORE.website-anchored absolute URL
//   - BreadcrumbList JSON-LD shape: @context + @type + @id + 3 list items
//   - LocalBusiness JSON-LD shape: name + address + telephone +
//     openingHoursSpecification
//   - Article JSON-LD shape: headline + description + url + inLanguage
//   - WSLCB regression: body text trips no banned phrases
//   - Existing /visit/from-leavenworth body also trips no banned phrases
//     (regression-pin against future content drift)
//
// Run:
//   pnpm exec tsx --test lib/__tests__/visit-from-source-pages.test.ts

import { test, describe } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  visitFromSourceUrl,
  visitFromSourceBreadcrumbLd,
  visitFromSourceArticleLd,
  visitFromSourceLocalBusinessLd,
  visitFromSourceStaticParams,
  visitFromSourceWslcbScan,
  type VisitFromSourceConfig,
} from "../visit-from-source.ts";
import { STORE } from "../store.ts";

const SAMPLE_CONFIG: VisitFromSourceConfig = {
  slug: "cashmere",
  sourceName: "Cashmere",
  title: "From Cashmere: 18 minutes east",
  description: "Cashmere has no recreational dispensary inside city limits.",
  body: "## The drive\n\nFrom Cashmere down US-2.\n\n- Step one\n- Step two\n\n**Bold** text.",
};

describe("visitFromSourceUrl — canonical absolute URL", () => {
  test("anchors to STORE.website with /visit/from-<slug> path", () => {
    const url = visitFromSourceUrl("cashmere");
    assert.equal(url, `${STORE.website}/visit/from-cashmere`);
  });

  test("preserves slug exactly (no normalize)", () => {
    const url = visitFromSourceUrl("wenatchee-heights");
    assert.equal(url, `${STORE.website}/visit/from-wenatchee-heights`);
  });
});

describe("visitFromSourceBreadcrumbLd — 3-level Home/Visit/From", () => {
  const ld = visitFromSourceBreadcrumbLd(SAMPLE_CONFIG);

  test("has @context, @type, @id", () => {
    assert.equal(ld["@context"], "https://schema.org");
    assert.equal(ld["@type"], "BreadcrumbList");
    assert.equal(ld["@id"], `${STORE.website}/visit/from-cashmere#breadcrumb`);
  });

  test("itemListElement length is 3 (Home → Visit → From <Source>)", () => {
    const items = ld.itemListElement as Array<Record<string, unknown>>;
    assert.equal(items.length, 3);
  });

  test("position is 1-indexed and ascending", () => {
    const items = ld.itemListElement as Array<Record<string, unknown>>;
    assert.equal(items[0].position, 1);
    assert.equal(items[1].position, 2);
    assert.equal(items[2].position, 3);
  });

  test("third list item name is `From <SourceName>`", () => {
    const items = ld.itemListElement as Array<Record<string, unknown>>;
    assert.equal(items[2].name, "From Cashmere");
    assert.equal(items[2].item, `${STORE.website}/visit/from-cashmere`);
  });
});

describe("visitFromSourceLocalBusinessLd — full LocalBusiness shape", () => {
  const ld = visitFromSourceLocalBusinessLd(SAMPLE_CONFIG);

  test("declares LocalBusiness with the dispensary @id", () => {
    assert.equal(ld["@type"], "LocalBusiness");
    assert.equal(ld["@id"], `${STORE.website}/#dispensary`);
  });

  test("name + url + telephone match STORE", () => {
    assert.equal(ld.name, STORE.name);
    assert.equal(ld.url, STORE.website);
    assert.equal(ld.telephone, STORE.phoneTel);
  });

  test("address is PostalAddress with all four locality fields", () => {
    const addr = ld.address as Record<string, unknown>;
    assert.equal(addr["@type"], "PostalAddress");
    assert.equal(addr.streetAddress, STORE.address.street);
    assert.equal(addr.addressLocality, STORE.address.city);
    assert.equal(addr.addressRegion, STORE.address.state);
    assert.equal(addr.postalCode, STORE.address.zip);
    assert.equal(addr.addressCountry, "US");
  });

  test("openingHoursSpecification has 7 day entries", () => {
    const hours = ld.openingHoursSpecification as Array<Record<string, unknown>>;
    assert.equal(hours.length, 7);
    for (const h of hours) {
      assert.equal(h["@type"], "OpeningHoursSpecification");
      assert.equal(typeof h.dayOfWeek, "string");
      assert.equal(typeof h.opens, "string");
      assert.equal(typeof h.closes, "string");
    }
  });

  test("mainEntityOfPage points at this /visit/from-<slug> URL", () => {
    const moep = ld.mainEntityOfPage as Record<string, unknown>;
    assert.equal(moep["@id"], `${STORE.website}/visit/from-cashmere`);
  });
});

describe("visitFromSourceArticleLd — Article shape with dispensary @id link", () => {
  const ld = visitFromSourceArticleLd(SAMPLE_CONFIG);

  test("declares Article with absolute URL @id ending in #article", () => {
    assert.equal(ld["@type"], "Article");
    assert.equal(ld["@id"], `${STORE.website}/visit/from-cashmere#article`);
  });

  test("headline + description + url match config", () => {
    assert.equal(ld.headline, SAMPLE_CONFIG.title);
    assert.equal(ld.description, SAMPLE_CONFIG.description);
    assert.equal(ld.url, `${STORE.website}/visit/from-cashmere`);
  });

  test("links isPartOf /visit + about dispensary @id", () => {
    const isPartOf = ld.isPartOf as Record<string, unknown>;
    const about = ld.about as Record<string, unknown>;
    assert.equal(isPartOf["@id"], `${STORE.website}/visit`);
    assert.equal(about["@id"], `${STORE.website}/#dispensary`);
  });
});

describe("visitFromSourceStaticParams — slug list shape", () => {
  test("emits {source: slug} per config", () => {
    const params = visitFromSourceStaticParams([
      { slug: "cashmere" },
      { slug: "wenatchee-heights" },
    ]);
    assert.deepEqual(params, [
      { source: "cashmere" },
      { source: "wenatchee-heights" },
    ]);
  });

  test("empty input → empty output (no implicit defaults)", () => {
    const params = visitFromSourceStaticParams([]);
    assert.equal(params.length, 0);
  });
});

describe("visitFromSourceWslcbScan — WAC 314-55-155 regression", () => {
  test("clean factual copy → empty hits", () => {
    const hits = visitFromSourceWslcbScan(
      "Open 8 AM to 10 PM. Cash only. Bring valid ID. Drive carefully.",
    );
    assert.equal(hits.length, 0);
  });

  test("efficacy phrasing is caught", () => {
    const hits = visitFromSourceWslcbScan("This product treats anxiety");
    assert.ok(hits.length > 0, "should catch 'treats anxiety'");
  });

  test("medicinal phrasing is caught", () => {
    const hits = visitFromSourceWslcbScan("Use this as medicine");
    assert.ok(hits.length > 0);
  });
});

// ---- Per-page WSLCB regression pins (read-from-disk fs assertions) ----
// These pins anchor the body strings shipped on each /visit/from-<source>
// page. They scan the source files for banned-phrase trips so a future
// content edit can't silently regress WSLCB compliance.

const PAGE_PATHS = [
  "app/visit/from-leavenworth/page.tsx", // reference page
  "app/visit/from-cashmere/page.tsx",     // new (Tech-SEO #3)
  "app/visit/from-wenatchee-heights/page.tsx", // new (Tech-SEO #3)
] as const;

describe("WSLCB regression — every /visit/from-<source> page body", () => {
  for (const relPath of PAGE_PATHS) {
    test(`${relPath} trips no banned phrases`, () => {
      const abs = join(process.cwd(), relPath);
      const src = readFileSync(abs, "utf8");
      const hits = visitFromSourceWslcbScan(src);
      // Allow regex source-text occurrences (the banned list itself
      // contains the phrases as patterns). Filter for whole-word matches
      // that occur OUTSIDE comments and OUTSIDE the test file path —
      // these pages have neither, so any hit is a real regression.
      assert.equal(
        hits.length,
        0,
        `${relPath} has banned-phrase hits: ${JSON.stringify(hits)}`,
      );
    });
  }
});

describe("Page imports — new pages reuse the shared helper", () => {
  for (const relPath of ["app/visit/from-cashmere/page.tsx", "app/visit/from-wenatchee-heights/page.tsx"] as const) {
    test(`${relPath} imports from lib/visit-from-source`, () => {
      const abs = join(process.cwd(), relPath);
      const src = readFileSync(abs, "utf8");
      assert.ok(
        src.includes('from "@/lib/visit-from-source-render"') ||
          src.includes('from "@/lib/visit-from-source"'),
        `${relPath} should import from lib/visit-from-source(-render)`,
      );
      assert.ok(
        src.includes("renderVisitFromSourceBody"),
        `${relPath} should use the shared renderer`,
      );
      assert.ok(
        src.includes("visitFromSourceLocalBusinessLd"),
        `${relPath} should use the shared LocalBusiness LD builder`,
      );
    });
  }
});
