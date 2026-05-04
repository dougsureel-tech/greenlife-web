import type { Metadata } from "next";
import Link from "next/link";
import { STORE } from "@/lib/store";

// ISR — open-positions list refreshes every 5 minutes. Inventoryapp side is
// the source of truth (managers post / close roles there); a stale cache for
// up to 5 min is fine for a careers page.
export const revalidate = 300;

const POSITIONS_API =
  "https://inventoryapp-ivory.vercel.app/api/positions/open?store=wenatchee";

interface Position {
  id: string;
  title: string;
  // role_match indicates which store(s) the role is for: 'wenatchee' | 'seattle' | 'either'
  role_match?: "wenatchee" | "seattle" | "either" | null;
  store_origin?: "wenatchee" | "seattle" | null;
  description_md?: string | null;
  pay_range?: string | null;
  hours_pattern?: string | null;
  posted_at?: string | null;
}

interface PositionsResponse {
  positions: Position[];
}

// Server-side fetch with a hard 5s timeout so a slow / unreachable inventoryapp
// doesn't block the page render. Any failure path falls through to the empty
// state — visitors still see the warm "we keep good resumes on file" message
// and an Apply CTA.
async function fetchOpenPositions(): Promise<Position[]> {
  try {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), 5000);
    const res = await fetch(POSITIONS_API, {
      signal: ctrl.signal,
      next: { revalidate: 300 },
    });
    clearTimeout(timer);
    if (!res.ok) return [];
    const json = (await res.json().catch(() => null)) as PositionsResponse | null;
    if (!json || !Array.isArray(json.positions)) return [];
    return json.positions;
  } catch {
    // Network drop, timeout, DNS, parse error — all surface here. Return [] so
    // the page renders the empty state rather than 500ing.
    return [];
  }
}

export const metadata: Metadata = {
  title: "Careers — Work with Wenatchee's best cannabis staff",
  description: `Open positions at ${STORE.name} in Wenatchee. Budtender, lead, and inventory roles. Apply online — we review every application.`,
  alternates: { canonical: "/careers" },
  openGraph: {
    title: `Careers at ${STORE.name}`,
    description: `Open positions at Wenatchee's best-staffed cannabis dispensary. Apply online.`,
    url: `${STORE.website}/careers`,
    type: "website",
  },
};

export default async function CareersPage() {
  const positions = await fetchOpenPositions();

  return (
    <>
      {/* Hero — matches the green-950 dot-grid bookend used across the site. */}
      <div className="relative overflow-hidden bg-green-950 text-white py-10 sm:py-14">
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(ellipse 60% 50% at 80% 50%, #4ade80, transparent)",
          }}
        />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6">
          <p className="text-green-400 text-xs font-bold uppercase tracking-widest mb-2">
            Careers
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Work with us at Green Life Cannabis
          </h1>
          <p className="text-green-300/80 mt-3 text-sm sm:text-base leading-relaxed max-w-2xl">
            We&apos;re building Wenatchee&apos;s most knowledgeable cannabis crew — budtenders
            who actually know the catalog, leads who run a calm floor, and an inventory team
            that takes care. If you love working with people, sweat the small details, and
            want a place that takes the work seriously, we&apos;d love to hear from you.
          </p>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        {positions.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-5">
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">
              Open positions
            </h2>
            <p className="text-stone-600 text-sm">
              {positions.length === 1
                ? "1 open role right now."
                : `${positions.length} open roles right now.`}
            </p>
            <div className="space-y-4">
              {positions.map((p) => (
                <PositionCard key={p.id} p={p} />
              ))}
            </div>

            {/* General apply nudge below the list — for folks who don't see a perfect-fit
                role but still want to drop a resume. */}
            <div className="mt-10 rounded-2xl border border-stone-200 bg-stone-50 p-6 text-center">
              <p className="text-sm text-stone-700">
                Don&apos;t see a perfect fit? We keep good resumes on file.
              </p>
              <Link
                href="/apply"
                className="inline-flex items-center justify-center mt-3 px-5 py-2.5 rounded-xl bg-white border border-stone-300 text-stone-800 text-sm font-bold hover:border-green-400 hover:text-green-800 transition-colors"
              >
                Apply anyway →
              </Link>
            </div>
          </div>
        )}

        <div className="mt-12 text-center">
          <Link
            href="/menu"
            className="inline-flex items-center gap-1.5 text-sm text-stone-500 hover:text-green-700 transition-colors"
          >
            ← Back to menu
          </Link>
        </div>
      </main>
    </>
  );
}

// ── Position card ─────────────────────────────────────────────────────────

function PositionCard({ p }: { p: Position }) {
  const storeBadges = storeBadgesFor(p);
  return (
    <article className="rounded-2xl border border-stone-200 bg-white shadow-sm p-5 sm:p-7 hover:border-green-300 transition-colors">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="text-xl font-extrabold text-stone-900 tracking-tight">
            {p.title}
          </h3>
          <div className="flex flex-wrap gap-1.5 mt-2">
            {storeBadges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-green-50 text-green-800 text-[11px] font-bold uppercase tracking-wider border border-green-200"
              >
                {b}
              </span>
            ))}
          </div>
        </div>
      </div>

      {(p.pay_range || p.hours_pattern) && (
        <div className="flex flex-wrap gap-2 mb-4">
          {p.pay_range && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
              {p.pay_range}
            </span>
          )}
          {p.hours_pattern && (
            <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-stone-100 text-stone-700 text-xs font-semibold border border-stone-200">
              {p.hours_pattern}
            </span>
          )}
        </div>
      )}

      {p.description_md && (
        <div className="text-sm text-stone-700 leading-relaxed space-y-3 mb-5">
          {renderSafeMarkdown(p.description_md)}
        </div>
      )}

      <Link
        href={`/apply?position=${encodeURIComponent(p.id)}`}
        className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-colors shadow-sm"
      >
        Apply for this role →
      </Link>
    </article>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="rounded-3xl border border-stone-200 bg-white shadow-sm p-8 sm:p-12 text-center">
      <div className="w-14 h-14 mx-auto rounded-2xl bg-green-50 border border-green-200 flex items-center justify-center mb-5">
        <svg
          className="w-7 h-7 text-green-700"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </div>
      <h2 className="text-xl sm:text-2xl font-extrabold text-stone-900 tracking-tight">
        We&apos;re not actively hiring right now
      </h2>
      <p className="text-stone-600 text-sm sm:text-base leading-relaxed mt-3 max-w-md mx-auto">
        But we keep good resumes on file. If you&apos;d be a great fit when something opens
        up, we&apos;d love to meet you — apply anytime.
      </p>
      <Link
        href="/apply"
        className="inline-flex items-center justify-center mt-6 px-6 py-3 rounded-xl bg-green-700 hover:bg-green-600 text-white text-sm font-bold transition-colors shadow-sm"
      >
        Apply →
      </Link>
    </div>
  );
}

// ── Helpers ───────────────────────────────────────────────────────────────

// Compute the badge labels for a position. role_match is the canonical signal
// when present; we fall back to store_origin so legacy rows still render.
function storeBadgesFor(p: Position): string[] {
  const match = p.role_match ?? p.store_origin ?? null;
  if (match === "wenatchee") return ["Wenatchee"];
  if (match === "seattle") return ["Seattle"];
  if (match === "either") return ["Wenatchee", "Seattle"];
  return ["Wenatchee"]; // default — this is the Wenatchee site
}

// Tiny safe markdown renderer. Supports paragraphs (split on \n\n), bullets
// (lines starting with "- "), and bold via **text**. No HTML pass-through, no
// link rendering, no images. Anything else is rendered as text. This is the
// XSS-safe contract per task spec — description_md comes from the inventoryapp
// API, so we do NOT trust it.
function renderSafeMarkdown(md: string): React.ReactNode[] {
  const blocks = md
    .replace(/\r\n/g, "\n")
    .split(/\n{2,}/)
    .map((b) => b.trim())
    .filter((b) => b.length > 0);

  return blocks.map((block, bi) => {
    const lines = block.split("\n");
    const isBulletBlock = lines.every((ln) => ln.trimStart().startsWith("- "));
    if (isBulletBlock) {
      return (
        <ul key={bi} className="list-disc pl-5 space-y-1.5">
          {lines.map((ln, li) => (
            <li key={li}>{renderInlineBold(ln.trimStart().slice(2))}</li>
          ))}
        </ul>
      );
    }
    // Paragraph — preserve single newlines as <br /> so multi-line non-bullet
    // copy doesn't collapse.
    return (
      <p key={bi}>
        {lines.map((ln, li) => (
          <span key={li}>
            {renderInlineBold(ln)}
            {li < lines.length - 1 && <br />}
          </span>
        ))}
      </p>
    );
  });
}

// Inline-bold parser: splits on **…** and wraps matched runs in <strong>.
// Everything else stays plain text — React escapes it automatically, so no
// HTML can sneak through.
function renderInlineBold(text: string): React.ReactNode[] {
  const out: React.ReactNode[] = [];
  const re = /\*\*([^*]+)\*\*/g;
  let last = 0;
  let m: RegExpExecArray | null;
  let i = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      out.push(<span key={`t${i}`}>{text.slice(last, m.index)}</span>);
    }
    out.push(<strong key={`b${i}`}>{m[1]}</strong>);
    last = m.index + m[0].length;
    i++;
  }
  if (last < text.length) {
    out.push(<span key={`t${i}`}>{text.slice(last)}</span>);
  }
  return out;
}
