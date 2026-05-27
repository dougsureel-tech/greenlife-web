// Hub-page ItemList + BreadcrumbList JSON-LD builders.
//
// Pure functions — no I/O, no React. Consumed by /heroes, /learn, /blog
// to emit Schema.org ItemList (carousel-result eligible) + a paired
// BreadcrumbList (Home › <Hub Name>) for SERP path rendering.
//
// Sister of /near + /strains which emit the same pattern inline. This
// helper centralizes the shape so adding new hub pages stays a one-liner
// and the WSLCB banned-phrase filter is applied consistently.
//
// WSLCB compliance (WAC 314-55-155):
//   Names containing efficacy / medical / promissory phrasing
//   ("treats", "cures", "relieves anxiety", etc.) get OMITTED from
//   the rendered ListItem entirely — empty fields are safer than
//   non-compliant fields. Banned-phrase set is module-scoped + tested.
//
// Pair with `safeJsonLd` at the emit-site so the script-injection escape
// is applied. This helper returns the OBJECT, never the stringified form.

// Banned phrase matchers — case-insensitive substring scan on the
// candidate `name` (and `description` if present). When ANY phrase
// matches, the field is OMITTED (not stripped — substring removal
// can leave dangling fragments worse than missing fields).
//
// Sourced from WAC 314-55-155 + the cannabis-web banned-phrase corpus
// the inv-App + sister stacks already enforce. Keep this set narrow
// + auditable — adding phrases here can suppress legitimate hub items
// (e.g. a learn topic about "what cannabinoids actually do" should
// not be omitted; a learn topic with "treats anxiety" in the title
// MUST be omitted).
const WSLCB_BANNED_NAME_PHRASES: readonly RegExp[] = [
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

/** Returns true when the input contains a WAC-314-55-155-class efficacy
 *  / medical / promissory phrase. Used to OMIT the field from the
 *  rendered ListItem; never to silently rewrite content. */
export function hasBannedPhrase(input: string | undefined): boolean {
  if (!input) return false;
  return WSLCB_BANNED_NAME_PHRASES.some((re) => re.test(input));
}

/** Shape of an individual hub-page item — same shape the /heroes,
 *  /learn, /blog hubs already render in their card grids. Names are
 *  WSLCB-filtered downstream; pass raw input here. */
export type HubItem = {
  /** Page-local relative URL (e.g. `/blog/<slug>`). Helper absolutizes
   *  against `siteOrigin` so the schema URL is always canonical-form. */
  url: string;
  /** Display name — the visible card title. WSLCB-filter applied. */
  name: string;
  /** Optional absolute image URL — passed through unchanged. */
  image?: string;
  /** Optional short description — WSLCB-filter applied (omitted when
   *  any banned phrase matches). */
  description?: string;
};

export type BuildHubItemListJsonLdInput = {
  /** Canonical site origin (e.g. `https://www.greenlifecannabis.com`).
   *  MUST NOT have a trailing slash — helper handles concat. */
  siteOrigin: string;
  /** Page-local path of the hub (e.g. `/heroes`). Must start with `/`. */
  hubPath: string;
  /** Human-readable hub name for the ItemList `name` field
   *  (e.g. "Heroes Discount Programs"). */
  hubName: string;
  /** Items rendered on the hub — order preserved into `position`. */
  items: readonly HubItem[];
};

/** Builds the Schema.org ItemList JSON-LD object for a hub page.
 *  Returns plain JSON-serializable object — caller emits via
 *  `safeJsonLd` inside a `<script type="application/ld+json">`.
 *
 *  Each item's URL is absolutized against `siteOrigin`. Names + descriptions
 *  passing the WSLCB banned-phrase scan are OMITTED. Image URLs are
 *  passed through if present (caller is responsible for absolutizing). */
export function buildHubItemListJsonLd(input: BuildHubItemListJsonLdInput) {
  const { siteOrigin, hubPath, hubName, items } = input;

  const itemListElement = items.map((item, idx) => {
    const absoluteUrl = item.url.startsWith("http")
      ? item.url
      : `${siteOrigin}${item.url.startsWith("/") ? "" : "/"}${item.url}`;

    // Compliance-safe field assembly — name/description OMITTED when
    // banned-phrase scan matches. position MUST be integer (Schema.org
    // requires Number, Google rejects "1"-as-string in Rich Results test).
    const node: {
      "@type": "ListItem";
      position: number;
      url: string;
      name?: string;
      image?: string;
      description?: string;
    } = {
      "@type": "ListItem",
      position: idx + 1,
      url: absoluteUrl,
    };

    if (!hasBannedPhrase(item.name)) {
      node.name = item.name;
    }
    if (item.image) {
      node.image = item.image;
    }
    if (item.description && !hasBannedPhrase(item.description)) {
      node.description = item.description;
    }

    return node;
  });

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${siteOrigin}${hubPath}#itemlist`,
    name: hubName,
    numberOfItems: itemListElement.length,
    itemListOrder: "https://schema.org/ItemListOrderAscending",
    itemListElement,
  };
}

export type BuildHubBreadcrumbJsonLdInput = {
  siteOrigin: string;
  hubPath: string;
  hubName: string;
};

/** Builds the Schema.org BreadcrumbList JSON-LD object for a hub page.
 *  Two-level: Home (position 1) → Hub (position 2). Both items are
 *  emitted with absolute URLs and `@type: ListItem`.
 *
 *  NOTE: most existing hub pages already emit a BreadcrumbList with
 *  the breadcrumb-jsonld.ts helper. This builder exists as a paired
 *  output for hub pages that don't yet, and to keep this module's
 *  contract complete + testable in isolation. */
export function buildHubBreadcrumbJsonLd(input: BuildHubBreadcrumbJsonLdInput) {
  const { siteOrigin, hubPath, hubName } = input;
  const hubAbsolute = `${siteOrigin}${hubPath.startsWith("/") ? "" : "/"}${hubPath}`;

  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "@id": `${hubAbsolute}#breadcrumb`,
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteOrigin,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: hubName,
        item: hubAbsolute,
      },
    ],
  };
}
