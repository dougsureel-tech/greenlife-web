// Server-component renderer for ads from inventoryapp /admin/marketing/vendor-ads.
//
// Mount with `<VendorAdSlot slot="homepage_under_hero" />` anywhere on the
// site. Renders nothing when no active ads in that slot — calling pages
// don't need to gate-check first.
//
// Multiple ads in same slot rotate priority-DESC; we render the top N (default 1).
// For carousel-style rotation, increase `limit` and render all.

import Link from "next/link";
import { getActiveVendorAds } from "@/lib/db";

export async function VendorAdSlot({
  slot,
  limit = 1,
  className = "",
}: {
  slot: string;
  limit?: number;
  className?: string;
}) {
  const ads = await getActiveVendorAds(slot, limit).catch(() => []);
  if (ads.length === 0) return null;

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {ads.map((ad) => {
        const isExternal = ad.ctaUrl && /^https?:\/\//i.test(ad.ctaUrl);
        const cta = ad.ctaUrl ? (
          isExternal ? (
            <a
              href={ad.ctaUrl}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 text-sm font-bold underline-offset-2 underline text-green-800 hover:text-green-700"
            >
              {ad.ctaLabel ?? "Learn more →"}
            </a>
          ) : (
            <Link
              href={ad.ctaUrl}
              className="inline-flex items-center gap-1.5 text-sm font-bold underline-offset-2 underline text-green-800 hover:text-green-700"
            >
              {ad.ctaLabel ?? "Learn more →"}
            </Link>
          )
        ) : null;

        return (
          <article
            key={ad.id}
            className="rounded-2xl border border-stone-200 bg-white overflow-hidden grid grid-cols-1 sm:grid-cols-[280px_1fr]"
            data-ad-id={ad.id}
            data-ad-kind={ad.kind}
          >
            {ad.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ad.imageUrl}
                alt={ad.headline ?? ad.vendorName ?? "ad"}
                className="w-full h-full object-cover aspect-[4/3] sm:aspect-auto sm:min-h-[160px]"
              />
            ) : (
              <div className="w-full aspect-[4/3] sm:aspect-auto sm:min-h-[160px] bg-stone-100 flex items-center justify-center text-3xl">
                🌿
              </div>
            )}
            <div className="p-5 flex flex-col justify-center gap-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-stone-500">
                {ad.kind === "house" ? "From the shop" : ad.vendorName ?? "Featured partner"}
                <span className="ml-2 text-stone-400">· Sponsored</span>
              </p>
              {ad.headline && (
                <h3 className="text-lg sm:text-xl font-extrabold text-stone-900 leading-tight">
                  {ad.headline}
                </h3>
              )}
              {ad.body && <p className="text-sm text-stone-600 leading-relaxed">{ad.body}</p>}
              {cta && <div className="mt-1">{cta}</div>}
            </div>
          </article>
        );
      })}
    </div>
  );
}
