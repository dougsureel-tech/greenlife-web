// Medical-no-tax pricing for DOH-verified patients.
//
// WA tax model: shelf-tag prices on cannabis are tax-inclusive — the
// customer-paid number bakes in the 37% retail excise (WAC 314-55 /
// RCW 69.50.535) + the local sales tax (Wen 8.8%, Sea 10.55%). A
// DOH-verified medical patient buying a DOH-compliant SKU is exempt
// from BOTH (RCW 82.08.9998 + RCW 69.50.535(6)(a)), so the medical
// price is the shelf price divided out by `1 + excise + sales_tax`.
//
// Wired into the order-menu render in OrderMenu.tsx: when a signed-in
// customer is DOH-verified AND the product is DOH-compliant, the card
// shows medical-no-tax as the headline price with the rec price
// strikethrough above it.
//
// Sister-ported to seattle-cannabis-web (same shape, different default).

const DEFAULT_EXCISE_RATE = 0.37;
const DEFAULT_SALES_TAX_RATE_WEN = 0.088;

function parseRate(envVal: string | undefined, fallback: number): number {
  if (!envVal) return fallback;
  const n = parseFloat(envVal);
  if (!Number.isFinite(n) || n < 0 || n > 0.5) return fallback;
  return n;
}

const EXCISE_RATE = parseRate(
  process.env.NEXT_PUBLIC_EXCISE_RATE,
  DEFAULT_EXCISE_RATE,
);

const SALES_TAX_RATE = parseRate(
  process.env.NEXT_PUBLIC_SALES_TAX_RATE,
  DEFAULT_SALES_TAX_RATE_WEN,
);

const CANNABIS_TAX_DIVISOR = 1 + EXCISE_RATE + SALES_TAX_RATE;

/** Strip cannabis excise + sales tax from a shelf-tag price. Returns a
 *  tax-exempt amount rounded to the nearest cent. Null in → null out. */
export function medicalNoTaxPrice(shelfPrice: number | null): number | null {
  if (shelfPrice == null) return null;
  return Math.round((shelfPrice / CANNABIS_TAX_DIVISOR) * 100) / 100;
}

/** The combined tax rate stripped — for "save $X" copy or savings %. */
export const CANNABIS_TAX_SAVINGS_PCT =
  Math.round(((CANNABIS_TAX_DIVISOR - 1) / CANNABIS_TAX_DIVISOR) * 1000) / 10;
