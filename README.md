# Context Monkey

Prompt engineering framework for Claude Code using specialized subagents.

## Install

```bash
npx context-monkey install
```

## Update

```bash
npx context-monkey upgrade
```

## Uninstall

```bash
npx context-monkey uninstall
```

## What's New in v0.1.0

Context Monkey now uses **specialized subagents** for dramatically improved output quality:

- 🔍 **Code Reviewer** - Senior engineer-level code reviews
- 📋 **Project Planner** - Risk-aware implementation planning  
- 🗂️ **Repository Analyst** - Architecture mapping and insights
- 🔍 **Stack Detective** - Complete technology profiling
- 🔬 **Deep Researcher** - Thorough technical investigations

Each subagent operates in its own context window with specialized prompts, delivering focused expertise instead of generic responses.

## Claude Code Commands

Once installed, these enhanced slash commands delegate to specialized subagents:

- `/review-code [range]` → **Code Reviewer** subagent
- `/plan <goal>` → **Project Planner** subagent
- `/explain-repo [focus]` → **Repository Analyst** subagent  
- `/stack-scan [action]` → **Stack Detective** subagent
- `/deep-dive <topic>` → **Deep Researcher** subagent
- `/add-rule` - Add project rules
- `/edit-rule` - Edit existing rules

## Architecture Benefits

**Specialized Intelligence**: Each command uses an expert subagent instead of general-purpose responses

**Context Isolation**: Subagents start with clean context windows, preventing "context soup"

**Structured Output**: Consistent, scannable formats (🔴 Critical, 🟡 Warnings, 🟢 Suggestions)

**Focused Tools**: Each subagent only accesses relevant tools for its domain

## Performance

- **Latency**: Subagent invocation adds ~1-2 seconds per command
- **Quality**: The latency trade-off delivers significantly better, more focused outputs
- **Context**: Clean subagent contexts prevent degradation from context overflow

See [docs/subagents.md](docs/subagents.md) for detailed subagent documentation.

## Requirements

- Node.js 16+
- Claude Code