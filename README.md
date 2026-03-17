# oh-my-copilot

[![Verify](https://img.shields.io/github/actions/workflow/status/Leuconoe/oh-my-copilot/verify.yml?branch=main&label=verify)](https://github.com/Leuconoe/oh-my-copilot/actions/workflows/verify.yml)
[![License](https://img.shields.io/github/license/Leuconoe/oh-my-copilot)](LICENSE)
[![Last Commit](https://img.shields.io/github/last-commit/Leuconoe/oh-my-copilot)](https://github.com/Leuconoe/oh-my-copilot/commits/main)

- Korean: [README.ko.md](README.ko.md)

- Quick links: [Quick Start](#quick-start), [Comparison](#comparison-with-reference-repositories), [Simple Copilot Test Cycle](#simple-copilot-test-cycle), [Verification](#verification)

`oh-my-copilot` is a GitHub Copilot CLI plugin that captures session Highlights, ships focused custom agents and skills, and records structured hook artifacts under `.copilot-highlights/`.

## Quick Start

```bash
copilot plugin install Leuconoe/oh-my-copilot
copilot plugin list
copilot -p "/skills list" --allow-all-tools
node tests/verify-hook-fixtures.cjs
node tests/verify-smoke-test-models-script.cjs
```

## What it does

- Installs as a real Copilot CLI plugin.
- Adds focused agents for planning, exploration, research, review, and implementation.
- Adds skills for recap, deep initialization, implementation planning, and verification.
- Uses documented Copilot CLI hooks to record prompt, tool, error, and session-summary artifacts.
- Generates per-session summaries in `.copilot-highlights/sessions/<session-id>/highlights.md`.

## Plugin layout

```text
.
|- plugin.json
|- hooks.json
|- agents/
|- skills/
|- scripts/
|- tests/
|- .agents/
`- .reference/
```

## Runtime artifacts

The hook pipeline writes local runtime data to `.copilot-highlights/` at the git root when the current working directory is inside a repository.

Each session directory contains:

- `session.json`
- `prompts.jsonl`
- `tools.jsonl`
- `errors.jsonl`
- `highlights.md`

These files are designed for recap and verification workflows, not for committing to source control.

## Install

Install directly from the repository URL:

```bash
copilot plugin install Leuconoe/oh-my-copilot
```

Then verify:

```bash
copilot plugin list
copilot -p "/skills list" --allow-all-tools
```

For local development on Copilot CLI `1.0.x`, you can load the plugin without reinstalling:

```bash
copilot --plugin-dir . -p "/skills list" --allow-all-tools
```

## Verification

Validate local changes with:

```bash
node tests/verify-hook-fixtures.cjs
node tests/verify-flush-highlights.cjs
node tests/verify-smoke-test-models-script.cjs
```

Useful additional checks:

```bash
node --check "scripts/lib/highlights-runtime.cjs"
node --check "scripts/flush-highlights.cjs"
node --check "scripts/smoke-test-models.cjs"
node --check "tests/verify-hook-fixtures.cjs"
node --check "tests/verify-flush-highlights.cjs"
node --check "tests/verify-smoke-test-models-script.cjs"
```

For live smoke tests, run a non-interactive Copilot prompt and inspect the newest `.copilot-highlights/sessions/` directory.

## Comparison With Reference Repositories

This project borrows ideas from `oh-my-opencode` and `oh-my-codex`, but it is intentionally narrower because it runs inside GitHub Copilot CLI's documented plugin model.

### Similar capabilities

- Focused agent roles for planning, exploration, research, review, and implementation.
- Workflow-oriented skills for planning, initialization, recap, and verification.
- Session artifact capture aimed at generating readable Highlights after work completes.
- Verification-heavy guidance that prefers install and runtime proof over documentation-only claims.

### Not in oh-my-copilot

- Full multi-agent orchestration runtimes such as `ultrawork`, Ralph-style persistence loops, or Codex team mode are not present because Copilot CLI plugins do not expose that kind of outer control plane.
- Tmux-based worker orchestration and interactive pane management are not present because Copilot CLI plugins cannot manage terminal multiplexer sessions.
- Hash-anchored custom edit primitives are not present because Copilot CLI plugins cannot replace the built-in edit tool.
- Native todo enforcement and background worker managers are not present because Copilot CLI plugin extension points do not expose those runtime controls.
- Rich MCP/runtime stacks like the built-in remote MCP bundles in `oh-my-opencode` or the `.omx/` state system in `oh-my-codex` are not bundled yet; this project currently stays focused on the smaller verified Highlights slice.

### Currently unique in oh-my-copilot

- A Copilot-native plugin package built around `plugin.json`, `hooks.json`, plugin agents, and plugin skills.
- A verified Highlights artifact contract under `.copilot-highlights/` with `session.json`, JSONL event files, and generated `highlights.md` summaries.
- Hook-verified denial handling through Copilot CLI `preToolUse`, including real `denied` event capture in session artifacts.
- Prefixed `copilot-highlights-*` agents and skills designed to avoid collisions with project-level or user-level customizations.
- A dedicated flush workflow for resetting local Highlights artifacts with `node scripts/flush-highlights.cjs --dry-run` and `node scripts/flush-highlights.cjs --yes`.
- A sequential smoke-test utility for current free models with `node scripts/smoke-test-models.cjs`.

## Simple Copilot Test Cycle

Use this short loop when testing from Copilot CLI:

1. Reinstall the plugin after any file change.
2. Confirm the plugin and skills are visible.
3. Run one success flow.
4. Run one denied-command flow.
5. Inspect the newest `.copilot-highlights/sessions/` directory.

Recommended commands:

```bash
copilot plugin install Leuconoe/oh-my-copilot
copilot plugin list
node scripts/smoke-test-models.cjs --mode plugin-dir --model gpt-4.1 --model gpt-5-mini
```

Expected results:

- `copilot plugin list` shows `oh-my-copilot`.
- `/skills list` shows the `copilot-highlights-*` skills.
- The smoke-test script validates both a successful `node --version` flow and a denied `sudo echo hi` flow for each selected model.
- `.copilot-highlights/active-sessions.json` returns to `{}` after the run.

If you are developing locally and need to test unpushed changes, prefer `copilot --plugin-dir .` for quick checks and reinstall from the repository root with `copilot plugin install ./` when you need to validate installed-plugin behavior.

Important limitation:

- Do not run multiple non-interactive Copilot smoke tests in parallel from the same `cwd`. Current documented hook payloads do not expose a stable session ID, so same-directory parallel runs can mix Highlights artifacts.

Optional cleanup:

```bash
node scripts/flush-highlights.cjs --dry-run
node scripts/flush-highlights.cjs --yes
```

## Notes

- This project is built against documented GitHub Copilot CLI extension points.
- The `.reference/` directory is for internal comparison and implementation research.
- Public-facing docs should describe this plugin on its own terms rather than positioning it as another product's extension or replacement.
