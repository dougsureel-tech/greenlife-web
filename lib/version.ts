// Build identity exposed in the footer so Doug can verify a deploy landed.
// Bump BUILD_VERSION manually for major UX/feature changes; the short SHA
// comes from Vercel automatically on every deploy and is the authoritative
// "did my push actually land" signal.

// 3.161 — /brands/[slug] generic-template renders vendor-authored brand bio + Instagram/X/Facebook handles when filled in via /vmi/profile (inventoryapp). Section sits above the order CTA, only renders when at least one field is non-null. Handles are sanitized to /^[A-Za-z0-9._-]+$/ before being concatenated into URLs (prevents query-param injection or path traversal). Per-brand override components (NWCS, Mfused, Avitas etc.) intentionally NOT touched — those are graduated, hand-authored layouts.
// 3.156 — /apply personality prompts: two optional written prompts (product-recommendation pitch + customer-recovery story) capture personality signal without the photo discrimination risk. Stored in applicants.metadata JSONB on inventoryapp side. Compliance: written-only — no photo (WA RCW 49.60 / EEOC pre-offer photo discrimination risk).
// 3.151 — Public /apply form: apply-to-work intake with resume upload + 3 references + 21+ confirmation. POSTs to inventoryapp /api/applications. Compliance: no photo / no SSN / no DOB.
export const BUILD_VERSION = "3.161";

export const BUILD_SHA = (
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
  "dev"
).slice(0, 7);
