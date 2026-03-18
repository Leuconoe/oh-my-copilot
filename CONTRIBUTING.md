# Contributing to oh-my-copilot

Thanks for contributing to `oh-my-copilot`.

This repository is a GitHub Copilot CLI plugin focused on Highlights-oriented workflows, so contributions should improve plugin quality, verification, or documented usability without claiming unsupported Copilot CLI behavior.

## What we accept

- Improvements to plugin manifests, agents, skills, hooks, scripts, tests, and docs
- Better verification loops and safer runtime behavior
- Clearer documentation for installation, local development, and smoke testing
- Additions that stay inside documented GitHub Copilot CLI plugin capabilities

## What we do not accept

- Features that rely on undocumented Copilot CLI plugin behavior
- Claims of parity with orchestration-heavy systems when the platform cannot support them
- Unsafe hook behavior, secret leakage, or destructive defaults
- Same-`cwd` parallel session handling claims that are not backed by documented hook payload fields

## Resource conventions

### Agents

- Files live in `agents/` and end with `.agent.md`
- File names use lowercase with hyphens
- Front matter must include:
  - `name`
  - `description`
- `description` values should be wrapped in single quotes
- Omit `model` unless a contribution truly requires pinning a specific model; otherwise the agent should inherit the user's selected/default model.

### Skills

- Each skill lives in its own folder under `skills/`
- Each folder must contain `SKILL.md`
- The `name` field must match the folder name
- `description` values should be wrapped in single quotes
- Bundled assets must be referenced in `SKILL.md`

### Hooks

- Hook configuration lives in `hooks.json`
- Hook logic should stay deterministic and cross-platform
- Hook changes must be covered by fixture verification

## Verification before submitting changes

Run these commands before opening a PR:

```bash
node tests/verify-hook-fixtures.cjs
node tests/verify-flush-highlights.cjs
node tests/verify-resource-metadata.cjs
node tests/verify-smoke-test-models-script.cjs
node scripts/smoke-test-models.cjs --mode plugin-dir --model gpt-4.1 --model gpt-5-mini
```

If your change affects installed-plugin behavior, also run:

```bash
node scripts/smoke-test-models.cjs --mode install --install-source Leuconoe/oh-my-copilot --model gpt-4.1 --model gpt-5-mini
```

## Documentation

If you add or substantially change an agent, skill, hook, or plugin behavior, update the corresponding docs when needed:

- `README.md`
- `README.ko.md`
- `docs/README.agents.md`
- `docs/README.skills.md`
- `docs/README.hooks.md`
- `docs/README.plugins.md`

## Submission note

If preparing this plugin for inclusion in curated collections such as `awesome-copilot`, prefer quality and verification improvements over feature sprawl.
