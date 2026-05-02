import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getBrandBySlug, getBrandProducts, getActiveBrands } from "@/lib/db";
import { STORE } from "@/lib/store";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const brands = await getActiveBrands().catch(() => []);
  return brands.map((b) => ({ slug: b.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug).catch(() => null);
  if (!brand) return {};
  return {
    title: `${brand.name} — Cannabis at Green Life Wenatchee`,
    description: `${brand.name} cannabis at ${STORE.name} in ${STORE.address.full}. ${brand.activeSkus} product${brand.activeSkus !== 1 ? "s" : ""} in stock — flower, pre-rolls, vapes, concentrates, edibles. Order ahead for cash pickup. 21+, ID required.`,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title: `${brand.name} | ${STORE.name}`,
      description: `Browse ${brand.name} cannabis products available at ${STORE.name}, ${STORE.address.city} WA. Live menu, prices, lab data.`,
      url: `${STORE.website}/brands/${slug}`,
      type: "website",
      ...(brand.logoUrl ? { images: [{ url: brand.logoUrl }] } : {}),
    },
  };
}

const STRAIN_COLORS: Record<string, { badge: string }> = {
  sativa: { badge: "bg-amber-100 text-amber-700 border-amber-200" },
  indica: { badge: "bg-purple-100 text-purple-700 border-purple-200" },
  hybrid: { badge: "bg-green-100 text-green-700 border-green-200" },
};

const CAT_ICONS: Record<string, string> = {
  Flower: "🌿",
  "Pre-Rolls": "🫙",
  Vapes: "💨",
  Concentrates: "🧴",
  Edibles: "🍬",
  Tinctures: "💊",
  Topicals: "🧼",
  Accessories: "🔧",
};

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const brand = await getBrandBySlug(slug).catch(() => null);
  if (!brand) notFound();

  const products = await getBrandProducts(brand.id).catch(() => []);
  const categories = [...new Set(products.map((p) => p.category ?? "Other"))].sort((a, b) => {
    const order = [
      "Flower",
      "Pre-Rolls",
      "Vapes",
      "Concentrates",
      "Edibles",
      "Tinctures",
      "Topicals",
      "Accessories",
      "Other",
    ];
    return order.indexOf(a) - order.indexOf(b);
  });

  const brandUrl = `${STORE.website}/brands/${slug}`;
  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    "@id": `${brandUrl}#brand`,
    name: brand.name,
    description: `${brand.name} — Washington-state cannabis brand carried at ${STORE.name} in ${STORE.address.city}, WA. ${brand.activeSkus} active product${brand.activeSkus !== 1 ? "s" : ""} on the menu.`,
    ...(brand.website ? { url: brand.website, sameAs: [brand.website] } : {}),
    ...(brand.logoUrl ? { logo: brand.logoUrl, image: brand.logoUrl } : {}),
  };

  // Product schemas — gives AI engines structured, citable answers for
  // "{brand} cannabis Wenatchee" and "{product name} price near me" queries.
  // Tightened to unit_price > 0 (matches what's actually shown on the page)
  // and references the LocalBusiness @id from layout.tsx instead of
  // duplicating the seller's address inline.
  const productSchemas = products
    .filter((p) => p.unit_price != null && p.unit_price > 0)
    .map((p) => ({
      "@context": "https://schema.org",
      "@type": "Product",
      "@id": `${brandUrl}#product-${p.id}`,
      name: p.name,
      brand: { "@id": `${brandUrl}#brand` },
      ...(p.category ? { category: p.category } : {}),
      ...(p.image_url ? { image: p.image_url } : {}),
      ...(p.effects ? { description: p.effects } : {}),
      ...(p.thc_pct != null
        ? {
            additionalProperty: [
              { "@type": "PropertyValue", name: "THC", value: `${p.thc_pct.toFixed(1)}%` },
              ...(p.cbd_pct != null && p.cbd_pct > 0
                ? [{ "@type": "PropertyValue", name: "CBD", value: `${p.cbd_pct.toFixed(1)}%` }]
                : []),
              ...(p.strain_type
                ? [{ "@type": "PropertyValue", name: "Strain Type", value: p.strain_type }]
                : []),
            ],
          }
        : {}),
      offers: {
        "@type": "Offer",
        price: p.unit_price!.toFixed(2),
        priceCurrency: "USD",
        availability: "https://schema.org/InStock",
        availableAtOrFrom: { "@id": `${STORE.website}/#dispensary` },
        seller: { "@id": `${STORE.website}/#dispensary` },
        url: `${STORE.website}/order`,
      },
    }));

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${brandUrl}#page`,
    name: `${brand.name} at ${STORE.name}`,
    description: `${brand.activeSkus} ${brand.name} cannabis product${brand.activeSkus !== 1 ? "s" : ""} in stock at ${STORE.name}, ${STORE.address.city}, WA.`,
    url: brandUrl,
    about: { "@id": `${brandUrl}#brand` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: products.length,
      itemListElement: products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: { "@id": `${brandUrl}#product-${p.id}`, name: p.name },
      })),
    },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: STORE.website },
        { "@type": "ListItem", position: 2, name: "Brands", item: `${STORE.website}/brands` },
        { "@type": "ListItem", position: 3, name: brand.name, item: brandUrl },
      ],
    },
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {productSchemas.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchemas) }}
        />
      )}

      {/* Header */}
      <div className="bg-green-950 text-white py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-4 sm:gap-6">
          {brand.logoUrl ? (
            <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-white flex items-center justify-center shadow-xl relative overflow-hidden">
              <Image src={brand.logoUrl} alt={brand.name} fill className="object-contain p-4" unoptimized />
            </div>
          ) : (
            <div className="shrink-0 w-28 h-28 sm:w-32 sm:h-32 rounded-2xl bg-green-800 border border-green-700 flex items-center justify-center text-4xl">
              🌿
            </div>
          )}
          <div>
            <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <Link href="/brands" className="hover:text-green-300 transition-colors">
                All Brands
              </Link>
              <span className="mx-1.5 opacity-50">/</span>
              {brand.name}
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight">{brand.name}</h1>
            <p className="text-green-300/70 text-sm mt-1 flex flex-wrap items-center gap-3">
              <span>
                {brand.activeSkus} product{brand.activeSkus !== 1 ? "s" : ""} in {STORE.address.city}, WA
              </span>
              {brand.website && (
                <a
                  href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors underline underline-offset-2 text-green-400"
                >
                  Visit website ↗
                </a>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 space-y-10 sm:space-y-12">
        {/* Order CTA */}
        <div className="rounded-2xl bg-gradient-to-r from-green-800 to-emerald-800 text-white px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-base">Want to order {brand.name}?</p>
            <p className="text-green-200/80 text-sm">
              Place a pickup order and it&apos;ll be ready when you arrive.
            </p>
          </div>
          <Link
            href="/menu"
            className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 hover:bg-green-400 text-white text-sm font-bold transition-all shadow-md hover:-translate-y-0.5"
          >
            Order for Pickup →
          </Link>
        </div>

        {/* Products by category */}
        {products.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="text-4xl">🌿</div>
            <p className="text-stone-500 font-medium">No products currently in stock</p>
            <Link href="/menu" className="text-sm text-green-700 font-semibold hover:underline">
              Browse full menu →
            </Link>
          </div>
        ) : (
          categories.map((cat) => {
            const catProducts = products.filter((p) => (p.category ?? "Other") === cat);
            return (
              <section key={cat}>
                <div className="flex items-center gap-3 mb-5">
                  <span className="text-2xl">{CAT_ICONS[cat] ?? "🌱"}</span>
                  <h2 className="text-xl font-extrabold text-stone-900 tracking-tight">{cat}</h2>
                  <span className="text-xs font-medium text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">
                    {catProducts.length}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catProducts.map((p) => {
                    const strainKey = (p.strain_type ?? "").toLowerCase();
                    const strain = STRAIN_COLORS[strainKey];
                    return (
                      <div
                        key={p.id}
                        className="rounded-2xl border border-stone-100 bg-white overflow-hidden hover:border-green-300 hover:shadow-md transition-all group"
                      >
                        {p.image_url ? (
                          <div className="h-44 bg-stone-100 overflow-hidden relative">
                            <Image
                              src={p.image_url}
                              alt={p.name}
                              fill
                              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                            />
                          </div>
                        ) : (
                          <div className="h-32 bg-gradient-to-br from-stone-50 to-stone-100 flex items-center justify-center text-4xl">
                            {CAT_ICONS[cat] ?? "🌱"}
                          </div>
                        )}
                        <div className="p-4 space-y-3">
                          <div>
                            <h3 className="font-bold text-stone-900 text-sm leading-snug">{p.name}</h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {p.strain_type && strain && (
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold capitalize ${strain.badge}`}
                              >
                                {p.strain_type}
                              </span>
                            )}
                            {p.thc_pct != null && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 font-medium">
                                THC {p.thc_pct.toFixed(1)}%
                              </span>
                            )}
                            {p.cbd_pct != null && p.cbd_pct > 0 && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 font-medium">
                                CBD {p.cbd_pct.toFixed(1)}%
                              </span>
                            )}
                          </div>
                          {p.effects && <p className="text-xs text-stone-400 line-clamp-1">✨ {p.effects}</p>}
                          <div className="flex items-center justify-between pt-1 border-t border-stone-50">
                            {p.unit_price != null ? (
                              <span className="font-extrabold text-stone-900">
                                ${p.unit_price.toFixed(2)}
                              </span>
                            ) : (
                              <span className="text-stone-300">—</span>
                            )}
                            <Link
                              href="/menu"
                              className="text-xs font-bold text-green-700 hover:text-green-600 transition-colors"
                            >
                              Order →
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            );
          })
        )}

        {/* Back link */}
        <div className="pt-4 border-t border-stone-100">
          <Link
            href="/brands"
            className="text-sm text-stone-500 hover:text-green-700 font-semibold transition-colors"
          >
            ← All Brands
          </Link>
        </div>
      </div>
    </>
  );
}
