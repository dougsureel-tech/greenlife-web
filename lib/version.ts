// Build identity exposed in the footer so Doug can verify a deploy landed.
// Bump BUILD_VERSION manually for major UX/feature changes; the short SHA
// comes from Vercel automatically on every deploy and is the authoritative
// "did my push actually land" signal.

// 3.156 — /apply personality prompts: two optional written prompts (product-recommendation pitch + customer-recovery story) capture personality signal without the photo discrimination risk. Stored in applicants.metadata JSONB on inventoryapp side. Compliance: written-only — no photo (WA RCW 49.60 / EEOC pre-offer photo discrimination risk).
// 3.151 — Public /apply form: apply-to-work intake with resume upload + 3 references + 21+ confirmation. POSTs to inventoryapp /api/applications. Compliance: no photo / no SSN / no DOB.
export const BUILD_VERSION = "3.156";

export const BUILD_SHA = (
  process.env.VERCEL_GIT_COMMIT_SHA ??
  process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA ??
  "dev"
).slice(0, 7);
