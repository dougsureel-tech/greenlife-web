"use client";

export default function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center space-y-4">
      <span className="text-4xl">😔</span>
      <h2 className="text-xl font-bold text-stone-900">Something went wrong</h2>
      <p className="text-stone-500 text-sm max-w-xs">We hit an unexpected error. Try refreshing the page.</p>
      <button
        onClick={reset}
        className="px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
