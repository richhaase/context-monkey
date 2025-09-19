# Context Monkey

Prompt engineering framework for Claude Code using specialized subagents

## Quick Start

```bash
bunx context-monkey install
```

Then in Claude Code:
```
/cm:intro
```

## Key Commands

- **`/cm:stack-scan`** - Auto-detect and document your technology stack
- **`/cm:explain-repo`** - Generate comprehensive repository documentation  
- **`/cm:plan`** - Create detailed implementation plans for features
- **`/cm:review-code`** - Review code changes with project awareness
- **`/cm:deep-dive`** - Perform detailed code analysis with context

## Installation

### Global Installation (Recommended)
```bash
bunx context-monkey install
```
Installs to `~/.claude/` for all projects

### Local Installation
```bash
bunx context-monkey install --local
```
Installs to `./.claude/` for current project only

### Other Agents (Codex CLI / Gemini CLI)
```bash
# Install prompts for Codex CLI
bunx context-monkey install --target codex

# Install commands for Gemini CLI
bunx context-monkey install --target gemini

# Install everywhere
bunx context-monkey install --all-targets
```
Use `--target` multiple times to select specific combinations (e.g. `--target claude --target gemini`).
Codex prompts are registered as slash commands like `/cm-intro`; Gemini commands live under the `context-monkey:` namespace.

### Uninstall
```bash
bunx context-monkey uninstall
```
Add `--target codex` or `--target gemini` (repeatable) to remove resources from other agents.

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
- Claude Code CLI
- Bun (recommended) or npm

## Features

- **Zero Configuration** - Works immediately after installation
- **Project Awareness** - All commands understand your stack and conventions
- **Contextual Intelligence** - Maintains project knowledge across sessions
- **Extensible Rules** - Add custom coding standards and patterns
- **Notification Hooks** - Optional desktop notifications for long-running tasks

## License

Apache-2.0
