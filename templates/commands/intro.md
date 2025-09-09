---
description: Welcome to Context Monkey - project-aware Claude Code extensions
allowed-tools: Read
---

# Context Monkey

*Installed version info available via `npx context-monkey --version`*

Welcome! Context Monkey provides curated Claude Code commands and agents that understand your project structure and development patterns.

## Available Commands

### 📊 Analysis Commands
- `/monkey:stack-scan` - Auto-detect and document your technology stack
- `/monkey:explain-repo` - Generate comprehensive repository documentation
- `/monkey:deep-dive` - Perform detailed code analysis with context
- `/monkey:review-code` - Review code changes with project awareness

### 📋 Planning Commands  
- `/monkey:plan` - Create detailed implementation plans for features

### ⚙️ Configuration Commands
- `/monkey:add-rule` - Add new project-specific development rules
- `/monkey:edit-rule` - Modify existing development rules  
- `/monkey:list-rules` - View all active project rules

## Project Context Status

Context Monkey enhances Claude Code with project awareness through these configuration files:

- **Stack Documentation**: `@.monkey/stack.md` - Auto-generated technology stack overview
- **Development Rules**: `@.monkey/rules.md` - Project-specific coding standards and patterns

Let me check your current project context setup:

@.monkey/stack.md
@.monkey/rules.md

## Getting Started

### First Time Setup
1. **Scan your stack**: Run `/monkey:stack-scan` to document your technology choices
2. **Set project rules**: Use `/monkey:add-rule` to capture coding standards
3. **Explore your code**: Try `/monkey:explain-repo` for a comprehensive overview

### Daily Workflow
- Use `/monkey:plan` before implementing new features
- Run `/monkey:review-code` before committing changes
- Reference `/monkey:deep-dive` for understanding complex code sections

## Key Features

✨ **Project Awareness**: All commands understand your stack and rules through `@.monkey/` references
🚀 **Zero Configuration**: Commands work immediately after installation  
📚 **Context Preservation**: Maintains consistent project knowledge across sessions
🔧 **Extensible**: Easy to add new rules and patterns specific to your project

---

*Context Monkey is designed to make Claude Code more effective by providing consistent project context. All commands automatically reference your project's stack documentation and development rules.*