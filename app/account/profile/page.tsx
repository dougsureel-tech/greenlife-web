import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getOrCreatePortalUser } from "@/lib/portal";
import { STORE } from "@/lib/store";
import { ProfileForm } from "./ProfileForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: `Profile | ${STORE.name}`,
  robots: { index: false },
};

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in?redirect_url=/account/profile");

  const user = await currentUser();
  const portalUser = await getOrCreatePortalUser(
    userId,
    user?.emailAddresses[0]?.emailAddress,
    user?.fullName,
  );
  const email = user?.emailAddresses[0]?.emailAddress ?? null;
  const memberSince = user?.createdAt ? new Date(user.createdAt) : null;

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 space-y-6">
        {/* Breadcrumb-style back nav */}
        <nav className="flex items-center gap-2 text-xs text-stone-500" aria-label="Breadcrumb">
          <Link href="/account" className="hover:text-green-700 transition-colors">My Account</Link>
          <span aria-hidden>/</span>
          <span className="text-stone-700 font-semibold">Profile</span>
        </nav>

        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900">Your profile</h1>
          <p className="text-sm text-stone-500 mt-1">
            Update your name, phone, and SMS preferences. Email is managed by your sign-in provider.
          </p>
        </div>

        {/* Account summary card — read-only fields managed by Clerk */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 space-y-3 shadow-sm">
          <p className="text-[11px] font-bold uppercase tracking-wide text-stone-400">Sign-in details</p>
          <div className="space-y-2 text-sm">
            {email && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-500">Email</span>
                <span className="text-stone-900 font-medium truncate">{email}</span>
              </div>
            )}
            <div className="flex items-center justify-between gap-3">
              <span className="text-stone-500">Loyalty points</span>
              <span className="text-stone-900 font-bold tabular-nums">{portalUser.loyaltyPoints.toLocaleString()}</span>
            </div>
            {memberSince && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-stone-500">Member since</span>
                <span className="text-stone-700">
                  {memberSince.toLocaleDateString("en-US", { year: "numeric", month: "short" })}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Editable form */}
        <ProfileForm user={portalUser} />

        {/* Help row */}
        <p className="text-xs text-center text-stone-400 leading-relaxed">
          Need to change your email, password, or sign-in method?{" "}
          <Link href="/account" className="underline underline-offset-2 hover:text-green-700">
            Manage sign-in →
          </Link>
        </p>
      </div>
    </div>
  );
}
