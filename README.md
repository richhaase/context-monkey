# Context Monkey

Prompt engineering framework for Claude Code using specialized subagents

## Quick Start

Bun users can install and run directly from npm:

```bash
bunx context-monkey install
```

## Key Commands

- **`/cm:stack-scan`** - Auto-detect and document your technology stack
- **`/cm:explain-repo`** - Generate comprehensive repository documentation  
- **`/cm:plan`** - Create detailed implementation plans for features
- **`/cm:review-code`** - Review code changes with project awareness
- **`/cm:deep-dive`** - Perform detailed code analysis with context

## Installation

### Interactive Installation

```bash
context-monkey install
```

The installer detects Claude Code, Codex CLI, and Gemini CLI automatically, then walks you through selecting which agents to configure. If multiple CLIs are available you can install to all of them in a single run. Notification hooks (macOS) remain optional and are confirmed interactively.

### Uninstall

```bash
context-monkey uninstall
```

Select the agents to clean up, and the CLI removes only Context Monkey assets (commands, agents, notification hooks) for those environments.

## Project Context

Context Monkey enhances Claude Code through project awareness:

- **`@.cm/stack.md`** - Auto-generated technology stack overview
- **`@.cm/rules.md`** - Project-specific coding standards and patterns

All commands automatically reference these files to provide consistent, contextual assistance.

## Available Subagents

Context Monkey includes 8 specialized AI agents that integrate seamlessly with Claude Code:

- **cm-researcher** - Deep technical investigation and analysis
- **cm-planner** - Implementation planning with project context
- **cm-reviewer** - Code review with awareness of project patterns
- **cm-repo-explainer** - Repository documentation and explanation
- **cm-stack-profiler** - Technology stack detection and profiling
- **cm-doc-generator** - Automated documentation generation
- **cm-security-auditor** - Security assessment and vulnerability analysis
- **cm-dependency-manager** - Dependency analysis and management

## Requirements

- Node.js 16.0.0 or higher
- Bun (recommended) or npm
- Optional CLIs:
  - Claude Code CLI (macOS)
  - Codex CLI
  - Gemini CLI (0.5.5+ recommended)

## Features

- **Zero Configuration** – Works immediately after installation
- **Project Awareness** – All commands understand your stack and conventions
- **Contextual Intelligence** – Maintains project knowledge across sessions
- **Extensible Rules** – Add custom coding standards and patterns
- **Notification Hooks** – Optional macOS desktop notifications via `terminal-notifier`
- **Multi-Agent Support** – Shared templates render consistently for Claude Code, Codex CLI, and Gemini CLI

## Development & Testing

- Build: `bun run build`
- Render snapshots: `npm run snapshots:generate`
- Test suite: `bun test`

Documentation for working on templates lives in [`docs/TEMPLATE_AUTHORING.md`](./docs/TEMPLATE_AUTHORING.md); development setup instructions are in [`SETUP.md`](./SETUP.md).

## License

Apache-2.0
