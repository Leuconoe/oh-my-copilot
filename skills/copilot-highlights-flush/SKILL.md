---
name: copilot-highlights-flush
description: 'Safely reset local `.copilot-highlights` artifacts after testing or before sharing a workspace. Use when asked to flush, clean, or reset captured Highlights state.'
---

Use this skill when local Highlights artifacts need cleanup.

Recommended flow:
1. Preview the target with `node scripts/flush-highlights.cjs --dry-run`.
2. If deletion is intended, run `node scripts/flush-highlights.cjs --yes`.
3. Confirm whether `.copilot-highlights/` was removed or report that nothing existed.

Rules:
- default to preview first unless the user explicitly asked for immediate deletion
- treat `.copilot-highlights/` as runtime state, not source files
- do not delete anything outside the resolved `.copilot-highlights/` directory
