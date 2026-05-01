import Link from "next/link";
import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Create Account" };

const BENEFITS = [
  { emoji: "🎁", label: "15% off your first online order" },
  { emoji: "⭐", label: "Earn loyalty points on every purchase" },
  { emoji: "⚡", label: "Faster pickup — your info is saved" },
  { emoji: "🔔", label: "Drop alerts for new arrivals" },
];

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-10 sm:py-16 bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="w-full max-w-md space-y-5">
        {/* Branding header */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-green-700 mb-3">
            <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7 text-green-200" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z" />
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
              <span className="text-base shrink-0">{b.emoji}</span>
              <span>{b.label}</span>
            </li>
          ))}
        </ul>

        <SignUp />

        <div className="text-center">
          <Link href="/" className="text-xs text-stone-400 hover:text-green-700 transition-colors">
            ← Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}
