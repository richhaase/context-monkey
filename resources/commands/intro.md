---
description: Welcome to Context Monkey - project-aware Claude Code extensions
allowed-tools: Read
---

# Context Monkey

*Installed version info available via `npx context-monkey --version`*

Welcome! Context Monkey provides curated Claude Code commands and agents that understand your project structure and development patterns.

## Available Commands

### 📊 Analysis Commands
- `/cm:stack-scan` - Auto-detect and document your technology stack
- `/cm:explain-repo` - Generate comprehensive repository documentation
- `/cm:deep-dive` - Perform detailed code analysis with context
- `/cm:review-code` - Review code changes with project awareness

### 📋 Planning Commands  
- `/cm:plan` - Create detailed implementation plans for features

### ⚙️ Configuration Commands
- `/cm:add-rule` - Add new project-specific development rules
- `/cm:edit-rule` - Modify existing development rules  
- `/cm:list-rules` - View all active project rules

## Project Context Status

Context Monkey enhances Claude Code with project awareness through these configuration files:

- **Stack Documentation**: `@.cm/stack.md` - Auto-generated technology stack overview
- **Development Rules**: `@.cm/rules.md` - Project-specific coding standards and patterns

Let me check your current project context setup:

@.cm/stack.md
@.cm/rules.md

## Getting Started

### First Time Setup
1. **Scan your stack**: Run `/cm:stack-scan` to document your technology choices
2. **Set project rules**: Use `/cm:add-rule` to capture coding standards
3. **Explore your code**: Try `/cm:explain-repo` for a comprehensive overview

### Daily Workflow
- Use `/cm:plan` before implementing new features
- Run `/cm:review-code` before committing changes
- Reference `/cm:deep-dive` for understanding complex code sections

## Key Features

✨ **Project Awareness**: All commands understand your stack and rules through `@.cm/` references
🚀 **Zero Configuration**: Commands work immediately after installation  
📚 **Context Preservation**: Maintains consistent project knowledge across sessions
🔧 **Extensible**: Easy to add new rules and patterns specific to your project

---

*Context Monkey is designed to make Claude Code more effective by providing consistent project context. All commands automatically reference your project's stack documentation and development rules.*