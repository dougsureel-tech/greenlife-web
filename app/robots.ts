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
      // Default crawler — Google, Bing, the long tail.
      //
      // v43.246 (sister-port of scc v34.746) — REMOVED the account/auth/
      // utility roots (/account, /order/confirmation/, /quiz/unsubscribe,
      // /sign-in, /sign-up, /stash) from this Disallow list. Each of those
      // pages ALREADY emits a page-level `robots: { index: false }`, so the
      // correct way to keep them out of the index is to LET Googlebot crawl
      // them and HONOR the noindex. Disallowing them did the opposite: a
      // robots.txt block PREVENTS the crawl, so Google can never see the
      // noindex → any URL it already indexed gets stuck (GSC "Indexed,
      // though blocked by robots.txt"). The companion fix at v43.246 also
      // added `robots:{index:false}` to /rewards — the lone page in that
      // class that was still inheriting index,follow. A robots.txt block
      // alone can NEVER deindex an already-indexed URL.
      //
      // STILL blocked, deliberately:
      //   /api/        — JSON infra, no HTML to index, pure crawl waste.
      //   /menu/menu   — iHeartJane embed generates filter-permutation URLs
      //                  (e.g. /menu/menu/?filters[...]) that Google was
      //                  crawling 14-18 variants of, competing with the
      //                  homepage for crawl budget. The real menu is at
      //                  exactly /menu, so this prefix never matches it.
      //   /dev, /devmenu — internal dev surfaces (noindex,nofollow at the
      //                  page level too). Zero SEO value, linked from
      //                  nowhere public → no risk of a stuck-indexed URL,
      //                  so keeping them out of the crawl budget is safe.
      //
      // /alumni was REMOVED from disallow 2026-05-09 for the same crawl-
      // honors-noindex reasoning (v9.905 added it to the sitemap for
      // "Green Life Cannabis alumni" discovery; the disallow contradicted
      // that intent since robots wins over sitemap).
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/api/",
          "/dev",
          "/devmenu",
          "/menu/menu",
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
