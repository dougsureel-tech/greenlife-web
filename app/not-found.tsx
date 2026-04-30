import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center px-4 text-center">
      <div className="space-y-8 max-w-sm">
        <div className="relative inline-flex items-center justify-center">
          <span className="text-[120px] font-extrabold text-stone-100 leading-none select-none tracking-tight">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-green-50 border-2 border-green-100 flex items-center justify-center shadow-sm">
              <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8 text-green-600" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
              </svg>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Page not found</h1>
          <p className="text-stone-500 text-sm leading-relaxed">
            This page doesn&apos;t exist — but our menu does. Browse flower, edibles, vapes, and more.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"
            className="px-5 py-2.5 rounded-xl border border-stone-200 hover:border-green-300 text-sm font-semibold text-stone-700 hover:text-green-700 transition-all">
            Back to Home
          </Link>
          <Link href="/menu"
            className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-all shadow-md hover:-translate-y-0.5">
            Browse Menu →
          </Link>
        </div>
      </div>
    </div>
  );
}
