import { SignUp } from "@clerk/nextjs";

export const metadata = { title: "Create Account" };

export default function SignUpPage() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gradient-to-b from-stone-50 to-stone-100">
      <div className="w-full max-w-md space-y-6">
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
          <p className="text-sm text-stone-500">Create an account to earn loyalty rewards</p>
        </div>

        <SignUp />
      </div>
    </div>
  );
}
