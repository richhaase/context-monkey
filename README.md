# Context Monkey

> Prompt engineering framework for Claude Code using specialized subagents

[![npm version](https://badge.fury.io/js/context-monkey.svg)](https://www.npmjs.com/package/context-monkey)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache_2.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Node.js](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)](https://nodejs.org/)
[![Bun](https://img.shields.io/badge/bun-%3E%3D1.0.0-ff69b4)](https://bun.sh/)

Context Monkey is a Claude Code extension installer that provides curated slash commands and AI agents with project awareness. It enhances your Claude Code workflow by installing specialized commands that understand your technology stack and development patterns.

## 🚀 Quick Start

### Installation

#### Using Bun/bunx (recommended)
```bash
# Global installation (recommended)
bunx context-monkey install

# Local installation  
bunx context-monkey install --local
```

#### Using npm/npx
```bash
# Global installation
npx context-monkey install

# Local installation
npx context-monkey install --local
```

### First Steps

1. **Document your stack**: Run `/cm:stack-scan` to auto-detect your technology choices
2. **Set project rules**: Use `/cm:add-rule` to capture coding standards  
3. **Get project overview**: Try `/cm:explain-repo` for comprehensive documentation

## 📋 Available Commands

### 📊 Analysis & Documentation
- **`/cm:stack-scan`** - Auto-detect and document your technology stack
- **`/cm:explain-repo`** - Generate comprehensive repository documentation  
- **`/cm:deep-dive`** - Perform detailed code analysis with project context
- **`/cm:docs`** - Interactive documentation generator (README, architecture, etc.)

### 🔍 Code Review & Quality
- **`/cm:review-code`** - Review code changes with project awareness
- **`/cm:security-assessment`** - Comprehensive security vulnerability analysis
- **`/cm:onboard-project`** - Multi-step project onboarding workflow

### 📋 Planning & Architecture  
- **`/cm:plan`** - Create detailed implementation plans for features

### ⚙️ Configuration & Rules
- **`/cm:add-rule`** - Add new project-specific development rules
- **`/cm:edit-rule`** - Modify existing development rules
- **`/cm:list-rules`** - View all active project rules

## 🎯 Key Features

### ✨ Project Awareness
All commands automatically understand your project through:
- **Stack Detection**: Technology choices documented in `@.cm/stack.md`
- **Development Rules**: Project conventions stored in `@.cm/rules.md`
- **Context Preservation**: Consistent project knowledge across Claude Code sessions

### 🚀 Zero Configuration
- Commands work immediately after installation
- No setup files or configuration required
- Automatic project context detection

### 🔧 Specialized Subagents
Each command uses purpose-built AI agents:
- **cm-stack-profiler**: Technology stack analysis and documentation
- **cm-repo-explainer**: Repository structure and architecture documentation
- **cm-reviewer**: Code review with project-specific standards
- **cm-planner**: Feature planning and implementation strategies
- **cm-researcher**: Deep code analysis and investigation
- **cm-security-auditor**: Security vulnerability assessment
- **cm-dependency-manager**: Dependency analysis and management
- **cm-doc-generator**: Interactive documentation generation

## 📦 Installation Types

### Global Installation (Recommended)
```bash
# Using npm/npx
npx context-monkey install

# Using Bun/bunx
bunx context-monkey install
```
Installs commands to `~/.claude/` for use across all projects with full context awareness.

### Local Installation  
```bash
# Using npm/npx
npx context-monkey install --local

# Using Bun/bunx
bunx context-monkey install --local
```
Installs commands to `./.claude/` for project-specific use.

## 🔄 Managing Installations

### Upgrade to Latest Version
```bash
# Using npm/npx
npx context-monkey install        # Automatically detects and upgrades

# Using Bun/bunx
bunx context-monkey install       # Automatically detects and upgrades
```

### Uninstall
```bash
# Using npm/npx  
npx context-monkey uninstall      # Remove global installation  
npx context-monkey uninstall --local   # Remove local installation

# Using Bun/bunx
bunx context-monkey uninstall     # Remove global installation
bunx context-monkey uninstall --local  # Remove local installation
```

## 🏗️ How It Works

Context Monkey operates as a Claude Code extension installer:

1. **Resource Copying**: Pre-written commands and agents are copied from source files
2. **Context Integration**: Installed extensions reference `@.cm/stack.md` and `@.cm/rules.md`
3. **Project Awareness**: Commands automatically understand your project structure and conventions

### Architecture

```
Context Monkey
├── CLI Layer (Commander.js)
├── Command Layer (install/upgrade/uninstall)
├── File Operations (fs-extra)
└── Project Context (@.cm/ references)
```

## 💡 Daily Workflow

### Before Coding
- Run `/cm:plan` to break down features into implementation steps
- Use `/cm:stack-scan` to update technology documentation

### During Development
- Reference `/cm:deep-dive` for understanding complex code sections
- Use `/cm:security-assessment` to identify potential vulnerabilities

### Before Committing
- Run `/cm:review-code` to review changes with project awareness
- Update rules with `/cm:add-rule` if new patterns emerge

### Documentation
- Generate comprehensive docs with `/cm:docs`
- Update repository overview using `/cm:explain-repo`

## 🛠️ Development

### Local Development

#### Using Node.js (traditional)
```bash
git clone https://github.com/richhaase/context-monkey.git
cd context-monkey
npm install

# Test locally
node bin/context-monkey.js --help

# Test installation
npx context-monkey install
```

#### Using Bun
```bash
git clone https://github.com/richhaase/context-monkey.git
cd context-monkey
bun install

# Test locally  
bun bin/context-monkey.js --help

# Test installation
bunx context-monkey install
```

### Tech Stack
- **Runtime**: Node.js 16+ or Bun 1.0+
- **CLI Framework**: Commander.js
- **File Operations**: fs-extra
- **Distribution**: NPM with GitHub Actions CI/CD
- **Performance**: Optimized for both Node.js and Bun runtimes

## 📄 License

Licensed under the Apache License, Version 2.0. See [LICENSE](LICENSE) for details.

## 🐛 Issues & Support

- **Report bugs**: [GitHub Issues](https://github.com/richhaase/context-monkey/issues)
- **Feature requests**: [GitHub Issues](https://github.com/richhaase/context-monkey/issues)
- **Documentation**: [GitHub Repository](https://github.com/richhaase/context-monkey)

## 🤝 Contributing

Contributions welcome! Please read our contribution guidelines and submit pull requests for any improvements.

---

*Context Monkey makes Claude Code more effective by providing consistent project context and specialized AI agents for common development tasks.*