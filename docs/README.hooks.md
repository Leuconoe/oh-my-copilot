# Hooks

Documented GitHub Copilot CLI hooks used by `oh-my-copilot`.

| Hook Event | Script | Purpose |
| --- | --- | --- |
| `sessionStart` | `scripts/session-start.cjs` | Create a session record and bootstrap session artifacts. |
| `userPromptSubmitted` | `scripts/prompt-log.cjs` | Capture prompt metadata as redacted previews. |
| `preToolUse` | `scripts/pre-tool-guard.cjs` | Deny clearly risky tool commands before execution. |
| `postToolUse` | `scripts/post-tool-capture.cjs` | Record tool outcome summaries, including denied actions. |
| `errorOccurred` | `scripts/error-occurred.cjs` | Persist structured error metadata. |
| `sessionEnd` | `scripts/session-end.cjs` | Finalize the session and generate `highlights.md`. |

Important limitation:

- Documented hook payloads do not provide a stable session identifier.
- Because of that, same-`cwd` parallel non-interactive runs are not a safe Highlights capture scenario.
