# context-monkey

Make AI agent harness configurations portable — scan, diff, and sync context between Claude Code, Codex, Gemini CLI, Cursor, GitHub Copilot, and more.

## What It Does

Different AI coding agents use different files for the same thing: Claude Code reads `CLAUDE.md`, Codex reads `AGENTS.md`, Gemini reads `GEMINI.md`, Cursor uses `.cursor/rules/`, Copilot uses `.github/copilot-instructions.md`. If you've set up one, the others get nothing.

Context Monkey scans what's configured, shows you the differences, and syncs configs between harnesses. It doesn't install anything or manage your agents — it just makes their context portable.

## Install

Requires [Bun](https://bun.sh).

```bash
bunx context-monkey
# or
bunx cm
```

## Usage

### Scan

See what harnesses are configured in a directory:

```bash
cm scan              # current directory
cm scan ~/src/myapp  # specific path
```

### Diff

Compare two harness configurations:

```bash
cm diff claude-code codex
cm diff claude-code cursor --detailed
```

### Sync

Port configuration from one harness to another:

```bash
cm sync claude-code codex      # creates AGENTS.md from CLAUDE.md
cm sync claude-code cursor     # creates .cursor/rules/ from CLAUDE.md + skills
cm sync claude-code gemini     # creates GEMINI.md
cm sync claude-code copilot    # creates .github/copilot-instructions.md
cm sync claude-code codex -y   # skip confirmation
```

## Supported Harnesses

| Harness | ID | Scans | Writes |
|---------|-----|-------|--------|
| Claude Code | `claude-code` | CLAUDE.md, skills, settings, memory, MCP | CLAUDE.md |
| Codex | `codex` | AGENTS.md (workspace + global) | AGENTS.md |
| Gemini CLI | `gemini` | GEMINI.md (workspace + global), .geminiignore | GEMINI.md, .geminiignore |
| Cursor | `cursor` | .cursor/rules/, .cursorrules | .cursor/rules/*.mdc |
| GitHub Copilot | `copilot` | .github/copilot-instructions.md, .github/instructions/ | .github/copilot-instructions.md |

## What Syncs

- **Instructions** — full portability. CLAUDE.md ↔ AGENTS.md ↔ GEMINI.md ↔ .cursor/rules/ ↔ copilot-instructions.md
- **Skills** — Claude Code skills convert to Cursor rules (instructions only; scripts are noted as skipped)
- **Ignore patterns** — portable between .geminiignore, .aiderignore, .codeiumignore
- **Settings, Memory, MCP** — not yet (format-specific, planned for v2)

## License

MIT
