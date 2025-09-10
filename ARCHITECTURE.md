# Context Monkey Architecture

> **Generated**: 2025-09-09  
> **Version**: 0.6.0  
> **Repository**: context-monkey

## Overview

Context Monkey is a Claude Code extension installer that provides curated slash commands and AI agents with project awareness. The architecture follows a simple, file-based approach focused on reliability and ease of maintenance.

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Context Monkey                         │
├─────────────────────────────────────────────────────────────┤
│  CLI Layer (Commander.js)                                  │
│  ├── Install Command (/install)                            │
│  ├── Upgrade Command (/upgrade)                            │
│  └── Uninstall Command (/uninstall)                        │
├─────────────────────────────────────────────────────────────┤
│  File Operations Layer (fs-extra)                          │
│  ├── Template Copying                                      │
│  ├── Directory Management                                  │
│  └── Version Injection                                     │
├─────────────────────────────────────────────────────────────┤
│  Template System                                           │
│  ├── Commands (templates/commands/)                        │
│  └── Agents (templates/agents/)                            │
├─────────────────────────────────────────────────────────────┤
│  Project Context Integration                               │
│  ├── @.monkey/stack.md (Technology Stack)                  │
│  └── @.monkey/rules.md (Development Rules)                 │
└─────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. CLI Layer (`bin/context-monkey.js`)

**Purpose**: Entry point that handles command-line interface and argument parsing.

**Technologies**: Commander.js for robust CLI handling

**Responsibilities**:
- Parse command-line arguments and options
- Route commands to appropriate handlers
- Provide help and version information
- Handle global vs local installation flags

### 2. Command Layer (`lib/commands/`)

Contains the core business logic for each operation:

#### Install Command (`lib/commands/install.js`)
- Copies templates from `templates/` to target directory
- Handles both local (`.claude/`) and global (`~/.claude/`) installations
- Injects version information into template files
- Creates project context files (`.monkey/stack.md`, `.monkey/rules.md`)

#### Upgrade Command (`lib/commands/upgrade.js`)
- Removes existing Context Monkey files using pattern matching
- Performs fresh installation of latest templates
- Preserves user-modified project context files
- Handles version migration scenarios

#### Uninstall Command (`lib/commands/uninstall.js`)
- Removes all Context Monkey installed files
- Cleans up generated directories if empty
- Preserves project context files (user decision)

### 3. Template System (`templates/`)

#### Commands (`templates/commands/`)
Pre-written Claude Code slash commands that provide specialized functionality:

- **stack-scan.md**: Technology stack detection and documentation
- **explain-repo.md**: Repository structure analysis
- **review-code.md**: Project-aware code review
- **deep-dive.md**: Detailed code analysis
- **plan.md**: Feature planning and implementation strategies
- **security-assessment.md**: Security vulnerability analysis
- **onboard-project.md**: Multi-step project onboarding
- **docs.md**: Interactive documentation generator
- **add-rule.md / edit-rule.md / list-rules.md**: Project rule management

#### Agents (`templates/agents/`)
Specialized AI subagents that power the commands:

- **cm-stack-profiler.md**: Technology analysis specialist
- **cm-repo-explainer.md**: Repository documentation expert
- **cm-reviewer.md**: Code review specialist
- **cm-researcher.md**: Deep code investigation
- **cm-planner.md**: Strategic planning and architecture
- **cm-security-auditor.md**: Security assessment specialist
- **cm-dependency-manager.md**: Dependency analysis expert
- **cm-doc-generator.md**: Documentation generation specialist

### 4. Project Context System

#### Stack Detection (`@.monkey/stack.md`)
- Auto-generated technology stack documentation
- Used by all commands for project awareness
- Contains framework versions, dependencies, and build tools
- Updated via `/monkey:stack-scan` command

#### Development Rules (`@.monkey/rules.md`)
- User-defined project conventions and patterns
- Coding standards and architectural decisions
- Accessed via `@.monkey/rules.md` references in commands
- Managed via `/monkey:add-rule`, `/monkey:edit-rule` commands

## Data Flow

### Installation Flow
```
User runs: npx context-monkey install
    ↓
Commander.js parses arguments
    ↓
Install command determines target directory
    ↓
Templates copied with fs-extra
    ↓
Version injection (if needed)
    ↓
Project context files created
    ↓
Installation complete
```

### Command Execution Flow
```
User runs: /monkey:stack-scan
    ↓
Claude Code loads command from .claude/commands/monkey/
    ↓
Command references @.monkey/stack.md for context
    ↓
Agent (cm-stack-profiler) analyzes codebase
    ↓
Results returned with project awareness
```

## Design Principles

### 1. Simplicity First
- No complex build systems or transpilation
- Vanilla JavaScript with minimal dependencies
- File-based operations using proven libraries

### 2. Project Awareness
- All commands understand project context automatically
- Consistent knowledge across Claude Code sessions
- Zero configuration required from users

### 3. Template-Based Architecture
- Pre-written, tested commands and agents
- Version control for all extensions
- Easy maintenance and updates

### 4. Minimal Dependencies
- **commander**: ^12.0.0 (CLI framework)
- **fs-extra**: ^11.2.0 (Enhanced file operations)
- No build dependencies or complex toolchain

## File System Layout

```
context-monkey/
├── bin/
│   └── context-monkey.js           # CLI entry point
├── lib/
│   └── commands/
│       ├── install.js              # Installation logic
│       ├── upgrade.js              # Upgrade logic
│       └── uninstall.js            # Uninstall logic
├── templates/
│   ├── commands/                   # Claude Code slash commands
│   │   ├── stack-scan.md
│   │   ├── explain-repo.md
│   │   ├── review-code.md
│   │   ├── deep-dive.md
│   │   ├── plan.md
│   │   ├── security-assessment.md
│   │   ├── onboard-project.md
│   │   ├── docs.md
│   │   ├── add-rule.md
│   │   ├── edit-rule.md
│   │   └── list-rules.md
│   └── agents/                     # AI subagent definitions
│       ├── cm-stack-profiler.md
│       ├── cm-repo-explainer.md
│       ├── cm-reviewer.md
│       ├── cm-researcher.md
│       ├── cm-planner.md
│       ├── cm-security-auditor.md
│       ├── cm-dependency-manager.md
│       └── cm-doc-generator.md
└── package.json                    # Project metadata
```

## Target Installation Layout

### Local Installation (`./.claude/`)
```
project-root/
├── .claude/
│   ├── commands/
│   │   └── monkey/
│   │       ├── stack-scan.md
│   │       ├── explain-repo.md
│   │       └── [other commands...]
│   └── agents/
│       ├── cm-stack-profiler.md
│       ├── cm-repo-explainer.md
│       └── [other agents...]
└── .monkey/
    ├── stack.md                    # Technology stack documentation
    └── rules.md                    # Project development rules
```

### Global Installation (`~/.claude/`)
```
~/.claude/
├── commands/
│   └── monkey/
│       ├── stack-scan.md
│       ├── explain-repo.md
│       └── [other commands...]
└── agents/
    ├── cm-stack-profiler.md
    ├── cm-repo-explainer.md
    └── [other agents...]
```

## Security Considerations

### 1. File System Security
- All file operations use `fs-extra` with proper error handling
- Path traversal prevention through directory validation
- No arbitrary code execution or eval statements

### 2. Template Security
- Templates are static markdown files
- No dynamic code generation or execution
- Version-controlled and auditable content

### 3. Dependency Security
- Minimal dependency surface area
- Well-maintained, popular packages only
- Regular security scanning via GitHub Actions

## Performance Characteristics

### Installation Performance
- **Fast**: Simple file copying operations
- **Lightweight**: ~20 template files (~100KB total)
- **Efficient**: No compilation or build steps

### Runtime Performance
- **Zero overhead**: No runtime performance impact
- **Native speed**: Claude Code executes templates directly
- **Minimal memory**: Templates loaded on-demand by Claude Code

## Extensibility

### Adding New Commands
1. Create command template in `templates/commands/`
2. Reference project context via `@.monkey/stack.md` and `@.monkey/rules.md`
3. Specify appropriate subagent in command metadata
4. Test via local installation

### Adding New Agents
1. Create agent definition in `templates/agents/`
2. Define specialized capabilities and tool access
3. Reference in command templates as needed
4. Update documentation

## Error Handling

### Installation Errors
- Directory permission issues handled gracefully
- Existing file conflicts detected and reported
- Partial installation rollback on failures

### Runtime Errors
- Template loading failures logged and reported
- Project context file missing scenarios handled
- Graceful degradation when context unavailable

## Future Architecture Considerations

### Planned Enhancements
- Plugin system for third-party extensions
- Configuration file support for advanced users
- Template versioning and migration system
- Performance analytics and usage tracking

### Scalability
- Current architecture scales to 100+ commands/agents
- File-based approach suitable for individual developer use
- Consider database storage for enterprise scenarios

---

*This architecture document reflects the current implementation as of version 0.6.0. The design prioritizes simplicity, reliability, and ease of maintenance while providing powerful project-aware development tools.*