---
name: copilot-highlights-implementation-plan
description: 'Turn a Highlights feature request into a PDCA-style implementation plan for the oh-my-copilot plugin. Use when scoping new plugin work before coding.'
---

Use this skill to plan plugin work in a grounded way.

Always include:
- the target reference behavior from `.reference/`
- the documented Copilot CLI extension point that enables or limits the feature
- whether the result is native, emulated, partial, or unsupported
- the smallest installable increment
- verification commands and fixture expectations

Prefer file-specific plans over broad architecture essays.
