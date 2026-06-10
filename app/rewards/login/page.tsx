// /rewards/login — phone-OTP entry point.
//
// Sister-port of seattle-cannabis-web/app/rewards/login.
//
// Flow:
//   1. Customer enters phone here
//   2. Client posts to /api/rewards/request-code
//   3. Server stores code in loyalty_otp_codes + sends Twilio SMS
//   4. Customer redirected to /rewards/verify?phone=<digits>
//   5. Customer enters 6-digit code at /rewards/verify
//   6. Server matches → issues glw_rewards_session cookie
//   7. Customer redirected to /rewards/dashboard

import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in to your rewards",
  description: `Enter your phone to access your ${STORE.name} loyalty account.`,
  robots: { index: false },
};

export default function RewardsLoginPage() {
  return (
    <div className="min-h-[70vh] bg-white">
      <div className="max-w-md mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="space-y-2 text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold tracking-wide uppercase">
            Loyalty
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-stone-900 leading-tight">
            Welcome back.
          </h1>
          <p className="text-stone-500 text-sm sm:text-base">
            We&apos;ll text you a 6-digit code to confirm it&apos;s you.
          </p>
        </div>

        <div className="mt-8 sm:mt-10 rounded-3xl border border-stone-200 bg-white p-6 sm:p-7 shadow-sm">
          <LoginForm />
        </div>

        <p className="mt-6 text-xs text-stone-400 text-center px-4">
          By continuing you agree to receive a one-time SMS for sign-in.
          Standard message + data rates may apply. Reply STOP to opt out.
        </p>

        <div className="mt-8 text-center">
          <Link
            href="/account"
            className="text-sm text-stone-500 hover:text-emerald-700 font-medium"
          >
            Have an account with email? Sign in there →
          </Link>
        </div>
      </div>
    </div>
  );
}
