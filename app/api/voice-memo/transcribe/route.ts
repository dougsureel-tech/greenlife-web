/**
 * POST /api/voice-memo/transcribe
 *
 * Bedrock-routed transcription endpoint. Fired by the upload route once
 * blob storage lands, OR by an offline retry cron for memos in queued
 * state. FedRAMP-eligible posture: Bedrock-only model selection, no
 * direct Anthropic/OpenAI provider on this path (mirrors the
 * provider-isolation doctrine pinned by
 * `feedback_email_from_send_subdomain_trap_on_m365_2026_05_19`
 * and adjacent BAA-account memory pins).
 *
 * Auth: CRON_SECRET header for retry-cron invocations OR Clerk session
 * for in-flight uploads. The upload route uses a same-host call shaped
 * with the CRON_SECRET via env (avoids double Clerk hop).
 *
 * Returns:
 *   200 — transcript text + provider tag, OR queued sentinel
 *   401 — unauthorized
 *   403 — feature off
 *   500 — provider failure (caller re-queues)
 */

import { NextRequest, NextResponse } from "next/server";
import {
  voiceMemoEnabled,
  transcribeVoiceMemoViaBedrock,
  flagModerationIssues,
  resolveModerationVerdict,
} from "@/lib/voice-memo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorizedCron(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") || "";
  return header === `Bearer ${secret}`;
}

export async function POST(req: NextRequest) {
  if (!voiceMemoEnabled()) {
    return NextResponse.json(
      { error: "Voice memo feature is not enabled." },
      { status: 403 },
    );
  }

  // CRON_SECRET-bearer auth only for this internal endpoint. Customer
  // sessions never call this directly — the upload route or the
  // offline retry cron does.
  if (!isAuthorizedCron(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { blobKey, mimeType } = body as Record<string, unknown>;
  if (typeof blobKey !== "string" || blobKey.length === 0) {
    return NextResponse.json({ error: "Missing blobKey" }, { status: 400 });
  }
  if (typeof mimeType !== "string" || mimeType.length === 0) {
    return NextResponse.json({ error: "Missing mimeType" }, { status: 400 });
  }

  // ---------------------------------------------------------------
  // 1. Call Bedrock-routed transcription (stub until provider ready)
  // ---------------------------------------------------------------
  const result = await transcribeVoiceMemoViaBedrock({ blobKey, mimeType });
  if ("queued" in result) {
    return NextResponse.json(
      {
        ok: true,
        status: "queued",
        reason: result.reason,
      },
      { status: 200 },
    );
  }

  // ---------------------------------------------------------------
  // 2. Layer 2 algorithmic moderation pass on the transcript text
  // ---------------------------------------------------------------
  const flags = flagModerationIssues(result.text);
  const verdict = resolveModerationVerdict(flags);

  // Format-only log — no PII, no full transcript.
  console.log(
    `[voice-memo] transcribed provider=${result.provider} verdict=${verdict} flags=${flags.length}`,
  );

  return NextResponse.json(
    {
      ok: true,
      status: verdict,
      provider: result.provider,
      // Caller persists the transcript + flags + verdict to the
      // customer_strain_expectations row. We DON'T echo the transcript
      // back to a client — internal caller only.
      transcript: result.text,
      flagCategories: flags.map((f) => f.category),
    },
    { status: 200 },
  );
}
