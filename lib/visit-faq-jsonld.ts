// FAQPage JSON-LD builder for /visit + /contact.
//
// Google rewards `FAQPage` structured data with rich-result rendering in
// SERP — questions can show inline expandable answers under the result
// title. We have FAQ-shape content on /visit (hours, parking, ID, what-
// to-bring) + /contact (how to reach, hours, where) that's already
// rendered as page copy but NOT exposed as structured data. This helper
// turns a [question, answer] tuple list into the Schema.org shape.
//
// WSLCB compliance (WAC 314-55-155): the helper SKIPS questions or
// answers that trip the banned-phrase scan. This is fail-safe — bad
// content drops out of the structured data rather than being silently
// rewritten. The visible page copy is the source-of-truth; structured
// data is the projection.
//
// Sister of seattle-cannabis-web/lib/visit-faq-jsonld.ts.

import { STORE } from "./store.ts";

export type FaqEntry = {
  /** Question text — short, customer-facing. e.g. "What are your hours?" */
  question: string;
  /** Answer text — full paragraph or short phrase. Plain text (no HTML). */
  answer: string;
};

/** WSLCB banned-phrase corpus — mirror of the set in `lib/visit-from-source.tsx`
 *  + `lib/hub-itemlist-json-ld.ts`. Centralized scan for the FAQ payload so
 *  efficacy / medical / promissory phrasing never reaches structured data. */
const WSLCB_BANNED_PHRASES: readonly RegExp[] = [
  /\btreats?\b/i,
  /\bcures?\b/i,
  /\bcured\b/i,
  /\brelieves?\b/i,
  /\brelieved\b/i,
  /\bheals?\b/i,
  /\bhealed\b/i,
  /\bhealing\b/i,
  /\bremed(?:y|ies)\b/i,
  /\bmedicine\b/i,
  /\bmedicinal\b/i,
  /\bprescription\b/i,
  /\bdiagnos(?:e|es|is)\b/i,
  /\bhelps?\s+with\s+(?:anxiety|depression|pain|insomnia|cancer|ptsd|sleep)\b/i,
];

/** Returns true if input trips any WSLCB-banned phrase. */
function tripsBannedPhrase(input: string): boolean {
  return WSLCB_BANNED_PHRASES.some((re) => re.test(input));
}

/** Returns the FAQ entries with any WSLCB-tripping entries filtered out.
 *  Fail-safe: any banned-phrase trip in EITHER question or answer drops
 *  the whole entry. Caller can assert pre-filter and post-filter lengths
 *  match in test surfaces (regression pin). */
export function filterWslcbCompliantFaqs(
  entries: readonly FaqEntry[],
): readonly FaqEntry[] {
  return entries.filter(
    (e) => !tripsBannedPhrase(e.question) && !tripsBannedPhrase(e.answer),
  );
}

/** Builds the Schema.org FAQPage JSON-LD object. The `pagePath` is the
 *  relative path on the canonical site (e.g. "/visit"), absolutized against
 *  `STORE.website` for the `@id`. Empty input returns a FAQPage with empty
 *  mainEntity — caller's responsibility to skip render when length=0. */
export function buildVisitFaqJsonLd(
  pagePath: string,
  entries: readonly FaqEntry[],
): Record<string, unknown> {
  const safe = filterWslcbCompliantFaqs(entries);
  const url = pagePath.startsWith("http")
    ? pagePath
    : `${STORE.website}${pagePath.startsWith("/") ? pagePath : `/${pagePath}`}`;

  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${url}#faq`,
    mainEntity: safe.map((entry) => ({
      "@type": "Question",
      name: entry.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: entry.answer,
      },
    })),
  };
}
