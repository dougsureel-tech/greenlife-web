"use client";

import { useSyncExternalStore } from "react";

// Same localStorage / custom-event pattern as lib/stash.ts. Holds the last
// 12 product IDs the visitor showed intent on (saved to stash, tapped the
// Order link, etc.) so we can surface them as a "Recently looking at" strip.
//
// Snapshot caching is mandatory — without it, useSyncExternalStore loops on
// React #185 ("Maximum update depth exceeded") because every getSnapshot
// call returns a freshly-parsed array (different reference). Same incident
// pattern as 2026-05-01 17:30 PT in INCIDENTS.md, just on a different file
// and never reproduced after the stash.ts fix because RecentlyViewedStrip
// is mounted less aggressively than StashHeaderLink.

const KEY = "gl-recently-viewed";
const EVENT = "gl-recent-change";
const MAX = 12;
const EMPTY: readonly string[] = Object.freeze([]);

let cachedRaw: string | null | undefined = undefined;
let cachedIds: readonly string[] = EMPTY;

function readIds(): readonly string[] {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cachedRaw) return cachedIds;
    cachedRaw = raw;
    if (!raw) {
      cachedIds = EMPTY;
      return cachedIds;
    }
    const parsed = JSON.parse(raw);
    cachedIds = Array.isArray(parsed)
      ? Object.freeze(parsed.filter((x: unknown): x is string => typeof x === "string"))
      : EMPTY;
    return cachedIds;
  } catch {
    cachedIds = EMPTY;
    return cachedIds;
  }
}

function getServerSnapshot(): readonly string[] {
  return EMPTY;
}

function writeIds(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
  } catch {
    /* quota / disabled */
  }
  cachedRaw = undefined;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

// Record a view — moves the id to the front, dedupes, caps at MAX.
// Safe to call from event handlers; no-ops on server.
export function recordView(productId: string): void {
  if (typeof window === "undefined") return;
  const cur = readIds();
  const next = [productId, ...cur.filter((x) => x !== productId)].slice(0, MAX);
  writeIds(next);
}

export function useRecentlyViewed() {
  const ids = useSyncExternalStore(subscribe, readIds, getServerSnapshot);
  return { ids, count: ids.length };
}
