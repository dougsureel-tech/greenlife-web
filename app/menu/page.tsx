import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { STORE } from "@/lib/store";
import { getMenuProducts, type MenuProduct } from "@/lib/db";
import { MenuSearch } from "./MenuSearch";
import { StashButton } from "@/components/StashButton";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  title: "Cannabis Menu — Live Inventory",
  description: `Live cannabis menu at ${STORE.name} in ${STORE.address.city}, WA. Flower, pre-rolls, vapes, concentrates, edibles, tinctures, and topicals from 100+ Washington-state producers. Prices, THC/CBD, strain types updated continuously. Order ahead for cash pickup. 21+, ID required.`,
  alternates: { canonical: "/menu" },
  openGraph: {
    title: `Cannabis Menu | ${STORE.name}`,
    description: `Live cannabis menu — prices, THC/CBD, lab data. ${STORE.address.full}.`,
    url: `${STORE.website}/menu`,
    type: "website",
  },
};

const CATEGORY_ORDER = ["Flower", "Pre-Rolls", "Vapes", "Concentrates", "Edibles", "Tinctures", "Topicals", "Accessories"];

const CAT_ICONS: Record<string, string> = {
  Flower: "🌿", "Pre-Rolls": "🫙", Vapes: "💨", Concentrates: "🧴",
  Edibles: "🍬", Tinctures: "💊", Topicals: "🧼", Accessories: "🔧",
};

const STRAIN_BADGE: Record<string, string> = {
  Sativa:  "bg-amber-100 text-amber-700 border-amber-200",
  Indica:  "bg-purple-100 text-purple-700 border-purple-200",
  Hybrid:  "bg-green-100 text-green-700 border-green-200",
};

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function ProductCard({ product, categorySlug }: { product: MenuProduct; categorySlug: string }) {
  const icon = CAT_ICONS[product.category ?? ""] ?? "🌱";
  const search = [product.name, product.brand, product.category, product.strainType, product.effects, product.terpenes].filter(Boolean).join(" ");

  // Filter-chip metadata for client-side filters in MenuSearch
  const priceBucket = product.unitPrice == null ? "" : product.unitPrice < 20 ? "u20" : product.unitPrice < 40 ? "20-40" : "40p";
  const thcBucket = product.thcPct == null ? "" : product.thcPct < 15 ? "low" : product.thcPct < 25 ? "mid" : "high";

  return (
    <article
      data-product-card
      data-search={search}
      data-category={categorySlug}
      data-strain={(product.strainType ?? "").toLowerCase()}
      data-price-bucket={priceBucket}
      data-thc-bucket={thcBucket}
      data-vibe={(product.effects ?? "").toLowerCase()}
      data-isnew={product.isNew ? "1" : ""}
      className="group rounded-2xl border border-stone-100 bg-white overflow-hidden hover:border-green-300 hover:shadow-lg transition-all"
    >
      <div className="aspect-square bg-stone-100 overflow-hidden relative">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl bg-gradient-to-br from-stone-100 to-stone-200">
            {icon}
          </div>
        )}
        <StashButton productId={product.id} />
        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
          {product.isNew && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold border bg-emerald-500 text-white border-emerald-600 shadow-sm">
              ✨ Just In
            </span>
          )}
          {product.strainType && STRAIN_BADGE[product.strainType] && (
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${STRAIN_BADGE[product.strainType]}`}>
              {product.strainType}
            </span>
          )}
        </div>
      </div>
      <div className="p-3 space-y-1.5">
        {product.brand && (
          <div className="text-[11px] text-stone-400 font-bold uppercase tracking-wide truncate">{product.brand}</div>
        )}
        <h3 className="font-semibold text-stone-900 text-sm leading-snug line-clamp-2 min-h-[2.5em]">{product.name}</h3>
        <div className="flex flex-wrap gap-1">
          {product.thcPct != null && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium tabular-nums">THC {product.thcPct.toFixed(1)}%</span>
          )}
          {product.cbdPct != null && product.cbdPct > 0 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-medium tabular-nums">CBD {product.cbdPct.toFixed(1)}%</span>
          )}
        </div>
        <div className="flex items-center justify-between pt-1">
          <span className="font-extrabold text-green-800 tabular-nums">
            {product.unitPrice != null && product.unitPrice > 0 ? `$${product.unitPrice.toFixed(2)}` : <span className="text-stone-400 text-sm font-medium">In store</span>}
          </span>
          <Link
            href="/order"
            className="text-[11px] font-bold text-green-700 hover:text-green-600 transition-colors"
          >
            Order →
          </Link>
        </div>
      </div>
    </article>
  );
}

export default async function MenuPage() {
  const products = await getMenuProducts().catch(() => [] as MenuProduct[]);

  // Group by category, preserving canonical order with anything unrecognized at the end.
  const grouped = new Map<string, MenuProduct[]>();
  for (const p of products) {
    const key = p.category ?? "Other";
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(p);
  }
  const categories = [
    ...CATEGORY_ORDER.filter((c) => grouped.has(c)),
    ...Array.from(grouped.keys()).filter((c) => !CATEGORY_ORDER.includes(c)),
  ].map((name) => ({ name, slug: slugify(name), count: grouped.get(name)!.length }));

  // Schema — one big array of Product/Offer + a Menu wrapper. Products
  // without a unit price are still in stock and visible on the page (we
  // show 'In store' instead of a number) — but Offer requires a price, so
  // we omit the offers block on those rows rather than emit invalid schema
  // (was crashing previously on null.toFixed()).
  const baseUrl = STORE.website;
  const productSchemas = products.map((p) => {
    const hasPrice = p.unitPrice != null && p.unitPrice > 0;
    return {
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${baseUrl}/menu#product-${p.id}`,
      name: p.name,
      ...(p.brand ? { brand: { "@type": "Brand", name: p.brand } } : {}),
      ...(p.category ? { category: p.category } : {}),
      ...(p.imageUrl ? { image: p.imageUrl } : {}),
      ...(p.effects ? { description: p.effects } : {}),
      ...(p.thcPct != null || p.strainType
        ? { additionalProperty: [
            ...(p.thcPct != null ? [{ "@type": "PropertyValue", name: "THC", value: `${p.thcPct.toFixed(1)}%` }] : []),
            ...(p.cbdPct != null && p.cbdPct > 0 ? [{ "@type": "PropertyValue", name: "CBD", value: `${p.cbdPct.toFixed(1)}%` }] : []),
            ...(p.strainType ? [{ "@type": "PropertyValue", name: "Strain Type", value: p.strainType }] : []),
          ] }
        : {}),
      ...(hasPrice
        ? {
            offers: {
              "@type": "Offer",
              price: p.unitPrice!.toFixed(2),
              priceCurrency: "USD",
              availability: "https://schema.org/InStock",
              seller: { "@id": `${baseUrl}/#dispensary` },
              url: `${baseUrl}/order`,
            },
          }
        : {}),
    };
  });

  const menuSchema = {
    "@context": "https://schema.org",
    "@type": ["Menu", "ItemList"],
    "@id": `${baseUrl}/menu#menu`,
    name: `${STORE.name} Cannabis Menu`,
    description: `Live cannabis menu at ${STORE.name} — ${products.length} products across ${categories.length} categories. ${STORE.address.full}.`,
    url: `${baseUrl}/menu`,
    inLanguage: "en-US",
    offeredBy: { "@id": `${baseUrl}/#dispensary` },
    numberOfItems: products.length,
    hasMenuSection: categories.map((c) => ({
      "@type": "MenuSection",
      name: c.name,
      url: `${baseUrl}/menu#${c.slug}`,
      numberOfItems: c.count,
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: baseUrl },
      { "@type": "ListItem", position: 2, name: "Menu", item: `${baseUrl}/menu` },
    ],
  };

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(menuSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      {productSchemas.length > 0 && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemas) }} />
      )}

      {/* Header */}
      <div className="relative overflow-hidden bg-green-950 text-white py-12 sm:py-14">
        <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)" }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">Live Menu</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">Our Menu</h1>
            <p className="text-green-300/70 mt-2 text-sm">
              {products.length > 0
                ? <>{products.length} products · {STORE.address.city}, WA · Updated continuously</>
                : <>{STORE.address.city}, WA · 21+ to purchase</>}
            </p>
          </div>
          <Link
            href="/order"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all shadow-md self-start sm:self-auto"
          >
            Order for Pickup →
          </Link>
        </div>
      </div>

      {products.length === 0 ? (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center space-y-4">
          <div className="text-5xl">🌿</div>
          <p className="text-stone-500 font-medium">Menu loading — call us for today&apos;s selection</p>
          <a href={`tel:${STORE.phoneTel}`} className="inline-block px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white font-bold text-sm transition-colors">
            Call {STORE.phone}
          </a>
        </div>
      ) : (
        <>
          <MenuSearch categories={categories} />

          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-10 sm:space-y-12">
            {categories.map((cat) => (
              <section key={cat.slug} id={cat.slug} data-category-section={cat.slug} className="scroll-mt-4">
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{CAT_ICONS[cat.name] ?? "🌱"}</span>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">{cat.name}</h2>
                  <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full tabular-nums">{cat.count}</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {grouped.get(cat.name)!.map((p) => (
                    <ProductCard key={p.id} product={p} categorySlug={cat.slug} />
                  ))}
                </div>
              </section>
            ))}

            <div id="menu-empty-state" style={{ display: "none" }} className="text-center py-12 space-y-3">
              <div className="text-4xl">🔍</div>
              <p className="text-stone-500 font-medium">No products match your search.</p>
              <p className="text-xs text-stone-400">Try a different keyword or clear the filter.</p>
            </div>

            <div className="border-t border-stone-100 pt-8 text-center space-y-2">
              <p className="text-stone-500 text-sm">
                Prices and availability subject to change. Cash only · 21+ with valid ID.
              </p>
              <p className="text-xs text-stone-400">
                Questions? Call <a href={`tel:${STORE.phoneTel}`} className="text-green-700 hover:underline font-semibold">{STORE.phone}</a>
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
