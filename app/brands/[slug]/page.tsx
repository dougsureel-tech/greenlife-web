import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
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
    title: brand.name,
    description: `Shop ${brand.name} cannabis products at ${STORE.name} in Wenatchee, WA. ${brand.activeSkus} products in stock.`,
    alternates: { canonical: `/brands/${slug}` },
    openGraph: {
      title: `${brand.name} | ${STORE.name}`,
      description: `Browse ${brand.name} products available at Green Life Cannabis, Wenatchee WA.`,
      ...(brand.logoUrl ? { images: [{ url: brand.logoUrl }] } : {}),
    },
  };
}

const STRAIN_COLORS: Record<string, string> = {
  sativa: "bg-red-50 text-red-700 border-red-200",
  indica: "bg-purple-50 text-purple-700 border-purple-200",
  hybrid: "bg-green-50 text-green-700 border-green-200",
};

export default async function BrandPage({ params }: Props) {
  const { slug } = await params;
  const [brand, products] = await Promise.all([
    getBrandBySlug(slug).catch(() => null),
    getBrandBySlug(slug).then((b) => b ? getBrandProducts(b.id) : []).catch(() => []),
  ]);

  if (!brand) notFound();

  const categories = [...new Set(products.map((p) => p.category ?? "Other"))].sort();

  const brandSchema = {
    "@context": "https://schema.org",
    "@type": "Brand",
    name: brand.name,
    ...(brand.website ? { url: brand.website } : {}),
    ...(brand.logoUrl ? { logo: brand.logoUrl } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(brandSchema) }}
      />

      {/* Header */}
      <div className="bg-green-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center gap-6">
          {brand.logoUrl && (
            <div className="shrink-0 w-20 h-20 rounded-xl bg-white p-2 flex items-center justify-center">
              <img src={brand.logoUrl} alt={brand.name} className="max-h-full max-w-full object-contain" />
            </div>
          )}
          <div>
            <p className="text-green-400 text-xs font-semibold uppercase tracking-widest mb-1">
              <Link href="/brands" className="hover:text-green-300 transition-colors">All Brands</Link>
              {" "}/{" "}{brand.name}
            </p>
            <h1 className="text-3xl font-bold">{brand.name}</h1>
            <p className="text-green-300/80 text-sm mt-1">
              {brand.activeSkus} product{brand.activeSkus !== 1 ? "s" : ""} at {STORE.address.city}, WA
              {brand.website && (
                <>
                  {" ·"}{" "}
                  <a href={brand.website.startsWith("http") ? brand.website : `https://${brand.website}`}
                    target="_blank" rel="noopener noreferrer"
                    className="hover:text-white transition-colors">
                    Visit website ↗
                  </a>
                </>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 space-y-10">
        {/* View on menu CTA */}
        <div className="flex items-center justify-between gap-4 p-4 rounded-2xl bg-green-50 border border-green-200">
          <p className="text-green-900 text-sm font-medium">
            Want to order {brand.name}? Browse their products on our live menu.
          </p>
          <Link href="/menu"
            className="shrink-0 px-4 py-2 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-semibold transition-colors">
            Shop Menu →
          </Link>
        </div>

        {/* Products by category */}
        {products.length === 0 ? (
          <p className="text-stone-400 text-sm text-center py-8">No products currently in stock.</p>
        ) : (
          categories.map((cat) => {
            const catProducts = products.filter((p) => (p.category ?? "Other") === cat);
            return (
              <section key={cat} className="space-y-4">
                <h2 className="text-lg font-semibold text-stone-800 border-b border-stone-200 pb-2">{cat}</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {catProducts.map((p) => {
                    const strainCls = STRAIN_COLORS[(p.strain_type ?? "").toLowerCase()] ?? "bg-stone-50 text-stone-600 border-stone-200";
                    return (
                      <div key={p.id} className="rounded-xl border border-stone-200 bg-white p-4 space-y-3 hover:border-green-300 hover:shadow-sm transition-all">
                        {p.image_url && (
                          <div className="h-36 rounded-lg overflow-hidden bg-stone-50 flex items-center justify-center">
                            <img src={p.image_url} alt={p.name} className="max-h-full max-w-full object-contain" />
                          </div>
                        )}
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h3 className="font-semibold text-stone-900 text-sm leading-tight">{p.name}</h3>
                            {p.unit_price != null && (
                              <span className="shrink-0 font-bold text-green-700 text-sm">${p.unit_price.toFixed(0)}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                            {p.strain_type && (
                              <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${strainCls}`}>
                                {p.strain_type}
                              </span>
                            )}
                            {p.thc_pct != null && (
                              <span className="text-xs text-stone-500">THC {p.thc_pct.toFixed(1)}%</span>
                            )}
                            {p.cbd_pct != null && p.cbd_pct > 0 && (
                              <span className="text-xs text-stone-500">CBD {p.cbd_pct.toFixed(1)}%</span>
                            )}
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
      </div>
    </>
  );
}
