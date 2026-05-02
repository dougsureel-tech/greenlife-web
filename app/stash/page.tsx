import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { getMenuProducts, type MenuProduct } from "@/lib/db";
import { StashClient } from "./StashClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Your Stash",
  description: `Your saved cannabis products at ${STORE.name}. No login required — your favorites live in your browser and follow you back here next visit.`,
  alternates: { canonical: "/stash" },
  // Stash is a per-visitor view, no public content — keep it out of indexes.
  robots: { index: false, follow: true },
};

export default async function StashPage() {
  // Pre-fetch all products server-side so the client can hydrate by ID
  // without an extra round trip. The client filters down to localStorage IDs.
  const products = await getMenuProducts().catch(() => [] as MenuProduct[]);

  return (
    <div className="min-h-screen bg-stone-50">
      <section className="border-b border-stone-200 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-600">Your Stash</p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-extrabold text-stone-900 tracking-tight">
            The stuff you saved.
          </h1>
          <p className="mt-2 text-stone-600 max-w-xl">
            Heart anything on the menu and it lands here. Lives in your browser only — no account, no email, no tracking. Clear it any time.
          </p>
          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-colors shadow-sm"
            >
              ← Browse menu
            </Link>
            <Link
              href="/menu"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-stone-200 hover:border-green-300 hover:text-green-700 text-stone-600 text-sm font-bold transition-all"
            >
              Order for pickup
            </Link>
          </div>
        </div>
      </section>

      <StashClient products={products} />
    </div>
  );
}
