"use client";

import { useSyncExternalStore } from "react";

// Same localStorage / custom-event pattern as lib/stash.ts. Holds the last
// 12 product IDs the visitor showed intent on (saved to stash, tapped the
// Order link, etc.) so we can surface them as a "Recently looking at" strip.

const KEY = "gl-recently-viewed";
const EVENT = "gl-recent-change";
const MAX = 12;

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids.slice(0, MAX)));
  } catch {
    /* quota / disabled */
  }
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
  const ids = useSyncExternalStore(subscribe, readIds, () => [] as string[]);
  return { ids, count: ids.length };
}
