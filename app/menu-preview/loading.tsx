// /menu-preview loading state — closes round-2 polish item "loading
// skeletons (3-6 placeholder cards while hydrating)" from the v36.365
// cycle-4 audit. Mirrors the page chrome (hero band + grid card shape)
// so the visual register doesn't pop on hydrate.
//
// Next App Router auto-renders this file as the Suspense fallback
// while the page Server Component awaits its Promise.all of DB +
// Clerk + closure-status calls. No data fetching here — pure visual
// skeleton. Sister scc `app/menu-preview/loading.tsx` same shape;
// hero uses bg-green-950 to match glw's page.tsx vs scc's slate-900.

export default function MenuPreviewLoading() {
  return (
    <>
      {/* Preview banner — matches page.tsx so hero doesn't shift on hydrate */}
      <div className="bg-amber-100 border-b-2 border-amber-300 text-amber-900 px-4 py-3 text-sm font-semibold text-center">
        🚧 Cutover preview · loading…
      </div>
      {/* Hero band skeleton — mirrors page.tsx visual register */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 space-y-3">
          <div className="h-3 w-20 bg-green-400/40 rounded animate-pulse" />
          <div className="h-8 w-3/4 max-w-md bg-white/20 rounded animate-pulse" />
          <div className="h-3 w-full max-w-lg bg-green-200/20 rounded animate-pulse" />
          <div className="h-3 w-2/3 max-w-sm bg-green-200/15 rounded animate-pulse" />
        </div>
      </div>
      {/* Product grid skeleton — 6 placeholder cards (covers above-the-fold
          on both mobile single-col + desktop 3-up) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 pb-12" aria-busy="true" aria-live="polite">
        <span className="sr-only">Loading menu…</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-stone-100 bg-white overflow-hidden"
            >
              <div className="relative w-full h-44 bg-stone-100 animate-pulse" />
              <div className="p-3 space-y-2">
                <div className="h-3 w-1/3 bg-stone-100 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-stone-200 rounded animate-pulse" />
                <div className="h-3 w-1/2 bg-stone-100 rounded animate-pulse" />
                <div className="flex items-center justify-between pt-2">
                  <div className="h-5 w-16 bg-stone-200 rounded animate-pulse" />
                  <div className="h-7 w-20 bg-stone-100 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
