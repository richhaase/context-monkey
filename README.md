# context-monkey

Make AI agent harness configurations portable — scan and apply context **and memory** between Claude Code, Codex, Gemini CLI, Cursor, and more.

> **v1.0** is a ground-up rewrite. The old context-monkey (≤ v0.10.x) was a subagent installer for Claude Code. This version is a harness portability tool focused on the hard problem: **semantic memory translation**.

## Why

You've spent weeks teaching Claude Code who you are — your preferences, your feedback corrections, your system architecture, your working style. Then a new version of Gemini drops and you want to give it a fair shot. But Gemini knows nothing about you. Every comparison is apples to oranges because one agent has months of accumulated context and the other starts from zero.

Context Monkey extracts structured knowledge from one harness and translates it into native formats for another. Not file copying — semantic translation that understands what memory means and presents it correctly for each target.

## Install

Requires [Bun](https://bun.sh).

```bash
bunx context-monkey
# or
bunx cm
```

## Commands

### `cm scan [path]`

Detect and inventory harness configs for a workspace plus your global harness state:

```bash
cm scan              # current directory
cm scan ~/src/myapp  # specific path
cm scan ~/notes --harnesses claude-code,codex,gemini
```

### `cm apply <target>`

Write the canonical store into one or more target harness layouts:

```bash
cm apply codex --path ~/notes    # write repo-local Codex files
cm apply gemini --path ~/notes   # write repo-local Gemini files
cm apply all -y                  # write to detected global harness homes
```

## Supported Harnesses

| Harness | ID | Scans | Writes | Memory |
|---------|-----|-------|--------|--------|
| Claude Code | `claude-code` | Global + workspace CLAUDE.md, `.claude/`, `.mcp.json`, local plugins | CLAUDE.md, `.claude/` | Full structured memory (topic files + index) |
| Codex | `codex` | Global + workspace AGENTS.md, `.codex/`, `.agents/skills/` | AGENTS.md, `.codex/agents/` | Critical context in AGENTS.md, full memory in `.codex/MEMORY.md` |
| Gemini CLI | `gemini` | Global + workspace GEMINI.md, `.gemini/`, `.agents/skills/` | GEMINI.md, `.gemini/` | Priority-tiered sections + native Gemini Added Memories format |
| Cursor | `cursor` | Global + workspace `.cursor/rules/` | `.cursor/rules/*.mdc` | Always-on `user-context.mdc` rule |

## What Syncs

- **Memory** — the core value. Typed knowledge units translated to target-native formats.
- **Instructions** — CLAUDE.md ↔ AGENTS.md ↔ GEMINI.md ↔ `.cursor/rules/`
- **Skills** — native skill directories plus the cross-tool `.agents/skills/` layout
- **Commands** — project and user command directories where the target harness supports them
- **Agents** — Codex `.codex/agents/` and Claude fork-style skills
- **Ignore patterns** — Gemini `.geminiignore` today, with room to extend to other ignore formats

## Prior Art

There are several tools that sync agent configs via symlinks or file copying (Saddle, vsync, source-agents, Skills Manager). Context Monkey focuses on the unsolved problem: **semantic memory translation**. Symlinks don't help when the formats are structurally different and the knowledge needs to be presented idiomatically for each target agent.

## License

MIT
