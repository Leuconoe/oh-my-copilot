---
name: copilot-highlights-verification-loop
description: 'Verify oh-my-copilot plugin changes by running fixture tests, JSON validation, and local Copilot plugin install checks. Use after changing manifests, hooks, agents, or skills.'
---

Use this skill after meaningful plugin changes.

Minimum loop:
1. Validate `plugin.json` and `hooks.json` as JSON.
2. Run the fixture verification scripts for the hook pipeline and Highlights cleanup utility.
3. For local development on current Copilot CLI builds, prefer `copilot --plugin-dir .` for rapid checks before reinstalling.
4. For installed-plugin verification, use `copilot plugin install ./` or `copilot plugin install owner/repo`, then run `copilot plugin list`.
5. Run the smoke-test script sequentially with free models:
   - `node scripts/smoke-test-models.cjs --mode plugin-dir --model gpt-4.1 --model gpt-5-mini`
6. If installation or smoke testing fails, inspect the exact command output before editing anything else.

Rules:
- do not claim success without command output
- if a command is version-sensitive, note that explicitly in the report
- do not run parallel non-interactive smoke tests from the same `cwd`; documented hook payloads do not expose a stable session ID
