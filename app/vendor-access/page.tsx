import type { Metadata } from "next";
import { VendorAccessForm } from "./VendorAccessForm";

// Public-facing vendor self-serve onboarding request. Admin queue at
// inventoryapp /admin/vendor-access-requests reviews + provisions logins.
// Compliance: this is a contact form, no PHI/PII beyond business contact.

export const metadata: Metadata = {
  title: "Vendor portal access — Green Life Cannabis",
  description:
    "Are you a brand we carry (or want us to carry)? Request access to our vendor portal — upload product photos, brand kits, see what we're displaying.",
  alternates: { canonical: "/vendor-access" },
  robots: { index: true, follow: true },
};

export default function VendorAccessPage() {
  return (
    <>
      <div className="relative overflow-hidden bg-green-950 text-white py-10 sm:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)" }}
        />
        <div className="relative max-w-3xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
            For brand partners
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Request vendor portal access
          </h1>
          <p className="text-green-300/80 mt-2 text-sm sm:text-base max-w-xl">
            For producers + processors we carry — or want to carry. Upload your product photos,
            logo, brand kit. See what we&apos;re currently displaying. Stop the email-zip-file
            dance.
          </p>
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 sm:p-8">
          <VendorAccessForm />
        </div>

        <div className="mt-6 text-center text-stone-500 text-xs">
          Already have an account?{" "}
          <a
            href="https://brapp.greenlifecannabis.com/vmi/login"
            className="text-green-700 font-semibold hover:underline"
          >
            Sign in to the vendor portal →
          </a>
        </div>
      </main>
    </>
  );
}
