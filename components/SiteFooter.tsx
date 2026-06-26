import Link from "next/link";
import { STORE } from "@/lib/store";
import { NEAR_TOWNS } from "@/lib/near-towns";
import { STRAINS, getStrainsInCurrentWave } from "@/lib/strains";
import { BUILD_VERSION, BUILD_SHA } from "@/lib/version";
import { withAttr } from "@/lib/attribution";
import { FeedbackModalTrigger } from "@/components/FeedbackModalTrigger";

// Customer Engagement Layer Ship 4 — public-site `/feedback` modal entry.
// The footer renders a "Tell us how we're doing" trigger that opens a
// compact form (same backend, same fields, modal chrome). The trigger
// is a Client Component island; the rest of the footer stays a Server
// Component.
const INV_APP_BASE = "https://brapp.greenlifecannabis.com";

// "We serve" footer towns — the 8 closest-drive /near pages (sorted by
// driveMins, capped at 8) so the column carries real /near/<slug>
// internal-link equity to every Wenatchee-region service-area landing
// page. Pre-v34.805 these were plain prose strings — zero inbound links
// to the 19 /near pages site-wide, per the 2026-05-14 SEO audit. Pulling
// from the NEAR_TOWNS SSoT guarantees every footer link routes to a real
// page (instead of risking a dead link if STORE.nearbyTowns has a slug
// the /near route doesn't statically generate).
const FOOTER_NEAR_TOWNS = [...NEAR_TOWNS]
  .sort((a, b) => a.driveMins - b.driveMins)
  .slice(0, 8);

// "Popular strains" footer column — sitewide crawlable internal links into
// the /strains/<slug> detail subtree. WHY (2026-06-16 SEO indexation fix,
// sister-port of seattle-cannabis-web): Google indexes only 38/96 GLW strain
// detail pages — the unindexed half is ORPHANED from Google's crawl graph.
// The only page that linked to strain details (the /strains index) is itself
// weak, and NO indexed hub (homepage, /menu, brand pages, /blog) carried a
// single <a href="/strains/<slug>">. This is the EXACT orphaned state the
// /near pages were in pre-v34.805 (see FOOTER_NEAR_TOWNS above) — the same fix
// applies: a sitewide footer column lands crawlable links to the subtree on
// every already-indexed page, so passive crawl can reach + index the strain
// pages. SCC shipped this twin already (its homepage carries the same column).
// Source = getStrainsInCurrentWave() (the SAME SSoT the sitemap uses), so the
// list auto-tracks the wave cadence and never goes stale (no hardcoded slug to
// rot). First 8 wave slugs = the highest-priority / best-known strains.
// WSLCB-safe: strain NAMES only, zero effect/medical language (WAC 314-55-155).
const FOOTER_POPULAR_STRAINS = getStrainsInCurrentWave()
  .slice(0, 8)
  .map((slug) => ({ slug, name: STRAINS[slug]?.name ?? slug }))
  .filter((s) => s.name);

export function SiteFooter() {
  return (
    <footer className="bg-green-950 text-green-200">
      {/* Trust strip — thin top band of credentials. Visible-everywhere
          chrome that signals "real licensed shop" before the call to order.
          Stays compact so it reads as factual rather than marketing. */}
      <div className="border-b border-green-900/40 bg-green-950/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-[10.5px] sm:text-[11px] font-semibold uppercase tracking-[0.12em] text-green-300/80">
          <span className="flex items-center gap-1.5">
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3" aria-hidden="true">
              <path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z" />
            </svg>
            Founded 2014
          </span>
          <span className="hidden sm:inline text-green-700">·</span>
          <span>WSLCB License {STORE.wslcbLicense}</span>
          <span className="hidden sm:inline text-green-700">·</span>
          <span>21+ Verified</span>
          <span className="hidden sm:inline text-green-700">·</span>
          <span>Cash Only</span>
          <span className="hidden sm:inline text-green-700">·</span>
          <span>ADA Accessible</span>
        </div>
      </div>

      {/* Pre-footer CTA strip */}
      <div className="border-b border-green-900/60 bg-green-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <p className="font-bold text-white text-sm">Ready to order?</p>
            <p className="text-green-400/70 text-xs mt-0.5">Open daily · {STORE.address.city}, WA</p>
          </div>
          <div className="flex gap-3 shrink-0">
            <Link
              href={withAttr("/menu", "footer", "order")}
              className="px-4 py-2 rounded-xl bg-green-400 hover:bg-green-300 text-green-950 text-sm font-bold transition-colors"
            >
              Order for Pickup
            </Link>
            <Link
              href={withAttr("/menu", "footer", "browse")}
              className="px-4 py-2 rounded-xl border border-white/15 hover:border-white/30 hover:bg-white/5 text-white text-sm font-medium transition-all"
            >
              Browse Menu
            </Link>
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12 grid grid-cols-2 lg:grid-cols-5 gap-x-6 gap-y-8 sm:gap-y-10">
        {/* Brand + contact */}
        <div className="col-span-2 lg:col-span-2 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-green-700 flex items-center justify-center shrink-0">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-6 h-6 text-white"
                stroke="currentColor"
                strokeWidth="1.5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 3c0 5-3 8-3 9s1.5 3 3 3 3-2 3-3-3-4-3-9z"
                />
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12c3 0 5-1 6-3 1 2 3 3 6 3" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-base leading-tight">{STORE.name}</div>
              <div className="text-green-400/70 text-xs mt-0.5">{STORE.tagline}</div>
              <div className="text-emerald-300/70 text-[10px] mt-1 font-semibold uppercase tracking-[0.14em]">
                12+ yrs on Center Road · cash only · 21+ with valid ID
              </div>
            </div>
          </div>

          <address className="speakable-address not-italic text-sm text-green-300/80 space-y-1.5">
            <p>{STORE.address.street}</p>
            <p>
              {STORE.address.city}, {STORE.address.state} {STORE.address.zip}
            </p>
            <a
              href={`tel:${STORE.phoneTel}`}
              className="speakable-phone block hover:text-white transition-colors"
            >
              {STORE.phone}
            </a>
            <a
              href={`mailto:${STORE.email}`}
              aria-label={`Email ${STORE.name} at ${STORE.email}`}
              className="block hover:text-white transition-colors text-xs"
            >
              {STORE.email}
            </a>
          </address>

          <div className="flex flex-wrap items-center gap-3">
            <a
              href={STORE.googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs text-green-300 hover:text-white transition-all"
            >
              <svg
                className="w-3.5 h-3.5"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              Get Directions
            </a>
            {STORE.social.instagram && (
              <a
                href={STORE.social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs text-green-300 hover:text-white transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                </svg>
                Instagram
              </a>
            )}
            {STORE.social.facebook && (
              <a
                href={STORE.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-xs text-green-300 hover:text-white transition-all"
              >
                <svg
                  className="w-3.5 h-3.5"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                Facebook
              </a>
            )}
          </div>
        </div>

        {/* Hours */}
        <div className="speakable-hours space-y-3">
          <h2 className="text-white font-semibold text-xs uppercase tracking-widest">Hours</h2>
          <ul className="space-y-1.5">
            {STORE.hours.map((h) => (
              <li key={h.day} className="flex justify-between text-xs gap-4">
                <span className="text-green-400/80">{h.day.slice(0, 3)}</span>
                <span className="text-green-200/80 tabular-nums">
                  {h.open}–{h.close}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Explore — top-10 most-clicked routes only. Press / Accessibility /
            Contact / FAQ / Cannabis 101 / Account moved to the small
            secondary-links row below the main grid so Explore stays a
            scan-able marketing column, not a sitemap dump. */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-xs uppercase tracking-widest">Explore</h2>
          <ul className="space-y-2">
            {[
              { href: "/menu", label: "Shop Menu" },
              // /order proxies to /menu (proxy.ts 307); same destination,
              // preserve "Order for Pickup" affordance label since iHJ
              // Boost provides the cart flow inline at /menu.
              { href: "/menu", label: "Order for Pickup" },
              { href: "/heroes", label: "Heroes Discount" },
              { href: "/find-your-strain", label: "Find your strain" },
              { href: "/visit", label: "Visit Us" },
              { href: "/community", label: "Our Community" },
              { href: "/blog", label: "Guides" },
              { href: "/about", label: "About Us" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className="text-xs text-green-300/80 hover:text-white transition-colors">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Popular strains — sitewide internal-link equity into the
            /strains/<slug> detail subtree (2026-06-16 indexation fix,
            sister-port of seattle-cannabis-web). The unindexed half of the
            /strains/* subtree (38/96 indexed) was orphaned from Google's
            crawl graph — no indexed hub linked to a strain detail page;
            this column lands crawlable links on every already-indexed page
            so passive crawl can discover + index them. Strain category hubs
            (/strains, indica, sativa, hybrid) are linked too so the type
            landing pages get the same discovery boost. Slugs auto-track the
            wave via getStrainsInCurrentWave() (same SSoT as the sitemap) —
            no hardcoded list to rot. WSLCB-safe: names only, no effects. */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-xs uppercase tracking-widest">Popular strains</h2>
          <ul className="space-y-2">
            {FOOTER_POPULAR_STRAINS.map((s) => (
              <li key={s.slug}>
                <Link
                  href={`/strains/${s.slug}`}
                  className="text-xs text-green-300/80 hover:text-white transition-colors inline-flex items-baseline"
                >
                  <span className="text-green-400/40 mr-1">·</span>
                  {s.name}
                </Link>
              </li>
            ))}
            <li className="pt-1">
              <Link
                href="/strains"
                className="text-xs font-semibold text-green-200/90 hover:text-white transition-colors"
              >
                All strains →
              </Link>
            </li>
          </ul>
          <ul className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
            {[
              { href: "/strains/indica", label: "Indica" },
              { href: "/strains/sativa", label: "Sativa" },
              { href: "/strains/hybrid", label: "Hybrid" },
            ].map(({ href, label }) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-[11px] text-green-400/70 hover:text-white transition-colors"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Nearby towns — internal-link / local-SEO equity to the 19
            /near/<slug> service-area landing pages. Pre-v34.805 these
            were prose strings with zero outbound href → 19 well-built
            /near pages were effectively orphaned from the site. Each
            link routes to a real page (towns pulled from NEAR_TOWNS
            SSoT, sorted by drive time). */}
        <div className="space-y-3">
          <h2 className="text-white font-semibold text-xs uppercase tracking-widest">Around the Valley</h2>
          <ul className="space-y-2">
            {FOOTER_NEAR_TOWNS.map((town) => (
              <li key={town.slug}>
                <Link
                  href={`/near/${town.slug}`}
                  className="text-xs text-green-300/80 hover:text-white transition-colors inline-flex items-baseline"
                >
                  <span className="text-green-400/40 mr-1">·</span>
                  {town.name}, WA
                </Link>
              </li>
            ))}
          </ul>
          <p className="text-[10px] text-green-400/40 leading-relaxed pt-1">
            Easy drive from anywhere in NCW. On US-2 between Cascades and Lake Chelan.
          </p>
        </div>
      </div>

      {/* Secondary links row — Contact / FAQ / Cannabis 101 / Account /
          Press / Accessibility. Reference + utility routes that don't
          belong in the marketing Explore column. The "Tell us how we're
          doing" trigger is a Client-Component island (FeedbackModalTrigger)
          that opens the compact `/feedback` form in a modal — same backend
          + fields as the full `/feedback` page. Ship 4 of the Customer
          Engagement Layer (memo § 4). */}
      <div className="border-t border-green-900/40 px-4 sm:px-6 py-4">
        <ul className="max-w-7xl mx-auto flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] text-green-400/70">
          {[
            { href: "/contact", label: "Contact" },
            { href: "/faq", label: "FAQ" },
            { href: "/learn", label: "Cannabis 101" },
            { href: "/account", label: "My Account" },
            { href: "/press", label: "Press" },
            { href: "/accessibility", label: "Accessibility" },
            { href: "/privacy", label: "Privacy" },
            { href: "/health-data-policy", label: "Health Data" },
            { href: "/terms-of-use", label: "Terms" },
          ].map(({ href, label }) => (
            <li key={href}>
              <Link href={href} className="hover:text-white transition-colors">
                {label}
              </Link>
            </li>
          ))}
          <li>
            <FeedbackModalTrigger
              apiBase={INV_APP_BASE}
              store="wen"
              triggerClassName="hover:text-white transition-colors"
              triggerLabel="Tell us how we're doing"
            />
          </li>
        </ul>
      </div>

      {/* WAC 314-55-082 statutory health warning. VERBATIM from the
          Washington statute — same text Uncle Ike's renders site-wide.
          Sits above the copyright bar so it reads as compliance copy,
          not marketing. Amber tint signals "warning/legal", not "promo".
          Doug 2026-05-02 greenlit per `Green Life/PLAN_LEGAL_WARNINGS.md`. */}
      <div className="border-t border-amber-300/30 bg-amber-400/5 py-4 px-4 sm:px-6">
        <p className="max-w-7xl mx-auto text-[11px] leading-relaxed text-amber-200/85">
          <span className="font-extrabold uppercase tracking-widest text-amber-300">
            Warning ·
          </span>{" "}
          This product has intoxicating effects and may be habit forming. Smoking is hazardous to
          your health. There may be health risks associated with consumption of this product.
          Should not be used by women that are pregnant or breast feeding. Marijuana can impair
          concentration, coordination, and judgment. Do not operate a vehicle or machinery while
          under the influence of this drug. For use only by adults twenty-one and older. Keep out
          of the reach of children.
        </p>
      </div>

      {/* Sister-shop cross-link — separate WA cannabis retailer over in
          Seattle. Mutual link helps both domains' authority + serves the
          actual customer who travels between the two regions. Footer
          placement keeps it as a "good neighbor" mention rather than
          competing with our own primary CTAs. */}
      <div className="border-t border-green-900/60 py-3 px-4 sm:px-6 text-center">
        <p className="text-xs text-green-400/70">
          Visiting Seattle? Our friends at{" "}
          <a
            href="https://www.seattlecannabis.co"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-green-300 underline-offset-4 hover:underline hover:text-green-200 transition-colors"
          >
            Seattle Cannabis Co. ↗
          </a>{" "}
          — Rainier Valley since 2018, same crew since 2010.
        </p>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-green-900/60 py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-green-500/70">
          <p>
            © {new Date().getFullYear()} {STORE.name} · Wenatchee, WA · 21+ with valid ID
          </p>
          <p className="flex items-center gap-3">
            <span>Licensed WA Cannabis Retailer</span>
            {STORE.wslcbLicense && <span className="font-mono">#{STORE.wslcbLicense}</span>}
          </p>
        </div>
        {/* Powered-by-CannAgent credit + build identity. CannAgent is
            the SaaS product that runs both Green Life Cannabis +
            Seattle Cannabis Co — positioning GLW + SCC as reference
            installs of the product, not "consulting clients of Sureel
            AI." Doug 2026-05-17 brand-positioning correction: the
            consulting-firm framing (Sureel AI) was understating CannAgent
            and over-attributing to the consultancy. CannAgent.ai is the
            product surface dispensary prospects land on; pointing
            outbound traffic there from the live customer footer feeds
            the parent product brand instead of the consultancy. Sister
            scc same-push. Previous attribution: "Built by Sureel AI"
            pointing at sureelai.com (active 2026-05-02 → 2026-05-17). */}
        <p className="max-w-7xl mx-auto mt-2 flex items-center justify-between text-[9px] font-mono tabular-nums text-green-500/30">
          <a
            href="https://cannagent.ai/"
            target="_blank"
            rel="noopener noreferrer"
            className="font-sans text-[10px] hover:text-green-300/80 transition-colors"
          >
            Powered by CannAgent ↗
          </a>
          <span className="select-all">
            v{BUILD_VERSION} · {BUILD_SHA}
          </span>
        </p>
      </div>
    </footer>
  );
}
