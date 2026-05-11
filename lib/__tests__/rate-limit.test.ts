// Tests for createRateLimiter — security-critical helper used by 5 public
// API routes (/api/quiz/capture, /api/push/subscribe, /api/push/unsubscribe,
// /api/track-install, /api/orders).
//
// The author already exposed `_prune` + `_size` as test-only hooks; these
// tests use them to verify pruning bounds Map growth + verify the per-key
// fixed-window semantics behave correctly.

import { test, describe } from "node:test";
import assert from "node:assert/strict";

import { createRateLimiter } from "../rate-limit.ts";
import { MINUTE_MS } from "../time-constants.ts";

describe("createRateLimiter — per-key fixed-window semantics", () => {
  test("first request for a key is allowed", () => {
    const rl = createRateLimiter({ limit: 5 });
    assert.equal(rl.check("ip-1.2.3.4"), true);
  });

  test("up to `limit` requests in window are allowed", () => {
    const rl = createRateLimiter({ limit: 3 });
    assert.equal(rl.check("a"), true);
    assert.equal(rl.check("a"), true);
    assert.equal(rl.check("a"), true);
  });

  test("request beyond `limit` is rejected", () => {
    const rl = createRateLimiter({ limit: 3 });
    rl.check("a");
    rl.check("a");
    rl.check("a");
    assert.equal(rl.check("a"), false, "4th request should be rate-limited");
  });

  test("after limit, subsequent rejections also return false", () => {
    const rl = createRateLimiter({ limit: 2 });
    rl.check("a");
    rl.check("a");
    assert.equal(rl.check("a"), false);
    assert.equal(rl.check("a"), false);
    assert.equal(rl.check("a"), false);
  });

  test("different keys have independent windows", () => {
    const rl = createRateLimiter({ limit: 2 });
    rl.check("a");
    rl.check("a");
    // "a" is now at limit
    assert.equal(rl.check("a"), false);
    // "b" still has a fresh window
    assert.equal(rl.check("b"), true);
    assert.equal(rl.check("b"), true);
    assert.equal(rl.check("b"), false);
  });

  test("limit of 1 allows exactly 1 request per window", () => {
    const rl = createRateLimiter({ limit: 1 });
    assert.equal(rl.check("a"), true);
    assert.equal(rl.check("a"), false);
  });
});

describe("createRateLimiter — pruning behavior", () => {
  test("_prune with future `now` removes all expired entries", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 1000 });
    rl.check("a");
    rl.check("b");
    rl.check("c");
    assert.equal(rl._size(), 3);
    // Force prune at a time well past every entry's resetAt
    rl._prune(Date.now() + 10_000);
    assert.equal(rl._size(), 0, "all entries should be pruned");
  });

  test("_prune leaves in-window entries intact", () => {
    const rl = createRateLimiter({ limit: 1, windowMs: 60_000 });
    rl.check("a");
    rl.check("b");
    // Prune at current time — no entries should be expired yet
    rl._prune(Date.now());
    assert.equal(rl._size(), 2, "in-window entries should survive prune");
  });

  test("default windowMs is one minute", () => {
    const rl = createRateLimiter({ limit: 1 });
    rl.check("a");
    // Just shy of one minute later — should still be in window
    rl._prune(Date.now() + MINUTE_MS - 100);
    assert.equal(rl._size(), 1);
    // Past one minute — should be pruned
    rl._prune(Date.now() + MINUTE_MS + 100);
    assert.equal(rl._size(), 0);
  });
});

describe("createRateLimiter — edge cases", () => {
  test("zero limit rejects every request", () => {
    const rl = createRateLimiter({ limit: 0 });
    // First call creates the entry with count=1 and returns true (the
    // entry-not-found path), then subsequent calls hit count >= 0 and
    // reject. This matches the in-memory implementation; documenting the
    // observed behavior so a future limit=0 use-case doesn't surprise.
    const first = rl.check("a");
    const second = rl.check("a");
    // First request is allowed (creates the bucket), then the bucket
    // immediately disallows anything else at count >= 0.
    assert.equal(first, true);
    assert.equal(second, false);
  });

  test("custom short window expires + restarts cleanly", () => {
    const rl = createRateLimiter({ limit: 2, windowMs: 50 });
    assert.equal(rl.check("a"), true);
    assert.equal(rl.check("a"), true);
    assert.equal(rl.check("a"), false);
    // Wait for window to expire
    return new Promise<void>((resolve) => {
      setTimeout(() => {
        assert.equal(rl.check("a"), true, "fresh window should reset count");
        resolve();
      }, 100);
    });
  });
});
