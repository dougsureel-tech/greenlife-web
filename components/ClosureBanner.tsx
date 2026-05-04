import type { ClosureStatus } from "@/lib/closure-status";

// Amber banner surfaced when a manager has flagged the store closed via
// inventoryapp /admin/hours-override. Used on /menu (server-rendered) and
// /order (client-rendered). Pure presentation — caller decides when/where
// to render. Skips itself entirely when not closed so callers can drop it
// in unconditionally.

export function ClosureBanner({ closure }: { closure: ClosureStatus }) {
  if (!closure.isClosed) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      className="rounded-2xl border-2 border-amber-300 bg-amber-50 px-4 py-4"
    >
      <div className="flex items-start gap-3">
        <svg
          className="w-5 h-5 shrink-0 text-amber-700 mt-0.5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.008v.008H12v-.008z" />
        </svg>
        <div className="min-w-0">
          <p className="font-bold text-amber-900">
            We&apos;re temporarily closed today
            {closure.reason ? <> — {closure.reason}</> : null}
          </p>
          <p className="text-sm text-amber-800/80 mt-0.5">
            Online orders are paused until we reopen. Try us back soon.
          </p>
        </div>
      </div>
    </div>
  );
}
