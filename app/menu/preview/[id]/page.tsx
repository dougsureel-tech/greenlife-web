import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { STORE } from "@/lib/store";
import { getPreviewProductBundle } from "@/lib/db";
import {
  WEN_OUT_THE_DOOR_MULTIPLIER,
  extractEffectChips,
  outTheDoorPrice,
  shouldUseImageFallback,
  reviewsAggregate,
  formatReviewAge,
  customerTenureLabel,
} from "@/lib/pdp-helpers";
import { getProductPlaceholderGradient } from "@/lib/product-placeholder";
import { getCategoryIcon } from "@/lib/product-placeholder-icons";

// /menu/preview/[id] = Phase 0 of the Product UX Redesign
// (PLAN_PRODUCT_UX_REDESIGN_2026_05_30.md). Read-only PDP preview surface
// that Doug can deep-link into to validate the Curaleaf-hierarchy product
// detail page BEFORE committing to a full iHJ cutover or cart/checkout
// rework.
//
// Scope (Phase 0): single hero image (or brand-fallback specimen), buy
// box w/ oversized THC%, price + "Out the door" preview, add-to-cart
// button that reuses the existing /menu-preview drawer mechanism,
// verified-purchaser reviews section, strain notes blurb. NO related
// products, NO gallery zoom, NO review-write UI.
//
// noindex: this is an internal preview surface — keep Google off it.
// /menu remains the canonical customer entry point until Doug greenlights
// a cutover.
//
// Sister: seattle-cannabis-web `app/menu/preview/[id]/page.tsx` — same
// component tree, indigo brand tokens, "Since 2010" tenure copy.

export const revalidate = 60;
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Product preview — Cutover-target PDP render",
  description: `Preview surface for the post-cutover ${STORE.name} product detail page. Not customer-indexed.`,
  robots: { index: false, follow: false },
  alternates: { canonical: "/menu" },
};

function StarRow({ score }: { score: number | null }) {
  if (score == null) return null;
  // Render 5 stars: full (≤score), half (.5 within), empty.
  const stars: ("full" | "half" | "empty")[] = [];
  for (let i = 1; i <= 5; i++) {
    if (score >= i) stars.push("full");
    else if (score >= i - 0.5) stars.push("half");
    else stars.push("empty");
  }
  return (
    <span className="inline-flex items-center gap-0.5 text-amber-500" aria-label={`${score} out of 5 stars`}>
      {stars.map((kind, i) => (
        <span key={i} aria-hidden="true" className="text-base leading-none">
          {kind === "full" ? "★" : kind === "half" ? "⯨" : "☆"}
        </span>
      ))}
    </span>
  );
}

const STRAIN_PILL: Record<string, string> = {
  Sativa: "bg-amber-100 text-amber-800 border-amber-200",
  Indica: "bg-violet-100 text-violet-800 border-violet-200",
  Hybrid: "bg-emerald-100 text-emerald-800 border-emerald-200",
  CBD: "bg-sky-100 text-sky-800 border-sky-200",
};

export default async function ProductPreviewPDP({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const bundle = await getPreviewProductBundle(id).catch(() => null);
  if (!bundle) notFound();

  const { product, reviews } = bundle;
  const effectChips = extractEffectChips(product.notes, product.effects, 3);
  const otd = outTheDoorPrice(product.unitPrice, WEN_OUT_THE_DOOR_MULTIPLIER);
  const { avgScore, count: reviewCount } = reviewsAggregate(reviews);
  const useImageFallback = shouldUseImageFallback(product.imageUrl);
  const CategoryIcon = getCategoryIcon(product.category);
  const gradient = getProductPlaceholderGradient(product.category, product.strainType);
  const strainPill = product.strainType ? STRAIN_PILL[product.strainType] ?? "bg-stone-100 text-stone-800 border-stone-200" : null;
  const tenureCopy = "Since 2014 · Wenatchee Valley";

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Preview banner — Phase 0 honesty: this is a design preview, not
          the live menu. */}
      <div className="bg-amber-100 border-b-2 border-amber-300 text-amber-900 px-4 py-3 text-sm font-semibold text-center">
        🚧 PDP preview · this is the Phase 0 product-detail design Doug is testing · live menu stays at <Link href="/menu" className="underline">/menu</Link>
      </div>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <Link href="/menu" className="text-sm text-stone-600 hover:text-green-800 inline-flex items-center gap-1">
          ← Back to menu
        </Link>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* ── Hero image (single image; gallery deferred to P1) ─────── */}
        <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-stone-100 border border-stone-200">
          {useImageFallback ? (
            <div
              role="img"
              aria-label={`${product.name} — brand-fallback specimen`}
              className={`relative w-full h-full ${gradient} flex flex-col items-center justify-center gap-3 px-6`}
            >
              <CategoryIcon className="w-24 h-24 text-stone-700/70" aria-hidden="true" />
              {product.brand ? (
                <span className="text-sm font-bold uppercase tracking-widest text-stone-800 px-4 py-1.5 bg-white/85 backdrop-blur-sm rounded-full border border-white/50 shadow-sm max-w-[85%] line-clamp-1">
                  {product.brand}
                </span>
              ) : null}
              <span className="text-xs italic text-stone-600/80 max-w-[85%] text-center">
                Photo coming soon
              </span>
            </div>
          ) : (
            <Image
              src={product.imageUrl as string}
              alt={product.name}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          )}
        </div>

        {/* ── Buy box ───────────────────────────────────────────────── */}
        <div className="space-y-5">
          {/* Brand small caps */}
          {product.brand ? (
            <p className="text-xs font-bold uppercase tracking-widest text-green-700">
              {product.brand}
            </p>
          ) : null}

          {/* Product name (display weight) */}
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-stone-900 leading-tight">
            {product.name}
          </h1>

          {/* Category + subcategory pill row */}
          <div className="flex flex-wrap items-center gap-2">
            {strainPill ? (
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${strainPill}`}>
                {product.strainType}
              </span>
            ) : null}
            {product.category ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-stone-100 text-stone-800 border-stone-200">
                {product.category}
                {product.subcategory ? ` · ${product.subcategory}` : ""}
              </span>
            ) : null}
            {product.isNew ? (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border bg-amber-100 text-amber-800 border-amber-200">
                JUST IN
              </span>
            ) : null}
          </div>

          {/* Oversized THC% — Curaleaf-stolen load-bearing trust signal */}
          {typeof product.thcPct === "number" && product.thcPct > 0 ? (
            <div className="flex items-baseline gap-3">
              <span className="text-5xl sm:text-6xl font-black text-green-800 tabular-nums tracking-tight">
                {product.thcPct.toFixed(1)}%
              </span>
              <span className="text-sm font-bold uppercase tracking-widest text-stone-600">
                THC
              </span>
              {typeof product.cbdPct === "number" && product.cbdPct > 0 ? (
                <span className="text-sm text-stone-700">
                  · CBD {product.cbdPct.toFixed(1)}%
                </span>
              ) : null}
            </div>
          ) : null}

          {/* Effect chips */}
          {effectChips.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {effectChips.map((chip) => (
                <span
                  key={chip}
                  className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-50 text-green-800 border border-green-200"
                >
                  {chip}
                </span>
              ))}
            </div>
          ) : null}

          {/* Terpene dominance pills */}
          {product.terpenes ? (
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5">
                Dominant terpenes
              </p>
              <div className="flex flex-wrap gap-2">
                {product.terpenes
                  .split(/[,;]/)
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .slice(0, 3)
                  .map((t) => (
                    <span
                      key={t}
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-stone-50 text-stone-700 border border-stone-200"
                    >
                      {t}
                    </span>
                  ))}
              </div>
            </div>
          ) : null}

          {/* Price + out-the-door */}
          {product.unitPrice != null ? (
            <div className="rounded-2xl bg-white border border-stone-200 px-5 py-4 space-y-1">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-extrabold text-stone-900 tabular-nums">
                  ${product.unitPrice.toFixed(2)}
                </span>
              </div>
              {otd != null ? (
                <p className="text-sm text-stone-600 font-medium">
                  Out the door:{" "}
                  <span className="text-stone-900 font-bold tabular-nums">
                    ${otd.toFixed(2)}
                  </span>
                  <span className="text-xs text-stone-500 ml-1.5">
                    (incl. WA 37% excise + local sales tax)
                  </span>
                </p>
              ) : null}
            </div>
          ) : (
            <div className="rounded-2xl bg-stone-100 border border-stone-200 px-5 py-4 text-sm text-stone-600">
              Price not yet listed — ask in store.
            </div>
          )}

          {/* Add to cart — full-width primary CTA */}
          <AddToCartCardClient product={product} />

          {/* Statutory line — WSLCB voice */}
          <p className="text-xs text-stone-500 leading-relaxed">
            {tenureCopy} · Cash at the counter · 21+ with valid ID · {STORE.address.city}, WA
          </p>
        </div>
      </div>

      {/* ── Reviews section (hide entire block when count = 0) ─────── */}
      {reviewCount > 0 ? (
        <section className="border-t border-stone-200 bg-white">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-6">
            <div className="flex items-center gap-3 flex-wrap">
              <h2 className="text-2xl font-extrabold tracking-tight text-stone-900">
                Reviews
              </h2>
              <StarRow score={avgScore} />
              <span className="text-sm text-stone-600 font-medium">
                {avgScore?.toFixed(1)} · {reviewCount} {reviewCount === 1 ? "review" : "reviews"}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {reviews.slice(0, 3).map((r) => (
                <div
                  key={r.id}
                  className="rounded-2xl border border-stone-200 bg-white p-4 space-y-2"
                >
                  <div className="flex items-center gap-2">
                    <StarRow score={r.rating} />
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">
                      <span aria-hidden="true">✓</span>
                      Verified purchaser
                    </span>
                  </div>
                  <p className="text-xs text-stone-500">
                    {customerTenureLabel(r.customerCreatedAt)} ·{" "}
                    {formatReviewAge(r.createdAt)}
                  </p>
                  {r.effectTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {r.effectTags.slice(0, 4).map((t) => (
                        <span
                          key={t}
                          className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-stone-100 text-stone-700"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {r.wouldBuyAgain != null ? (
                    <p className="text-xs text-stone-600">
                      Would buy again:{" "}
                      <span className="font-semibold text-stone-900">
                        {r.wouldBuyAgain ? "Yes" : "Maybe not"}
                      </span>
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* ── Strain notes blurb ─────────────────────────────────────── */}
      {product.notes ? (
        <section className="border-t border-stone-200 bg-stone-50">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-3">
            <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
              About this product
            </h2>
            <p className="text-sm text-stone-700 leading-relaxed whitespace-pre-line">
              {product.notes.length > 600
                ? `${product.notes.slice(0, 600).trim()}…`
                : product.notes}
            </p>
          </div>
        </section>
      ) : null}
    </div>
  );
}

// Inline wrapper so the page server-component can import the client
// AddToCartButton without a top-level "use client" boundary leak. The
// button is the only client island on this page — everything else is
// pure server-component / static markup.
import { AddToCartButton } from "./AddToCartButton";

function AddToCartCardClient({ product }: { product: import("@/lib/db").PreviewProduct }) {
  return (
    <AddToCartButton
      product={{
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category,
        strainType: product.strainType,
        thcPct: product.thcPct,
        cbdPct: product.cbdPct,
        unitPrice: product.unitPrice,
        imageUrl: product.imageUrl,
        effects: product.effects,
        terpenes: product.terpenes,
        isNew: product.isNew,
        isDohCompliant: product.isDohCompliant,
      }}
    />
  );
}
