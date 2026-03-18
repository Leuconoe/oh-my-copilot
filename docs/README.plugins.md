# Plugins

`oh-my-copilot` is a GitHub Copilot CLI plugin focused on Highlights-oriented development workflows.

## Install

```bash
copilot plugin install Leuconoe/oh-my-copilot
```

## What's Included

### Agents

- `copilot-highlights-planner`
- `copilot-highlights-explorer`
- `copilot-highlights-librarian`
- `copilot-highlights-reviewer`
- `copilot-highlights-builder`

### Skills

- `copilot-highlights-flush`
- `copilot-highlights-recap`
- `copilot-highlights-init-deep`
- `copilot-highlights-implementation-plan`
- `copilot-highlights-verification-loop`

### Hooks

- Session lifecycle capture and Highlights summarization through `hooks.json`

## Verification

```bash
node tests/verify-hook-fixtures.cjs
node tests/verify-flush-highlights.cjs
node tests/verify-smoke-test-models-script.cjs
node scripts/smoke-test-models.cjs --mode plugin-dir --model gpt-4.1 --model gpt-5-mini
```

## Submission posture

- The plugin is designed to stay inside documented Copilot CLI plugin capabilities.
- It is intentionally smaller than orchestration-heavy reference ecosystems.
- It explicitly documents unsupported or platform-limited behavior instead of claiming parity.
