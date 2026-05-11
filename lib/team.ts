// Team roster for the "Our Story" page. Includes current staff + alumni
// who shaped the shop. Add new people as a row, change `era` from current
// → alumni when they move on (don't delete — the point of including alumni
// is acknowledging that the place is built by everyone who's worked here).
//
// `photoSrc` should resolve to a file in `public/team/`. Until a photo is
// uploaded, the component renders an initials avatar — the row still
// shows up, just without a portrait.

export type TeamMember = {
  name: string;
  role: string;
  era: "current" | "alumni";
  photoSrc: string | null;
  // One-line "what they're into / known for". Keeps the page warm without
  // turning into a corporate bio dump.
  oneLine: string;
};

export const TEAM: TeamMember[] = [
  // ── Current ─────────────────────────────────────────────────────────
  // Doug + Charity removed from public-facing team page on Doug's call
  // 2026-05-07 ("take us off the website for now"). Kat carries the
  // current-team representation on her own. Doug + Charity still run
  // the place; just not surfaced on the customer-facing /our-story.
  {
    name: "Kat",
    role: "General Manager",
    era: "current",
    photoSrc: null,
    oneLine: "Runs the floor + the books + most things in between. Knows every regular by name.",
  },

  // ── Alumni — the shop is also built by people who've moved on ──────
  {
    name: "Wes",
    role: "Manager",
    era: "alumni",
    photoSrc: null,
    oneLine: "Made every customer feel like the regular they were trying to be.",
  },
  {
    name: "Shailey",
    role: "Manager",
    era: "alumni",
    photoSrc: null,
    oneLine: "Could match anyone to the right strain in about two questions.",
  },
  {
    name: "Jessica",
    role: "Budtender",
    era: "alumni",
    photoSrc: null,
    oneLine: "Welcoming presence at the counter. Carried good energy through every shift.",
  },
];

export const CURRENT_TEAM = TEAM.filter((m) => m.era === "current");
export const ALUMNI_TEAM = TEAM.filter((m) => m.era === "alumni");

// Avatar initial fallback for missing photos. `"".split(/\s+/)` returns
// `[""]` (length 1), not `[]` — without the filter, empty + whitespace-only
// inputs returned "" (blank avatar) instead of the intended "?". Filtering
// for truthy parts collapses both edge cases to the empty array.
export function initialOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}
