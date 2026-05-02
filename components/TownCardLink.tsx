"use client";

// TownCardLink — one card in the homepage "We serve the whole valley" grid.
//
// Visual: rounded card with town name + drive-time chip header, blurb body,
// "Get directions from {town} →" CTA at the bottom. Mirrors the Seattle
// mobile-fallback neighborhood card style so a customer who jumps between
// the two store sites feels the same shape under their finger. Green/emerald
// accents (NOT indigo — indigo is Seattle's identity).
//
// Future-agent seam — analytics + retargeting:
//   On click, the component sets `localStorage.gl_last_town` so future Pixel
//   snippets (Meta, Google Ads, Klaviyo) can read this for segmentation and
//   fire a `TownView` custom event from the same handler:
//     window.fbq?.('trackCustom', 'TownView', { town });
//     window.gtag?.('event', 'town_view', { town });
//   Look for the // PIXEL_SEAM marker below.

import Link from "next/link";

const STORAGE_KEY = "gl_last_town";

type Props = {
  townId: string;
  townName: string;
  driveLabel: string;
  blurb: string;
  directionsHref: string;
};

export function TownCardLink({ townId, townName, driveLabel, blurb, directionsHref }: Props) {
  function record() {
    try {
      window.localStorage.setItem(STORAGE_KEY, townId);
    } catch {
      // private mode / quota — silently ignore. Storage is opportunistic.
    }
    // PIXEL_SEAM — Meta/Google Ads/Klaviyo TownView event fires here once
    // pixels are loaded. The card carries `data-town` for tag-manager
    // rule-based capture if Doug wires GTM later.
    // window.fbq?.('trackCustom', 'TownView', { town: townId });
    // window.gtag?.('event', 'town_view', { town: townId });
  }

  return (
    <div
      data-town={townId}
      className="group flex flex-col h-full rounded-2xl border border-stone-200 bg-white p-5 shadow-sm hover:shadow-md hover:border-green-300 hover:-translate-y-0.5 transition-all"
    >
      <div className="flex items-baseline justify-between gap-2 mb-1.5">
        <h3 className="font-bold text-stone-900 text-base tracking-tight">{townName}</h3>
        <span className="text-xs font-bold text-green-700 whitespace-nowrap">{driveLabel}</span>
      </div>
      <p className="text-sm text-stone-600 leading-snug flex-1">{blurb}</p>
      <Link
        href={directionsHref}
        target="_blank"
        rel="noopener noreferrer"
        onClick={record}
        className="mt-4 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-xs font-bold transition-colors"
      >
        Get directions from {townName} <span aria-hidden>→</span>
      </Link>
    </div>
  );
}
