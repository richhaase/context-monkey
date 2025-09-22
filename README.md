# Context Monkey

Context Monkey installs a project-aware command suite for Claude Code, Codex CLI, and Gemini CLI so you can drive audits, planning, and documentation straight from your editor.

## Quick Start

```bash
bunx context-monkey install
```

Run the installer again at any time to pick up updates or target newly detected CLIs.

## Key Commands

- `/cm:stack-scan` – profile the active repository and capture technology and tooling notes
- `/cm:explain-repo` – describe architecture, hot paths, and risk areas for fast onboarding
- `/cm:onboard-project [quick|standard|deep]` – chain stack analysis, architecture, and planning into a guided tour
- `/cm:plan` – produce implementation plans with task breakdowns and open questions
- `/cm:review-code` – review diffs with project conventions, tests, and follow-up suggestions
- `/cm:deep-dive` – investigate a subsystem, dependency, or incident with targeted research
- `/cm:docs` – regenerate README, architecture notes, setup guides, changelog, and contributing instructions

## Installation & Updates

- `context-monkey install` – interactive wizard that detects Claude Code, Codex CLI, and Gemini CLI and lets you install to any combination
- `context-monkey uninstall` – remove Context Monkey assets from selected CLIs while leaving other content untouched
- Hooks: users of Claude Code on macOS users can opt into terminal notifications via `terminal-notifier`

The installer copies command templates, agent blueprints, and optional notification hooks into per-agent folders:

- `~/.claude/commands/cm/` and `~/.claude/agents/`
- `~/.codex/prompts/cm-*` with a summary block in `~/.codex/AGENTS.md`
- `~/.gemini/commands/cm/` plus the `~/.gemini/extensions/cm/` metadata bundle

## Project Context Files

Context Monkey can use and maintains two shared knowledge files at your project root:

- `@.cm/stack.md` – technology stack, tooling, and operational notes
- `@.cm/rules.md` – coding standards, patterns, and architectural decisions

Commands automatically reference these files so the assistant answers with the correct vocabulary, workflows, and guardrails.

## Developing Context Monkey

- Build TypeScript sources: `bun run build`
- Watch for changes: `bun run dev`
- Run unit tests: `bun test`
- Refresh prompt snapshots: `npm run snapshots:generate`

See `SETUP.md` for environment setup and `CONTRIBUTING.md` for pull request guidelines.

## License

Apache-2.0
