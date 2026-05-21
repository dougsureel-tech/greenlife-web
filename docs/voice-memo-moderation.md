# Voice-memo moderation — WAC 314-55-155 guardrails

Companion doc for C11 ("First-Time Voice Memo / Oral History") per
`/CODE/Green Life/PLAN_STRAIN_TREE_INNOVATION_2026_05_21.md` §C11.

## Why this exists

The voice-memo surface lets customers record a 15-second clip about what
they HOPE coming into a strain — NOT what they expect to feel from it.
That distinction is what keeps the surface WAC-safe by design. The prompt
itself is the first layer of safety: when the customer is asked
*"what are you hoping for?"* the answer space naturally tilts toward
curiosity, aroma, lineage, peer recommendation, novelty — and away from
predictable-effect framing.

The three-layer moderation pipeline backstops the prompt for the edge
cases where a customer answers the question they were NOT asked.

## Layer 1 — pre-record customer checkbox

Before the recorder opens, the customer must check:

> "I'll talk about what I'm HOPING for from this strain — not what I
> expect it to do for me."

The label is enforced client-side and ALSO re-checked server-side at
upload time (the upload route rejects when `attestExpectationsOnly` is
not literally `true`).

## Layer 2 — algorithmic transcript pass

After server-side transcription (Bedrock-routed Whisper-equivalent OR
queued for offline review when not available), the transcript text runs
through a regex sweep at `lib/voice-memo.ts` via `flagModerationIssues`.
The patterns are loaded as arrays of token + role pairs at module-init
time so the sweep is line-by-line and the source file does NOT contain
the literal therapeutic-verb + condition-noun pairings that the
`check-efficacy-claims` build gate scans for. (See
`scripts/check-efficacy-claims.mjs` for the upstream pattern set this
mirrors.)

Categories that auto-reject:

1. **Therapeutic verbs paired with condition nouns.** Verbs like
   "treats / cures / relieves / fixes / helps with / good for" tokenised
   alongside symptom nouns like the standard WAC-flagged set
   (anxiety/insomnia/sleep/pain/depression/PTSD/nausea/inflammation/
   stress). The pair is what's flagged — a customer saying "I want to
   chill" or "I'm hoping for sleep tonight" without the therapeutic
   verb is allowed (process+experience vocabulary).
2. **Pharmacological descriptors.** anti-anxiety, anxiolytic,
   anti-inflammatory, analgesic, sedative.
3. **Predictable-effect attribution.** "tends toward sedating",
   "often uplifting", "calmer cannabinoid", "takes the edge off".
4. **Medical-context disclosure.** Patient-identifying phrases like
   "my doctor", "my prescription", "I have <condition>" — auto-flagged
   for Kat-eye review (not auto-reject) so the customer isn't blocked
   for sharing context, but the public aggregation never sees it.

When auto-reject fires, the memo's `status` is set to `rejected` and
`moderation_flags` records WHICH category(ies) tripped. The customer
sees a soft message: *"Thanks — this one didn't fit our 'what are you
hoping for' prompt. You can re-record if you'd like."* No public
explanation of WHICH word tripped (avoids gaming).

## Layer 3 — Kat-eye queue

`status='pending'` memos that survive layers 1+2 land in an admin queue
(post-cutover work — UI lives in inv-App `/admin/voice-memos` once
shipped). Kat reviews 24h SLA. Approves → `status='approved'`,
populates `approved_at`. Rejects → `status='rejected'`. Approval criteria:

- Audio is intelligible (else reject + re-record nudge).
- Transcript matches audio reasonably (else reject — Whisper miss).
- No PII (name + location + neighbor identifiers) — reject + redact.
- No identifiable brand/competitor naming.
- Tone is "what I'm hoping for" not "what I expect it to do."

Approved memos appear in aggregation on `StrainExpectationsSection`
(when the feature flag is ON AND mock-mode is off).

## Auto-rejection example transcripts

Examples — NOT exhaustive. The regex sweep at `lib/voice-memo.ts` is
the authoritative source.

| Sample transcript | Category that trips | Verdict |
|---|---|---|
| "I'm hoping for a fun Friday night, I picked this because of the smell" | none | APPROVE |
| "I want to wind down after a long week, the lineage caught my eye" | none | APPROVE |
| "Last time I bought this I loved the citrus terps so I'm back" | none | APPROVE |
| "Helps with my back pain" | therapeutic verb + condition noun | AUTO-REJECT |
| "Treats my insomnia better than ambien" | therapeutic verb + condition noun + medical comparison | AUTO-REJECT |
| "Anti-anxiety strain for me" | pharmacological descriptor | AUTO-REJECT |
| "My doctor said indica is calmer for sleep" | medical context + predictable-effect | KAT-EYE (flag, not auto-reject) |
| "I'm hoping it knocks me out" | colloquial — no therapeutic-verb pair | KAT-EYE (subjective; she calls it) |

## Post-publish nightly re-scan

A cron (post-cutover) re-runs `flagModerationIssues` against every
`status='approved'` row's transcript on a nightly cadence. If a pattern
update introduces new auto-rejects retroactively, the row flips back
to `status='rejected'` and the memo stops appearing in aggregations.
24h takedown SLA per §9 risk register row 6 of the plan doc.

## Customer self-delete

Per §9 row 7 of the plan: the customer can self-delete any memo they
submitted from `/account/oral-history` at any time. Audit row records
the delete; the blob is purged from Vercel Blob; the DB row's
`status` flips to `rejected` and `moderation_flags` annotates
`self_deleted_at`. Aggregation stops including the memo on the next
re-render.

## Mock-data mode

Until the inv-App side ships verified-purchase wiring (post-cutover),
the recorder is gated to a SINGLE sample strain (`VOICE_MEMO_MOCK_STRAIN_SLUG`
in `lib/voice-memo.ts`) and nothing aggregates publicly. The
`StrainExpectationsSection` returns null when
`VOICE_MEMO_ENABLED !== "true"` OR `VOICE_MEMO_MOCK_MODE === "true"`.

## Why this surface is industry-first

No competitor in cannabis e-commerce (Leafly / Weedmaps / iHJ /
Dutchie storefronts) captures pre-experience EXPECTATIONS. All
existing review surfaces are post-experience effects. The combination
of (a) structured prompt that's WAC-safe by construction + (b)
automated transcription + (c) anonymous aggregation on retailer
strain pages is the patent claim element per §8 row 5 of the plan
doc — bundled into the single Perkins-Coie provisional with C1+C2+C7+C9.
