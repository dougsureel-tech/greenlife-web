import type { Metadata } from "next";
import Link from "next/link";
import { getActiveBrands } from "@/lib/db";
import { STORE } from "@/lib/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Brands",
  description: `Explore all cannabis brands carried at ${STORE.name} in Wenatchee, WA. Click any brand to see their products on our menu.`,
  alternates: { canonical: "/brands" },
};

export default async function BrandsPage() {
  let brands = await getActiveBrands().catch(() => []);

  return (
    <>
      <div className="bg-green-950 text-white py-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <h1 className="text-3xl font-bold">Our Brands</h1>
          <p className="text-green-300/80 mt-1 text-sm">
            {brands.length} brands carried at {STORE.address.city}, WA
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {brands.length === 0 ? (
          <div className="text-center py-16 text-stone-400">
            <p className="text-lg font-medium">Brands loading soon</p>
            <p className="text-sm mt-1">Check back or browse our full menu</p>
            <Link href="/menu" className="mt-4 inline-block text-green-700 hover:underline font-medium">View menu →</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {brands.map((brand) => (
              <Link
                key={brand.id}
                href={`/brands/${brand.slug}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-stone-200 bg-white hover:border-green-300 hover:shadow-md transition-all text-center"
              >
                {brand.logoUrl ? (
                  <img
                    src={brand.logoUrl}
                    alt={brand.name}
                    className="h-14 w-full object-contain"
                  />
                ) : (
                  <div className="h-14 w-full flex items-center justify-center rounded-lg bg-green-50 text-green-800 font-bold text-sm text-center px-2 leading-tight">
                    {brand.name}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-stone-800 group-hover:text-green-800 text-sm transition-colors leading-tight">
                    {brand.name}
                  </div>
                  <div className="text-xs text-stone-400 mt-0.5">
                    {brand.activeSkus} product{brand.activeSkus !== 1 ? "s" : ""}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
