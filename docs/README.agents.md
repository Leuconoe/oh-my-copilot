# Agents

Focused custom agents for `oh-my-copilot`.

These agents are designed for GitHub Copilot CLI plugin workflows around Highlights capture, planning, research, review, and implementation.

| Agent | Description | Runtime Model |
| --- | --- | --- |
| `copilot-highlights-planner` | Plan plugin work, scope increments, and map requests to documented Copilot CLI extension points. | Inherits the user's selected/default model |
| `copilot-highlights-explorer` | Explore repository structure, fixtures, manifests, and reference material. | Inherits the user's selected/default model |
| `copilot-highlights-librarian` | Ground decisions in official Copilot CLI docs and reference behavior. | Inherits the user's selected/default model |
| `copilot-highlights-reviewer` | Review changes for safety, correctness, and honest platform claims. | Inherits the user's selected/default model |
| `copilot-highlights-builder` | Implement plugin changes in hooks, scripts, skills, tests, and manifests. | Inherits the user's selected/default model |

Notes:

- Agent IDs are prefixed to reduce collisions with user-level or project-level custom agents.
- These agents stay inside documented Copilot CLI plugin capabilities.
- Agent files intentionally omit a fixed `model` so Copilot can use the user's selected or default runtime model.
