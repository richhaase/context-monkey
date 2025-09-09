# Context Monkey

**v0.5.0** - Non-invasive prompt engineering framework for Claude Code using project-aware specialized subagents.

## Quick Start

**Local Installation** (project-specific):
```bash
npx context-monkey install
```

**Global Installation** (available in all projects):
```bash
npx context-monkey install --global
```

## What is Context Monkey?

Context Monkey enhances Claude Code with **6 specialized subagents** that automatically understand your project:

- 🔍 **Code Reviewer** - Senior engineer-level code reviews with project context
- 📋 **Project Planner** - Risk-aware implementation planning using your tech stack  
- 🗂️ **Repository Analyst** - Architecture mapping with project-specific insights
- 🔍 **Stack Detective** - Complete technology profiling and optimization
- 🔬 **Deep Researcher** - Thorough technical investigations with citations
- 🛡️ **Security Auditor** - Comprehensive security analysis across code, infrastructure, and dependencies

Each subagent operates in its own context window with specialized prompts **and embedded knowledge of your project's technology stack and development rules**.

## Available Commands

Once installed, these enhanced slash commands delegate to specialized subagents:

### Analysis & Review
- `/monkey:review-code [range]` - Comprehensive code review with project context
- `/monkey:explain-repo [focus]` - Repository architecture analysis  
- `/monkey:deep-dive <topic>` - Thorough technical investigations
- `/monkey:stack-scan [action]` - Technology stack detection and documentation

### Workflows & Planning
- `/monkey:plan <goal>` - Implementation planning with risk assessment
- `/monkey:onboard-project [mode]` - Complete project onboarding workflow (stack → architecture → guidance)
- *Security workflows coming soon*

### Configuration
- `/monkey:add-rule` - Add project-specific development rules
- `/monkey:edit-rule` - Modify existing development rules  
- `/monkey:list-rules` - View all active project rules
- `/monkey:intro` - Overview and setup guide

## Key Features

### 🎯 **Project-Aware Intelligence**
Every subagent automatically loads your project context:
- **Technology Stack**: `@.monkey/stack.md` - Languages, frameworks, build tools
- **Development Rules**: `@.monkey/rules.md` - Coding standards, patterns, constraints

### 🏗️ **Advanced Architecture** 
- **Context Isolation**: Each subagent starts with fresh context windows
- **Parallel Execution**: Optimized for performance with batched tool operations
- **Plan Mode Support**: Safe repository exploration without modification risk
- **Comprehensive Error Handling**: Graceful degradation with clear limitations
- **Command Composition**: Multi-agent workflows for complete development tasks

### 🚀 **Bulletproof Upgrades**
- **Self-Healing System**: Automatically handles added/removed/renamed agents
- **Pattern-Based Cleanup**: No maintenance burden from hardcoded file lists
- **Clean Commands**: Simple `install`, `upgrade`, `uninstall` workflow

### 🔧 **Non-Invasive Design**
- Works alongside any existing Claude Code configuration
- Your existing settings and memory (CLAUDE.md) remain untouched  
- Optional project context files - works without them

## How It Works

1. **Install**: Context Monkey adds specialized commands and agents to Claude Code
2. **Context Loading**: Commands automatically reference your `.monkey/stack.md` and `.monkey/rules.md` 
3. **Subagent Delegation**: Each command invokes a specialized agent with project knowledge
4. **Isolated Execution**: Agents operate in fresh contexts with focused tool permissions

## Management Commands

### Update
```bash
npx context-monkey upgrade [--global]
```

### Remove  
```bash
npx context-monkey uninstall [--global]
```

### Local vs Global Installation

- **Local**: Installs to `.claude/` in current project - commands only available in that project
- **Global**: Installs to `~/.claude/` in home directory - commands available everywhere

## Project Context Setup

Context Monkey works immediately after installation, but becomes more powerful with project context:

### 1. Generate Technology Stack
```bash
/monkey:stack-scan
```
Creates `.monkey/stack.md` with your languages, frameworks, and build commands.

### 2. Define Development Rules
```bash
/monkey:add-rule
```
Captures coding standards, patterns, and project-specific constraints in `.monkey/rules.md`.

### 3. Complete Project Onboarding
```bash
/monkey:onboard-project
```
Get comprehensive project understanding: stack analysis → architecture → implementation guidance.

## Architecture Benefits

**📊 Structured Output**: Consistent, scannable formats (🔴 Critical, 🟡 Warnings, 🟢 Suggestions)

**🔧 Focused Tools**: Each subagent accesses only relevant tools for its domain

**⚡ Fresh Context**: Every invocation starts with up-to-date project context

**🛡️ Secure Analysis**: Comprehensive security coverage across multiple attack surfaces

## Requirements

- Node.js 16+
- Claude Code

## What's New in v0.5.0

- **Security Auditor**: New comprehensive security analysis agent
- **Bulletproof Upgrades**: Self-healing upgrade system with pattern-based cleanup
- **Enhanced Reliability**: Comprehensive error handling across all agents
- **Performance Optimizations**: Parallel tool execution for faster analysis

---

*Context Monkey is designed to make Claude Code more effective by providing consistent project context across all development tasks. Install once, benefit from specialized expertise in every session.*