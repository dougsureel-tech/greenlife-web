import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata = {
  // Root layout's title.template appends " | Green Life Cannabis" automatically.
  title: "Create Account",
  robots: { index: false },
};

const BENEFITS = [
  { emoji: "🎁", label: "15% off your first online order" },
  { emoji: "⭐", label: "Earn loyalty points on every purchase" },
  { emoji: "⚡", label: "Faster pickup — your info is saved" },
  { emoji: "🔔", label: "Drop alerts for new arrivals" },
];

const clerkAppearance = {
  variables: {
    colorPrimary: "#15803d",
    colorText: "#1c1917",
    colorTextSecondary: "#57534e",
    colorBackground: "#ffffff",
    colorInputBackground: "#fafaf9",
    colorInputText: "#1c1917",
    borderRadius: "0.75rem",
    fontFamily: "inherit",
  },
  elements: {
    rootBox: "w-full",
    card: "shadow-none border border-stone-200 rounded-2xl bg-white",
    headerTitle: "hidden",
    headerSubtitle: "hidden",
    socialButtonsBlockButton:
      "border border-stone-200 hover:border-green-300 hover:bg-stone-50 transition-colors",
    formButtonPrimary: "bg-green-700 hover:bg-green-600 transition-colors normal-case font-bold",
    formFieldInput:
      "border border-stone-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500",
    footerActionLink: "text-green-700 hover:text-green-600 font-bold",
    identityPreviewEditButton: "text-green-700",
  },
};

type Props = { searchParams: Promise<{ redirect_url?: string; redirectUrl?: string }> };

export default async function SignUpPage({ searchParams }: Props) {
  const params = await searchParams;
  const fallback = params.redirect_url || params.redirectUrl || "/account";

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 sm:py-16 bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="w-full max-w-md space-y-5">
        {/* Branding header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-700 mb-3">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              className="w-7 h-7 text-green-200"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-green-700">Green Life Cannabis</p>
          <h1 className="text-2xl font-extrabold text-stone-900">Join the club</h1>
          <p className="text-sm text-stone-500">Free account · 30 seconds · 21+ to enroll</p>
        </div>

        {/* Benefits */}
        <ul className="rounded-2xl border border-green-100 bg-white px-5 py-4 space-y-2.5">
          {BENEFITS.map((b) => (
            <li key={b.label} className="flex items-center gap-3 text-sm text-stone-700">
              <span className="text-base shrink-0" aria-hidden>
                {b.emoji}
              </span>
              <span>{b.label}</span>
            </li>
          ))}
        </ul>

        <SignUp appearance={clerkAppearance} fallbackRedirectUrl={fallback} signInUrl="/sign-in" />

        {/* Escape hatches */}
        <div className="flex items-center justify-between text-xs text-stone-500">
          <Link href="/menu" className="hover:text-green-700 transition-colors font-semibold">
            Continue as guest →
          </Link>
          <Link href="/" className="hover:text-green-700 transition-colors">
            ← Back to home
          </Link>
        </div>

        {/* Age + privacy reassurance */}
        <p className="text-[11px] text-center text-stone-400 leading-relaxed">
          By creating an account you confirm you&apos;re{" "}
          <strong className="text-stone-500">21 or older</strong>. We don&apos;t sell your data. SMS opt-in is
          separate and always optional. Cash payment at the store.
        </p>
      </div>
    </div>
  );
}
