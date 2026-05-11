// Tests for STORE constant + STORE_TZ + DEFAULT_OG_IMAGE + hoursSummary.
// Sister of scc lib/__tests__/store.test.ts; same SSoT shape, glw-specific
// fixtures.
//
// STORE is the single-source-of-truth that drives ~60 customer surfaces:
// sitemap URLs, JSON-LD LocalBusiness graph, contact mailto/tel links,
// hours displays, OpenGraph metadata, footer, /visit page, breadcrumbs.
// A silent drift here cascades to all of them.
//
// Why pin specifically:
//   - phone/phoneTel must mutually agree
//   - website MUST be www.* not apex (proxy.ts CANONICAL_HOST 308's apex)
//   - email MUST be buyer@greenlifecannabis.com (Doug 2026-05-10 routed
//     info@ to a non-monitored bucket; 13+ customer pages mailto: SSoT
//     must land on the monitored inbox — see project_info_email_unmonitored)
//   - WSLCB license is regulatory; typo = compliance issue
//   - STORE_TZ MUST be "America/Los_Angeles" (8 modules depend on this)
//   - hoursSummary returns the non-uniform branch (Fri/Sat close 10pm,
//     rest close 9pm) — pin specifically because uniform-branch regression
//     would silently advertise wrong close hours during Fri+Sat peak

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { STORE, STORE_TZ, DEFAULT_OG_IMAGE, hoursSummary } from "../store.ts";

describe("STORE — identity invariants", () => {
  test("name is the customer-facing brand string", () => {
    assert.equal(STORE.name, "Green Life Cannabis");
  });

  test("tagline references Wenatchee", () => {
    assert.match(STORE.tagline, /wenatchee/i);
  });
});

describe("STORE.address — invariants", () => {
  test("address has all required fields", () => {
    assert.ok(STORE.address.street);
    assert.ok(STORE.address.city);
    assert.ok(STORE.address.state);
    assert.ok(STORE.address.zip);
    assert.ok(STORE.address.full);
  });

  test("state is 'WA' (cannabis license is WSLCB)", () => {
    assert.equal(STORE.address.state, "WA");
  });

  test("zip is 5-digit US format", () => {
    assert.match(STORE.address.zip, /^\d{5}$/);
  });

  test("address.full contains street + city + state + zip", () => {
    assert.ok(STORE.address.full.includes(STORE.address.street));
    assert.ok(STORE.address.full.includes(STORE.address.city));
    assert.ok(STORE.address.full.includes(STORE.address.state));
    assert.ok(STORE.address.full.includes(STORE.address.zip));
  });
});

describe("STORE — contact invariants", () => {
  test("phone formatted as (XXX) XXX-XXXX", () => {
    assert.match(STORE.phone, /^\(\d{3}\) \d{3}-\d{4}$/);
  });

  test("phoneTel is E.164 (+1 + 10 digits)", () => {
    assert.match(STORE.phoneTel, /^\+1\d{10}$/);
  });

  test("phoneTel digits match phone digits", () => {
    const phoneDigits = STORE.phone.replace(/\D/g, "");
    const telDigits = STORE.phoneTel.replace(/\D/g, "").slice(1);
    assert.equal(phoneDigits, telDigits);
  });

  test("email is plausible address shape", () => {
    assert.match(STORE.email, /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i);
  });

  test("email is buyer@greenlifecannabis.com (Doug-pinned monitored inbox, NOT info@)", () => {
    assert.equal(STORE.email, "buyer@greenlifecannabis.com");
    assert.ok(
      !STORE.email.startsWith("info@"),
      "info@ goes to non-monitored M365 inbox per project_info_email_unmonitored.md",
    );
  });
});

describe("STORE.website — canonical-host pin", () => {
  test("website is www.* (not apex — proxy.ts CANONICAL_HOST 308's apex)", () => {
    assert.match(STORE.website, /^https:\/\/www\.greenlifecannabis\.com$/);
  });

  test("website is https (no trailing slash)", () => {
    assert.match(STORE.website, /^https:\/\//);
    assert.ok(!STORE.website.endsWith("/"), "website MUST NOT have trailing slash");
  });
});

describe("STORE.geo — coordinate sanity", () => {
  test("lat is in Wenatchee range (~47-48)", () => {
    assert.ok(STORE.geo.lat > 47 && STORE.geo.lat < 48, "lat outside Wenatchee bounds");
  });

  test("lng is in Wenatchee range (~-121 to -120)", () => {
    assert.ok(STORE.geo.lng > -121 && STORE.geo.lng < -120, "lng outside Wenatchee bounds");
  });
});

describe("STORE.hours — invariants", () => {
  test("exactly 7 days covered", () => {
    assert.equal(STORE.hours.length, 7);
  });

  test("days follow Monday-through-Sunday order", () => {
    const expected = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
    const got = STORE.hours.map((h) => h.day);
    assert.deepEqual(got, expected);
  });

  test("every day has open + close strings", () => {
    for (const h of STORE.hours) {
      assert.match(h.open, /^\d{1,2}:\d{2} (AM|PM)$/, `${h.day} open malformed`);
      assert.match(h.close, /^\d{1,2}:\d{2} (AM|PM)$/, `${h.day} close malformed`);
    }
  });

  test("Friday + Saturday close later than other days (Wen pattern)", () => {
    const fri = STORE.hours.find((h) => h.day === "Friday")!;
    const sat = STORE.hours.find((h) => h.day === "Saturday")!;
    const mon = STORE.hours.find((h) => h.day === "Monday")!;
    // Compare close times; expects Fri/Sat 10:00 PM > Mon 9:00 PM
    assert.equal(fri.close, "10:00 PM", "Fri should close at 10pm");
    assert.equal(sat.close, "10:00 PM", "Sat should close at 10pm");
    assert.equal(mon.close, "9:00 PM", "Mon should close at 9pm");
  });
});

describe("STORE — regulatory invariants", () => {
  test("wslcbLicense is non-empty digits", () => {
    assert.match(STORE.wslcbLicense, /^\d+$/);
  });
});

describe("STORE.social — link shape", () => {
  test("instagram is a full https URL", () => {
    assert.match(STORE.social.instagram, /^https:\/\/(www\.)?instagram\.com\//);
  });

  test("facebook is a full https URL", () => {
    assert.match(STORE.social.facebook, /^https:\/\/(www\.)?facebook\.com\//);
  });
});

describe("STORE.nearbyTowns — structural invariants", () => {
  test("nearbyTowns is non-empty", () => {
    assert.ok(STORE.nearbyTowns.length > 0);
  });

  test("every town has id + name + driveMin + blurb", () => {
    for (const t of STORE.nearbyTowns) {
      assert.ok(t.id);
      assert.ok(t.name);
      assert.equal(typeof t.driveMin, "number");
      assert.ok(t.driveMin >= 0);
      assert.ok(t.blurb);
    }
  });

  test("town ids are unique", () => {
    const ids = STORE.nearbyTowns.map((t) => t.id);
    assert.equal(new Set(ids).size, ids.length);
  });

  test("includes Wenatchee as driveMin=0 anchor", () => {
    const wen = STORE.nearbyTowns.find((t) => t.id === "wenatchee");
    assert.ok(wen, "Wenatchee anchor row missing");
    assert.equal(wen.driveMin, 0);
  });
});

describe("STORE — amenities + perks", () => {
  test("amenities contains 'Free parking' (drives /visit page card)", () => {
    assert.ok(STORE.amenities.includes("Free parking"));
  });

  test("perks contains '20% off online orders' (load-bearing CTA)", () => {
    assert.ok(STORE.perks.includes("20% off online orders"));
  });
});

describe("STORE — brand-voice compliance", () => {
  test("no STORE string contains 'Senior discount' (Wisdom rename)", () => {
    const json = JSON.stringify(STORE);
    assert.ok(
      !/senior\s+discount/i.test(json),
      "STORE contains forbidden 'Senior discount' phrase",
    );
  });

  test("no STORE string contains 'locally owned' framing", () => {
    const json = JSON.stringify(STORE);
    assert.ok(
      !/\blocally[\s-]owned\b/i.test(json),
      "STORE contains forbidden 'locally owned' framing",
    );
  });

  test("no STORE string contains 'veteran-owned' (Doug-pinned not formally veteran-owned)", () => {
    const json = JSON.stringify(STORE);
    assert.ok(
      !/\bveteran[\s-]owned\b/i.test(json),
      "STORE contains forbidden 'veteran-owned' framing — see OPERATING_PRINCIPLES.md",
    );
  });
});

describe("STORE_TZ", () => {
  test("is exactly 'America/Los_Angeles' (SSoT for 8+ modules)", () => {
    assert.equal(STORE_TZ, "America/Los_Angeles");
  });

  test("is a valid IANA TZ (resolves via Intl.DateTimeFormat)", () => {
    assert.doesNotThrow(() => {
      new Intl.DateTimeFormat("en-US", { timeZone: STORE_TZ }).format(new Date());
    });
  });
});

describe("DEFAULT_OG_IMAGE", () => {
  test("url is /opengraph-image (matches Next 16 image convention)", () => {
    assert.equal(DEFAULT_OG_IMAGE.url, "/opengraph-image");
  });

  test("width is 1200 (matches app/opengraph-image.tsx size export)", () => {
    assert.equal(DEFAULT_OG_IMAGE.width, 1200);
  });

  test("height is 630 (matches app/opengraph-image.tsx size export)", () => {
    assert.equal(DEFAULT_OG_IMAGE.height, 630);
  });

  test("type is image/png", () => {
    assert.equal(DEFAULT_OG_IMAGE.type, "image/png");
  });

  test("alt is computed from STORE.name + STORE.address.city", () => {
    assert.ok(DEFAULT_OG_IMAGE.alt.includes(STORE.name));
    assert.ok(DEFAULT_OG_IMAGE.alt.includes(STORE.address.city));
  });
});

describe("hoursSummary — non-uniform branch (glw Fri/Sat extend)", () => {
  test("returns the '...daily · later Fri & Sat' format (glw is non-uniform)", () => {
    const got = hoursSummary();
    assert.match(got, /later fri & sat$/i, `expected non-uniform format, got "${got}"`);
    // The most-common range (5 of 7 days = 8:00 AM-9:00 PM) should appear
    assert.ok(got.includes("8:00 AM"));
    assert.ok(got.includes("9:00 PM"));
  });
});
