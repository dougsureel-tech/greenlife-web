"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

// Doug 2026-05-16: smart-suggestion strip on the 404 page. Cross-stack port
// from inv-app v406.145 / VRG v9.7.192 / GW. Renders nothing for legit 404s;
// only fires when the URL is an obvious paste error.
//
// Heuristics in priority order:
//   1. File-suffix paste error — /page.tsx, /route.ts, /layout.tsx, etc.
//   2. Generic trailing extension (.ts/.tsx/.md/.html/.mdx).
//   3. Doubled segment (e.g. /menu/menu/x → /menu/x).
//
// All suggestions anchor to same-origin paths via Next.js <Link>; idempotent
// strip doesn't loop.

const FILE_SUFFIX_RE = /\/(page|layout|route|loading|error|not-found|template|default)\.(tsx?|jsx?)$/;
const TRAILING_EXT_RE = /\.(tsx?|jsx?|mdx?|md|html?)$/;

function strippedSuggestion(pathname: string): string | null {
  if (FILE_SUFFIX_RE.test(pathname)) {
    return pathname.replace(FILE_SUFFIX_RE, "") || "/";
  }
  if (TRAILING_EXT_RE.test(pathname)) {
    return pathname.replace(TRAILING_EXT_RE, "") || "/";
  }
  const segments = pathname.split("/").filter(Boolean);
  for (let i = 0; i < segments.length - 1; i++) {
    if (segments[i] === segments[i + 1]) {
      const dedup = [...segments.slice(0, i), ...segments.slice(i + 1)];
      return "/" + dedup.join("/");
    }
  }
  return null;
}

export function NotFoundSuggestions() {
  const pathname = usePathname();
  if (!pathname || pathname === "/") return null;

  const suggested = strippedSuggestion(pathname);
  if (!suggested || suggested === pathname) return null;

  return (
    <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 max-w-md mx-auto text-left">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-1">
        Did you mean?
      </p>
      <Link
        href={suggested}
        className="text-sm font-bold text-green-700 hover:text-green-800 break-all underline"
      >
        {suggested} <span aria-hidden="true">→</span>
      </Link>
      <p className="text-[11px] text-stone-500 mt-1.5 leading-snug">
        You hit{" "}
        <code className="font-mono text-stone-700 break-all">{pathname}</code>{" "}
        — looks like a file path got pasted as a URL.
      </p>
    </div>
  );
}
