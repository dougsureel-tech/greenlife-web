<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:agent-coordination -->
# Cross-session coordination

Multiple Claude sessions work on Doug's projects in parallel. Before starting non-trivial work, read these (in order):

1. `~/Documents/CODE/AGENT_BOARD.md` — who's currently editing what. Append yourself before starting; move to Recent when done.
2. `~/Documents/CODE/INCIDENTS.md` — closed post-mortems. Grep first when diagnosing — most weird symptoms have already been chased once.
3. Any topic-specific log next to INCIDENTS.md (e.g. `MENU_LOG.md` for `/menu` + iHeartJane work). These capture in-progress investigations that are too active for a post-mortem.

If your work touches `/menu` or any iHeartJane code, **`MENU_LOG.md` is required reading** — it lists ruled-out theories and the recovery recipe. Skipping it has cost three sessions in a row already.
<!-- END:agent-coordination -->
