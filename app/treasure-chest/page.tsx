import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { getTreasureChestProducts, type MenuProduct } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Treasure Chest — clearance & deep-discount deals",
  description: `Hand-picked clearance lane at ${STORE.name} — the slow-moving, last-of-the-batch, and end-of-run cannabis we'd rather see go home with you than sit on the shelf. Refreshed weekly. Cash only at pickup.`,
  alternates: { canonical: "/treasure-chest" },
  openGraph: {
    title: `Treasure Chest | ${STORE.name}`,
    description: "Clearance lane — last-of-batch flower, vapes, edibles & concentrates.",
    url: `${STORE.website}/treasure-chest`,
    type: "website",
    images: ["/opengraph-image"],
  },
};

const STRAIN_DOT: Record<string, string> = {
  Sativa: "bg-red-400",
  Indica: "bg-purple-400",
  Hybrid: "bg-green-400",
};

function ProductCard({ p }: { p: MenuProduct }) {
  return (
    <Link
      href="/menu"
      className="group rounded-xl border border-amber-200 bg-white overflow-hidden hover:border-amber-400 hover:shadow-lg transition-all relative"
    >
      <span className="absolute top-2 right-2 z-10 text-[10px] font-bold uppercase tracking-wider rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 shadow-sm">
        🪙 Treasure
      </span>
      <div className="aspect-square bg-stone-100 overflow-hidden relative">
        {p.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={p.imageUrl}
            alt={p.name}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-amber-50 to-amber-100">
            🪙
          </div>
        )}
        {p.strainType && STRAIN_DOT[p.strainType] && (
          <span
            className={`absolute top-1.5 left-1.5 w-2.5 h-2.5 rounded-full ${STRAIN_DOT[p.strainType]} shadow-sm`}
            aria-hidden
          />
        )}
      </div>
      <div className="px-3 py-2 space-y-1">
        {p.brand && (
          <div className="text-[10px] text-stone-400 font-bold uppercase tracking-wide truncate">
            {p.brand}
          </div>
        )}
        <div className="text-sm text-stone-900 leading-snug line-clamp-2 min-h-[2.6em] font-semibold">
          {p.name}
        </div>
        <div className="flex items-center justify-between pt-0.5">
          <span className="text-base font-bold text-amber-700 tabular-nums">
            {p.unitPrice != null && p.unitPrice > 0 ? `$${p.unitPrice.toFixed(2)}` : "—"}
          </span>
          {p.thcPct != null && (
            <span className="text-[10px] text-stone-500 tabular-nums">THC {p.thcPct.toFixed(0)}%</span>
          )}
        </div>
      </div>
    </Link>
  );
}

export default async function TreasureChestPage() {
  const products = await getTreasureChestProducts(60).catch(() => []);

  return (
    <div className="min-h-screen bg-amber-50">
      <section className="bg-gradient-to-b from-amber-100 via-amber-50 to-stone-50 border-b border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <p className="text-[11px] font-bold uppercase tracking-widest text-amber-700 mb-3">
            🪙 Treasure Chest
          </p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-stone-900 mb-4">
            Last-of-batch finds, marked down
          </h1>
          <p className="text-base sm:text-lg text-stone-700 max-w-2xl leading-relaxed">
            Slow-moving SKUs, end-of-run flower, vapes that didn&rsquo;t catch on, edibles approaching their best-by — all priced
            to move. Refreshed weekly. We&rsquo;d rather you find something good than have it sit on the shelf.
          </p>
          <div className="mt-6 flex flex-wrap gap-3 text-xs text-stone-600">
            <span className="rounded-full bg-white border border-amber-300 px-3 py-1">{products.length} in the chest right now</span>
            <span className="rounded-full bg-white border border-stone-200 px-3 py-1">Cash only at pickup</span>
            <span className="rounded-full bg-white border border-stone-200 px-3 py-1">21+ ID required</span>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {products.length === 0 ? (
          <div className="text-center py-16 px-6 max-w-xl mx-auto">
            <p className="text-5xl mb-4">🪙</p>
            <h2 className="text-xl font-bold text-stone-900 mb-2">The chest is empty right now</h2>
            <p className="text-stone-600 text-sm mb-6">
              Our team curates this lane manually — when there&rsquo;s nothing to clear, you&rsquo;ll see this. The full menu is still
              fully stocked.
            </p>
            <Link
              href="/menu"
              className="inline-block rounded-lg bg-green-700 hover:bg-green-600 text-white text-sm font-semibold px-5 py-2.5 transition-colors"
            >
              Browse the full menu →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-xs text-stone-500 leading-relaxed">
        <p>
          <strong className="text-stone-700">How the Treasure Chest works:</strong> our buyers tag SKUs that need to move — sometimes
          they&rsquo;re great products that just didn&rsquo;t catch on at our store, sometimes they&rsquo;re from a vendor we&rsquo;re winding down,
          sometimes they&rsquo;re approaching their best-by date but still test perfectly fine. Either way, the price reflects it. Tap
          a card to add it to the menu view; pickup is at our store.
        </p>
      </section>
    </div>
  );
}
