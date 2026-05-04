// Build identity exposed in the footer so Doug can verify a deploy landed.
// Bump BUILD_VERSION manually for major UX/feature changes; the short SHA
// comes from Vercel automatically on every deploy and is the authoritative
// "did my push actually land" signal.

// 3.176 — Apply form `?position=` deep-link support — when /careers links to /apply?position={id}, form fetches position from inventoryapp API, pre-selects role + shows 'Applying for: {title}' pill at top. Hidden positionId field passes the link to /api/applications. Silent fallback when fetch fails or position no longer open.
// 3.171 — Public /careers landing (Hiring Phase 5). Fetches open positions from inventoryapp /api/positions/open?store=wenatchee with 5-min ISR + 5s fetch timeout (falls back to "we keep good resumes on file" empty state on any failure). Position cards: title, store badges (handles either→both), pay-range/hours-pattern chips, safe-markdown description (paragraphs + bullets + **bold** only — no HTML pass-through, XSS-safe), "Apply for this role" CTA deep-linking /apply?position={id}. Hero leans on Wenatchee's "best staff" angle (no "locally-owned" framing per project_wenatchee_positioning_best_staff). Mirror on seattle-cannabis-web v4.91 with indigo theme + "since 2010" heritage angle.
// 3.166 — Public /vendor-access self-serve form for brand partners (PLAN_VENDOR_ASSETS_PORTAL path B). Lands at /vendor-access — collects company + contact + email + phone + brand confirmation + intent — POSTs JSON to inventoryapp /api/vendor-access — feeds existing /admin/vendor-access-requests admin queue. Indexed (canonical), thanks page noindex. Free-text only — no file upload. Mirror page on seattle-cannabis-web v4.86.
// 3.161 — /brands/[slug] generic-template renders vendor-authored brand bio + Instagram/X/Facebook handles when filled in via /vmi/profile (inventoryapp). Section sits above the order CTA, only renders when at least one field is non-null. Handles are sanitized to /^[A-Za-z0-9._-]+$/ before being concatenated into URLs (prevents query-param injection or path traversal). Per-brand override components (NWCS, Mfused, Avitas etc.) intentionally NOT touched — those are graduated, hand-authored layouts.
// 3.156 — /apply personality prompts: two optional written prompts (product-recommendation pitch + customer-recovery story) capture personality signal without the photo discrimination risk. Stored in applicants.metadata JSONB on inventoryapp side. Compliance: written-only — no photo (WA RCW 49.60 / EEOC pre-offer photo discrimination risk).
// 3.151 — Public /apply form: apply-to-work intake with resume upload + 3 references + 21+ confirmation. POSTs to inventoryapp /api/applications. Compliance: no photo / no SSN / no DOB.
export const BUILD_VERSION = "3.176";

export const BUILD_SHA = (
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
  "dev"
).slice(0, 7);
