import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreatePortalUser } from "@/lib/portal";
import { HeroesForm } from "./HeroesForm";
import type { Metadata } from "next";
import type { HeroesAttestType } from "./HeroesForm";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Heroes Discount",
  robots: { index: false },
};

export default async function HeroesPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/account/heroes");

  const user = await currentUser();
  const portalUser = await getOrCreatePortalUser(
    userId,
    user?.emailAddresses[0]?.emailAddress,
    user?.fullName,
  );

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-stone-500" aria-label="Breadcrumb">
          <Link href="/account" className="hover:text-green-700 transition-colors">
            My Account
          </Link>
          <span aria-hidden>/</span>
          <span className="text-stone-700 font-semibold">Heroes Discount</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">We support local heroes</h1>
          <p className="text-sm text-stone-500 mt-1.5 leading-relaxed">
            Active military, veterans, first responders, healthcare workers, and teachers get{" "}
            <span className="font-semibold text-stone-700">30% off</span> with a valid ID.
            Tell us your background — we&apos;ll have it on file for your next visit.
          </p>
        </div>

        <HeroesForm current={(portalUser.heroesSelfAttestType as HeroesAttestType) ?? null} />

        <p className="text-xs text-center text-stone-400 leading-relaxed">
          Discount requires a valid credential at the counter.{" "}
          <Link href="/account" className="underline underline-offset-2 hover:text-green-700">
            Back to account →
          </Link>
        </p>
      </div>
    </div>
  );
}
