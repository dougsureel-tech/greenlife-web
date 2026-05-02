"use client";

import { useSyncExternalStore } from "react";

// LocalStorage-backed favorites list. No auth, no DB — just a key in
// localStorage holding an array of product IDs. Updates are broadcast via
// a custom event so multiple <StashButton> instances (and the header
// counter) stay in sync without prop drilling.

const KEY = "gl-stash";
const EVENT = "gl-stash-change";
const EMPTY: readonly string[] = Object.freeze([]);

// `useSyncExternalStore` calls getSnapshot on every render and compares the
// result with Object.is. If we returned a fresh array each time, React would
// see "snapshot changed", re-render, getSnapshot again, see another fresh
// array, re-render, … → React error #185 ("Maximum update depth exceeded").
// Cache the parsed array keyed by the raw localStorage string; invalidate on
// write. Same-tab and cross-tab events also bust the cache via the subscribe
// callback path (we re-read inside the next getSnapshot call).
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
  // Stable reference for SSR — same reasoning as the cache above.
  return EMPTY;
}

function writeIds(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* quota / disabled — silent */
  }
  // Invalidate cache so the next getSnapshot call returns the fresh value.
  cachedRaw = undefined;
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void): () => void {
  // Same-tab updates fire the custom event; cross-tab updates fire 'storage'.
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export function useStash() {
  const ids = useSyncExternalStore(subscribe, readIds, getServerSnapshot);
  return {
    ids,
    has: (id: string) => ids.includes(id),
    toggle: (id: string) => {
      const cur = readIds();
      writeIds(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
    },
    add: (id: string) => {
      const cur = readIds();
      if (!cur.includes(id)) writeIds([...cur, id]);
    },
    remove: (id: string) => {
      writeIds(readIds().filter((x) => x !== id));
    },
    clear: () => writeIds([]),
    count: ids.length,
  };
}

// Read-only one-shot count for non-React contexts. Safe on server (returns 0).
export function getStashCount(): number {
  return readIds().length;
}

// One-shot ID accessor for the /stash page — returns the snapshot at mount.
export function getStashIds(): string[] {
  return [...readIds()];
}

// Hydration helper: only render children after mount, since localStorage
// isn't available during SSR. Component caller pattern, not a hook.
export function hasMounted(): boolean {
  if (typeof window === "undefined") return false;
  return true;
}

export { KEY as STASH_STORAGE_KEY };
