"use client";

import { STORE } from "@/lib/store";

// Root-layout error boundary — catches anything that escapes app/error.tsx
// (errors in the root layout itself, including ClerkProvider, SiteHeader,
// or other top-level components). Without this file, Next.js falls back to
// its bare built-in global-error UI ("This page couldn't load — Reload /
// Back"), which is the same overlay class that bit us today via the
// useSyncExternalStore React #185 incident — see INCIDENTS.md 2026-05-01.
//
// global-error must include <html> and <body> tags because the root layout
// itself failed; nothing else is rendered around it. Inline styles only —
// no Tailwind class processing happens here.

export default function GlobalError({ reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          fontFamily: "system-ui, -apple-system, sans-serif",
          background: "#f5f5f4",
          color: "#1c1917",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "1rem",
        }}
      >
        <div style={{ maxWidth: "28rem", textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>😔</div>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 700, margin: "0 0 0.5rem" }}>Something went wrong</h1>
          <p style={{ fontSize: "0.9rem", color: "#57534e", margin: "0 0 1.5rem" }}>
            We hit an unexpected error. Try refreshing the page, or call us at {STORE.phone} — we can take your order over the phone.
          </p>
          <div style={{ display: "flex", gap: "0.5rem", justifyContent: "center", flexWrap: "wrap" }}>
            <button
              onClick={reset}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "0.75rem",
                background: "#15803d",
                color: "white",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "none",
                cursor: "pointer",
              }}
            >
              Try again
            </button>
            <button
              onClick={() => {
                window.location.href = "/";
              }}
              style={{
                padding: "0.625rem 1.25rem",
                borderRadius: "0.75rem",
                background: "white",
                color: "#15803d",
                fontSize: "0.875rem",
                fontWeight: 600,
                border: "1px solid #d6d3d1",
                cursor: "pointer",
              }}
            >
              Go home
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
