# context-monkey

Make AI agent harness configurations portable — scan, diff, and sync context **and memory** between Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot, and more.

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

Detect and inventory all harness configs in a directory:

```bash
cm scan              # current directory
cm scan ~/src/myapp  # specific path
```

### `cm diff <source> <target>`

Compare two harness configurations:

```bash
cm diff claude-code codex
cm diff claude-code cursor --detailed
```

### `cm sync <source> <target>`

Port instructions and skills from one harness to another:

```bash
cm sync claude-code codex      # creates AGENTS.md from CLAUDE.md
cm sync claude-code cursor     # creates .cursor/rules/ from CLAUDE.md + skills
cm sync claude-code gemini     # creates GEMINI.md
cm sync claude-code copilot    # creates .github/copilot-instructions.md
```

### `cm memory <source> <target>`

The differentiator. Export memory from one harness to another with semantic translation:

```bash
cm memory claude-code codex      # critical context → AGENTS.md, full memory → .codex/MEMORY.md
cm memory claude-code gemini     # priority-tiered sections in GEMINI.md
cm memory claude-code cursor     # always-on .mdc rule with user context
cm memory claude-code codex --preview  # see translated output without writing
```

Memory is extracted into typed knowledge units (feedback, preferences, user profile, system info, project context) with priority levels (critical, important, contextual). Each target format gets an idiomatic translation — not a raw dump.

## Supported Harnesses

| Harness | ID | Scans | Writes | Memory |
|---------|-----|-------|--------|--------|
| Claude Code | `claude-code` | CLAUDE.md, skills, settings, memory, MCP | CLAUDE.md | Full structured memory (topic files + index) |
| Codex | `codex` | AGENTS.md (workspace + global) | AGENTS.md | Critical context in AGENTS.md, full memory in .codex/MEMORY.md |
| Gemini CLI | `gemini` | GEMINI.md (workspace + global), .geminiignore | GEMINI.md, .geminiignore | Priority-tiered sections + native Gemini Added Memories format |
| Cursor | `cursor` | .cursor/rules/, .cursorrules | .cursor/rules/*.mdc | Always-on user-context.mdc rule |
| GitHub Copilot | `copilot` | .github/copilot-instructions.md, .github/instructions/ | .github/copilot-instructions.md | Appended to instructions |

## What Syncs

- **Memory** — the core value. Typed knowledge units translated to target-native formats.
- **Instructions** — full portability. CLAUDE.md ↔ AGENTS.md ↔ GEMINI.md ↔ .cursor/rules/ ↔ copilot-instructions.md
- **Skills** — Claude Code skills convert to Cursor rules (instructions only; scripts noted as skipped)
- **Ignore patterns** — portable between .geminiignore, .aiderignore, .codeiumignore

## Prior Art

There are several tools that sync agent configs via symlinks or file copying (Saddle, vsync, source-agents, Skills Manager). Context Monkey focuses on the unsolved problem: **semantic memory translation**. Symlinks don't help when the formats are structurally different and the knowledge needs to be presented idiomatically for each target agent.

## License

MIT
