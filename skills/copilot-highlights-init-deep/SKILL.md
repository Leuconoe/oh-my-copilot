---
name: copilot-highlights-init-deep
description: 'Initialize a project for this plugin''s workflow by creating instruction surfaces, hook-safe runtime directories, and starter conventions for Highlights-oriented development.'
---

Use this skill when asked to bootstrap a project for `oh-my-copilot` usage.

Workflow:
1. Create or refresh project instruction files such as `.agents/AGENTS.md` when requested.
2. Ensure the repository contains plugin-relevant directories like `agents/`, `skills/`, `scripts/`, and `tests/fixtures/` when building a plugin.
3. Add `.copilot-highlights/` to `.gitignore` if session artifacts are stored locally.
4. Explain the minimum verification loop: validate JSON, run fixture tests, reinstall plugin, verify plugin discovery.

Rules:
- do not invent unsupported Copilot features during bootstrap
- keep generated structure minimal and easy to verify
