import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { getOrCreatePortalUser } from "@/lib/portal";
import { ProfileForm } from "./ProfileForm";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Profile", robots: { index: false } };

export default async function ProfilePage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const portalUser = await getOrCreatePortalUser(
    userId,
    user?.emailAddresses[0]?.emailAddress,
    user?.fullName
  );

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="flex items-center gap-3">
        <a href="/account" className="text-stone-400 hover:text-stone-600 text-sm">← Account</a>
        <h1 className="text-xl font-bold text-stone-900">Profile</h1>
      </div>
      <ProfileForm user={portalUser} />
    </div>
  );
}
