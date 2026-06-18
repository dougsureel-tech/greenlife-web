/**
 * /account/oral-history — customer's own submitted voice memos
 *
 * Per C11 §3 of /CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md
 * + §9 row 7 (customer self-delete).
 *
 * Renders the customer's full submission history with status pill
 * (pending / approved / rejected), strain it was recorded on, and a
 * delete affordance. The recorder mini-flow is also exposed here on
 * the sample strain when mock-mode is on so Doug + Kat can dogfood
 * the round-trip before verified-purchase wiring ships.
 *
 * Default-off behind VOICE_MEMO_ENABLED. When the flag is OFF the page
 * shows a soft empty-state directing the customer back to /account.
 */

import { redirect } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import {
  voiceMemoEnabled,
  voiceMemoMockMode,
  canRecordForStrain,
  getCustomerMemos,
  VOICE_MEMO_PROMPT,
  VOICE_MEMO_ATTEST_LABEL,
  VOICE_MEMO_MAX_MS,
  VOICE_MEMO_MOCK_STRAIN_SLUG,
} from "@/lib/voice-memo";
import { getPortalUserForRequest } from "@/lib/portal-request";
import { VoiceMemoRecorder } from "@/components/VoiceMemoRecorder";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Your oral history",
  robots: { index: false },
};

type Props = {
  searchParams: Promise<{ preview?: string }>;
};

const STATUS_PILL: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-200",
  approved: "bg-emerald-50 text-emerald-800 border-emerald-200",
  rejected: "bg-stone-100 text-stone-600 border-stone-200",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "In review",
  approved: "Approved",
  rejected: "Not used",
};

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default async function OralHistoryPage({ searchParams }: Props) {
  // Preview-mode escape — Doug/Kat/Austin eye the recorder render before
  // flipping VOICE_MEMO_ENABLED. Mirrors the wrapped/terpene-profile/
  // tree-growth pattern. See proxy.ts + feedback_preview_query_escape_three_layer_chain_2026_05_21.
  const { preview } = await searchParams;
  const previewMode = preview === "1" || preview === "true";

  if (previewMode) {
    const canRecordSample = canRecordForStrain(VOICE_MEMO_MOCK_STRAIN_SLUG);
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <aside
          role="note"
          className="mb-6 rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900"
        >
          <strong>Preview mode.</strong> No sign-in required. Submissions are not persisted in this view.
        </aside>
        <header>
          <h1 className="text-2xl font-bold text-stone-900">Your oral history</h1>
          <p className="mt-2 max-w-prose text-stone-700">
            You can leave a 15-second voice memo on a strain you're picking up
            for the first time. Tell us what drew you to it. Approved memos
            appear anonymously on the strain page — never your name.
          </p>
        </header>
        {canRecordSample ? (
          <div className="mt-6">
            <VoiceMemoRecorder
              strainSlug={VOICE_MEMO_MOCK_STRAIN_SLUG}
              strainName={VOICE_MEMO_MOCK_STRAIN_SLUG
                .replace(/-/g, " ")
                .replace(/\b\w/g, (c) => c.toUpperCase())}
              prompt={VOICE_MEMO_PROMPT}
              attestLabel={VOICE_MEMO_ATTEST_LABEL}
              maxMs={VOICE_MEMO_MAX_MS}
              accent="emerald"
            />
          </div>
        ) : null}
      </main>
    );
  }

  const { user: portalUser } = await getPortalUserForRequest();
  if (!portalUser) redirect("/sign-in?redirect_url=/account/oral-history");

  // Feature flag short-circuit — render a kind empty-state instead of a
  // 404 so a deeplink doesn't blow up. Page is noindex by design.
  if (!voiceMemoEnabled()) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-bold text-stone-900">Your oral history</h1>
        <p className="mt-3 text-stone-700">
          This feature isn't switched on yet. Check back soon, or{" "}
          <Link href="/account" className="text-emerald-700 underline">
            head back to your account
          </Link>
          .
        </p>
      </main>
    );
  }

  const memos = await getCustomerMemos(portalUser.id);
  const mockMode = voiceMemoMockMode();
  const canRecordSample = canRecordForStrain(VOICE_MEMO_MOCK_STRAIN_SLUG);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-stone-500">
        <Link href="/account" className="hover:text-stone-700 hover:underline">
          My account
        </Link>{" "}
        / Oral history
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-stone-900">Your oral history</h1>
        <p className="mt-2 max-w-prose text-stone-700">
          You can leave a 15-second voice memo on a strain you're picking up
          for the first time. Tell us what drew you to it. Approved memos
          appear anonymously on the strain page — never your name.
        </p>
      </header>

      {mockMode ? (
        <aside
          role="note"
          className="mt-6 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        >
          <strong>Preview mode.</strong> We're testing this surface on a
          single sample strain ({VOICE_MEMO_MOCK_STRAIN_SLUG.replace(/-/g, " ")})
          until receipt-verified recording opens up across the catalog.
        </aside>
      ) : null}

      {canRecordSample ? (
        <div className="mt-6">
          <VoiceMemoRecorder
            strainSlug={VOICE_MEMO_MOCK_STRAIN_SLUG}
            strainName={VOICE_MEMO_MOCK_STRAIN_SLUG
              .replace(/-/g, " ")
              .replace(/\b\w/g, (c) => c.toUpperCase())}
            prompt={VOICE_MEMO_PROMPT}
            attestLabel={VOICE_MEMO_ATTEST_LABEL}
            maxMs={VOICE_MEMO_MAX_MS}
            accent="emerald"
          />
        </div>
      ) : null}

      <section className="mt-8">
        <h2 className="text-lg font-semibold text-stone-900">Your memos</h2>
        {memos.length === 0 ? (
          <p className="mt-3 text-sm text-stone-600">
            You haven't submitted any memos yet. The strain page on a first-time
            pickup will offer the prompt — or use the recorder above to dogfood.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-stone-100 rounded-2xl border border-stone-200 bg-white">
            {memos.map((m) => (
              <li key={m.id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-stone-900">
                    <Link
                      href={`/strains/${m.strainSlug}`}
                      className="hover:text-emerald-700 hover:underline"
                    >
                      {m.strainSlug.replace(/-/g, " ")}
                    </Link>
                  </p>
                  {m.transcriptSnippet ? (
                    <p className="mt-1 text-sm text-stone-600">&ldquo;{m.transcriptSnippet}&rdquo;</p>
                  ) : null}
                  <p className="mt-1 text-xs text-stone-500">
                    Recorded {fmtDate(m.createdAt)}
                    {m.approvedAt ? ` · Approved ${fmtDate(m.approvedAt)}` : ""}
                  </p>
                </div>
                <span
                  className={`inline-flex h-fit items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${STATUS_PILL[m.status] || STATUS_PILL.pending}`}
                >
                  {STATUS_LABEL[m.status] || "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <p className="mt-8 text-xs text-stone-500">
        Audio recordings are private. We may transcribe the audio and show an
        anonymous text snippet on the strain page after review. You can ask us
        to delete any memo by emailing the store. WAC 314-55-155.
      </p>
    </main>
  );
}
