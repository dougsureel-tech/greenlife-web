import type { MetadataRoute } from "next";
import { STORE } from "@/lib/store";

// Revalidate every hour at CDN edge — robots.txt is fully static
// (rules only change at deploy boundary). Sister of inv v342.605
// cross-repo port. Pre-fix served `max-age=0` so every crawl
// re-rendered.
export const revalidate = 3600;

// Cannabis is regulated content. Some bot allowlists default to blocking
// regulated verticals — explicit allow ensures Claude / ChatGPT / Atlas /
// Perplexity / Gemini / Apple Intelligence can crawl and cite us. WAC +
// WSLCB compliance is preserved by content alone (no medical claims,
// no advertising-style copy on /llms-full.txt or /llms.txt) — not by
// hiding from crawlers.
//
// Companion artifacts:
//   /llms.txt       short index (Anthropic-proposed standard)
//   /llms-full.txt  long-form factual reference for citation
//   /sitemap.xml    full URL list for traditional crawlers

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // Default crawler — Google, Bing, the long tail. /account
      // is user-specific. /api, /dev, /devmenu are internal noise.
      // /stash + /quiz/unsubscribe are per-visitor / post-action surfaces
      // (page-level noindex already handles indexing but adding here
      // saves the crawl request entirely). Keep them out of the crawl
      // budget so the brand-anchor pages get the attention.
      //
      // /alumni REMOVED from disallow 2026-05-09 — v9.905 explicitly
      // added /alumni to the sitemap with reasoning "Google never
      // crawled it → 'Green Life Cannabis alumni' wouldn't surface the
      // page in search → SEO loss for alumni discovery." Robots.txt
      // disallow was contradicting that intent (robots wins over
      // sitemap, so Google would still skip /alumni). Now /alumni is
      // crawlable + indexable for the SEO purpose v9.905 enabled.
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/account",
          "/api/",
          "/dev",
          "/devmenu",
          "/order/confirmation/", // v7.685 — per-order privacy. Page
                                  // itself has robots:noindex but
                                  // Disallow saves the crawl request
                                  // if Google discovers a URL.
          "/quiz/unsubscribe",
          "/sign-in",
          "/sign-up",
          "/stash",
        ],
      },
      // ── AI search engines — explicit allow ─────────────────────────
      // OpenAI: ChatGPT (incl. browse mode + Atlas)
      { userAgent: "GPTBot", allow: "/" },
      { userAgent: "OAI-SearchBot", allow: "/" },
      { userAgent: "ChatGPT-User", allow: "/" },
      // Anthropic: Claude (incl. claude.ai search + claude-haiku citations)
      { userAgent: "ClaudeBot", allow: "/" },
      { userAgent: "Claude-Web", allow: "/" },
      { userAgent: "anthropic-ai", allow: "/" },
      // Perplexity (incl. browse mode)
      { userAgent: "PerplexityBot", allow: "/" },
      { userAgent: "Perplexity-User", allow: "/" },
      // Google Gemini (Bard) — Google-Extended is the opt-in flag for
      // Gemini training data; without it Gemini may train on the page
      // anyway but won't cite freshly.
      { userAgent: "Google-Extended", allow: "/" },
      // Apple Intelligence (iOS 18+ Siri + system-wide writing tools)
      { userAgent: "Applebot-Extended", allow: "/" },
      // Meta AI (FB/IG/WhatsApp)
      { userAgent: "FacebookBot", allow: "/" },
      { userAgent: "meta-externalagent", allow: "/" },
      // ByteDance / Doubao
      { userAgent: "Bytespider", allow: "/" },
      // Common Crawl — training data feedstock for many smaller LLMs
      { userAgent: "CCBot", allow: "/" },
      // Diffbot — citation source for several enterprise AI engines
      { userAgent: "Diffbot", allow: "/" },
      // Yandex / Russian-language AI
      { userAgent: "YandexBot", allow: "/" },
      // Cohere
      { userAgent: "cohere-ai", allow: "/" },
      // Mistral
      { userAgent: "MistralAI-User", allow: "/" },
    ],
    sitemap: `${STORE.website}/sitemap.xml`,
    host: STORE.website,
  };
}
