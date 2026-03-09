---
name: copilot-highlights-verification-loop
description: Verify oh-my-copilot plugin changes by running fixture tests, JSON validation, and local Copilot plugin install checks. Use after changing manifests, hooks, agents, or skills.
---

Use this skill after meaningful plugin changes.

Minimum loop:
1. Validate `plugin.json` and `hooks.json` as JSON.
2. Run the fixture verification scripts for the hook pipeline and Highlights cleanup utility.
3. Install or reinstall the plugin locally with `copilot plugin install ./`.
4. Run `copilot plugin list` and confirm the plugin name is present.
5. If installation fails, inspect the exact error before editing anything else.

Rules:
- do not claim success without command output
- if a command is version-sensitive, note that explicitly in the report
