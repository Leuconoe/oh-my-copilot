---
name: copilot-highlights-recap
description: Summarize the latest `.copilot-highlights` session artifacts into concise human-readable Highlights. Use when asked for a recap, session summary, or highlights report.
---

Use this skill when the task is to summarize recent plugin-captured session activity.

Workflow:
1. Locate the latest session under `.copilot-highlights/sessions/`.
2. Read `session.json`, `prompts.jsonl`, `tools.jsonl`, `errors.jsonl`, and `highlights.md` if present.
3. Prefer the existing `highlights.md` summary if it is current.
4. If the summary is missing or stale, reconstruct one from the JSONL artifacts.
5. Report:
   - the latest user goal
   - notable tool outcomes
   - failures or denied actions
   - the clearest next step

Rules:
- prefer metadata and redacted previews over raw prompts or full command output
- if no session artifacts exist, say so plainly and suggest running a captured session first
