import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dev Index",
  robots: { index: false, follow: false },
};

type DevLink = {
  href: string;
  label: string;
  blurb: string;
  status: "wip" | "live" | "internal";
};

const LINKS: DevLink[] = [
  {
    href: "/devmenu",
    label: "In-tree menu (WIP)",
    blurb: "The custom menu we're building to replace iHeartJane. Sidebar, filters, parsed titles.",
    status: "wip",
  },
  {
    href: "/order",
    label: "Order flow",
    blurb: "Same in-tree menu component, but the live customer-facing route + cart + pickup time.",
    status: "wip",
  },
  {
    href: "/menu",
    label: "iHeartJane embed",
    blurb: "What customers actually see right now. Comparison reference for the in-tree menu.",
    status: "live",
  },
  {
    href: "/stash",
    label: "Stash",
    blurb: "Customer-saved-products page (localStorage hydrated to full cards).",
    status: "live",
  },
  { href: "/account", label: "Account", blurb: "Signed-in customer dashboard.", status: "live" },
  // /brands index was deleted 2026-05-04 (308 → /menu via proxy.ts middleware
  // per v3.290). Per-brand boutique pages live on; sample one for preview.
  { href: "/brands/nwcs", label: "Brand page (sample)", blurb: "Per-vendor /brands/[slug] template — boutique override or generic fallback. Index deleted; only individual brand pages exist now.", status: "live" },
  { href: "/deals", label: "Deals", blurb: "Active deals page.", status: "live" },
];

const STATUS_BADGE: Record<DevLink["status"], string> = {
  wip: "bg-amber-100 text-amber-800 border-amber-200",
  live: "bg-green-100 text-green-800 border-green-200",
  internal: "bg-stone-100 text-stone-700 border-stone-200",
};

export default function DevIndexPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      <div className="space-y-2">
        <p className="text-amber-600 text-xs font-bold uppercase tracking-widest">Internal · noindex</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-stone-900">Dev Index</h1>
        <p className="text-stone-500 text-sm">
          Bookmark this page. Quick links to work-in-progress and reference routes — works against whichever
          port the dev server picked.
        </p>
      </div>

      <div className="space-y-2">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="block rounded-2xl border border-stone-200 bg-white p-4 hover:border-green-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-bold text-stone-900">{l.label}</span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${STATUS_BADGE[l.status]}`}
              >
                {l.status}
              </span>
              <code className="ml-auto text-xs text-stone-400">{l.href}</code>
            </div>
            <p className="text-sm text-stone-500">{l.blurb}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
