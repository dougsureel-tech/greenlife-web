// /rewards/verify?phone=<digits> — enter the 6-digit OTP code.
//
// Sister-port of seattle-cannabis-web/app/rewards/verify.
// Submitted code POSTs to /api/rewards/verify-code; on success the
// server sets the glw_rewards_session cookie and we route to
// /rewards/dashboard.

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import Link from "next/link";
import { VerifyForm } from "./VerifyForm";

export const metadata: Metadata = {
  title: "Enter your code",
  robots: { index: false },
};

type Props = { searchParams: Promise<{ phone?: string }> };

export default async function RewardsVerifyPage({ searchParams }: Props) {
  const { phone } = await searchParams;
  if (!phone) {
    // No phone = customer landed here directly. Bounce them to login.
    redirect("/rewards/login");
  }

  return (
    <div className="min-h-[70vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="space-y-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold tracking-wide uppercase">
            One more step
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
            Check your phone.
          </h1>
          <p className="text-stone-500 text-sm sm:text-base">
            We just sent a 6-digit code to your number. Enter it below.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm">
          <VerifyForm phone={phone} />
        </div>

        <div className="mt-8 text-center space-y-3">
          <Link
            href="/rewards/login"
            className="block text-sm text-stone-500 hover:text-emerald-700 font-medium"
          >
            Use a different number →
          </Link>
          <p className="text-xs text-stone-400">
            Code expires in 10 minutes. Didn&apos;t get it? Try again from the
            login page or text us back STOP if you didn&apos;t request this.
          </p>
        </div>
      </div>
    </div>
  );
}
