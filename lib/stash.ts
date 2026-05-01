"use client";

import { useEffect, useSyncExternalStore } from "react";

// LocalStorage-backed favorites list. No auth, no DB — just a key in
// localStorage holding an array of product IDs. Updates are broadcast via
// a custom event so multiple <StashButton> instances (and the header
// counter) stay in sync without prop drilling.

const KEY = "gl-stash";
const EVENT = "gl-stash-change";

function readIds(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function writeIds(ids: string[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(ids));
  } catch {
    /* quota / disabled — silent */
  }
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
  const ids = useSyncExternalStore(subscribe, readIds, () => [] as string[]);
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
  return readIds();
}

// Hydration helper: only render children after mount, since localStorage
// isn't available during SSR. Component caller pattern, not a hook.
export function hasMounted(): boolean {
  if (typeof window === "undefined") return false;
  return true;
}

export { KEY as STASH_STORAGE_KEY };
