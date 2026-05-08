// WCAG 4.1.3 (Status Messages) — assistive tech needs to know when the
// page is loading. role="status" + aria-live announces "Loading" once
// when the spinner renders. Visual spinner unchanged. Sister: scc + inv.
export default function Loading() {
  return (
    <div
      className="flex flex-col items-center justify-center min-h-[50vh] gap-4"
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <div className="relative w-10 h-10" aria-hidden="true">
        <div className="absolute inset-0 rounded-full border-2 border-green-100" />
        <div className="absolute inset-0 rounded-full border-2 border-t-green-600 animate-spin" />
      </div>
      <p className="text-stone-400 text-sm font-medium animate-pulse">Loading…</p>
    </div>
  );
}
