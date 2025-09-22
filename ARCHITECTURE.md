# Architecture

Context Monkey is a TypeScript CLI application that extends Claude Code with specialized subagents and project-aware commands.

## System Overview

Context Monkey follows a **modular CLI architecture** with three main components:

- **CLI Interface** - Command registration and user interaction
- **Installation System** - File deployment and configuration management
- **Resource Templates** - Reusable agents and commands

## Component Architecture

### CLI Core (`src/`)

```
src/
├── bin/context-monkey.ts    # Main CLI entry point
├── commands/
│   ├── install.ts          # Installation logic
│   └── uninstall.ts        # Cleanup logic
├── config/
│   └── hooks.ts            # Notification hook generation
├── utils/
│   ├── files.ts            # File operations
│   ├── platform.ts         # OS detection
│   ├── prompt.ts           # User interaction
│   └── settings.ts         # Configuration management
└── types/
    └── index.ts            # TypeScript definitions
```

**Key Responsibilities:**

- **CLI Interface**: Command parsing and routing using Commander.js
- **Installation Engine**: Safe deployment of resources to Claude Code directories
- **Platform Detection**: OS-specific functionality (notifications, paths)
- **Configuration Management**: Settings merging and validation

### Resource System (`resources/`)

```
resources/
├── commands/               # Slash commands for Claude Code
│   ├── intro.md           # Welcome and overview
│   ├── stack-scan.md      # Technology detection
│   ├── explain-repo.md    # Repository analysis
│   ├── plan.md            # Implementation planning
│   ├── review-code.md     # Code review
│   ├── deep-dive.md       # Detailed analysis
│   ├── docs.md            # Documentation generation
│   ├── add-rule.md        # Rule management
│   ├── edit-rule.md       # Rule editing
│   └── list-rules.md      # Rule listing
└── agents/                # Specialized AI subagents
    ├── cm-researcher.md   # Technical investigation
    ├── cm-planner.md      # Implementation planning
    ├── cm-reviewer.md     # Code review specialist
    ├── cm-repo-explainer.md # Repository documentation
    ├── cm-stack-profiler.md # Technology detection
    ├── cm-doc-generator.md # Documentation automation
    ├── cm-security-auditor.md # Security assessment
    └── cm-dependency-manager.md # Dependency analysis
```

**Design Pattern**: Each resource follows a **template pattern** with:

- **YAML frontmatter** - Configuration and metadata
- **Markdown content** - Instructions and context for Claude Code
- **Consistent naming** - `cm-` prefix for agents, `/cm:` for commands

## Data Flow

### Installation Process

```
1. User runs `context-monkey install`
2. CLI validates target directory (~/.claude or ./.claude)
3. Resource files are copied with validation
4. Notification hooks are optionally installed
5. Claude Code discovers new commands and agents
```

### Command Execution

```
1. User types `/cm:command` in Claude Code
2. Claude Code loads command template from ~/.claude/commands/cm/
3. Template references project context (@.cm/stack.md, @.cm/rules.md)
4. Command may delegate to specialized agent for processing
5. Agent processes request with full project context
```

### Project Context Integration

Context Monkey maintains project awareness through:

- **Stack Documentation** (`@.cm/stack.md`) - Technology choices and configurations
- **Development Rules** (`@.cm/rules.md`) - Coding standards and patterns
- **Automatic Reference** - All commands include these files in their context

## Design Decisions

### TypeScript + ES Modules

- **Rationale**: Type safety and modern JavaScript features
- **Trade-offs**: Build step required, but improved development experience
- **Implementation**: Full ES module support with `import.meta.dirname`

### Resource-Based Architecture

- **Rationale**: Separation of logic from content, easy customization
- **Trade-offs**: More files to manage, but flexible and maintainable
- **Implementation**: Markdown templates with YAML frontmatter

### Commander.js for CLI

- **Rationale**: Mature, well-documented CLI framework
- **Trade-offs**: Additional dependency, but robust argument parsing
- **Implementation**: Subcommand architecture with typed options

## Technology Stack

### Core Dependencies

- **Node.js 16+** - Runtime environment
- **TypeScript 5.3+** - Type system and compilation
- **Commander.js 12** - CLI argument parsing and command routing
- **fs-extra 11** - Enhanced file system operations

### Development Tools

- **Bun** - Fast package manager and test runner
- **ESLint + Prettier** - Code quality and formatting
- **Husky + lint-staged** - Git hooks for code quality
- **TypeScript Compiler** - ES module compilation

### Platform Integration

- **Claude Code CLI** - Host environment for commands and agents
- **terminal-notifier (macOS)** - Desktop notifications
- **Cross-platform file operations** - Windows, macOS, Linux support

## Extension Points

### Adding New Commands

1. Create new `.md` file in `resources/commands/`
2. Add YAML frontmatter with description and allowed tools
3. Write command logic in Markdown format
4. Commands are automatically discovered on next install

### Adding New Agents

1. Create new `cm-*.md` file in `resources/agents/`
2. Define agent capabilities in YAML frontmatter
3. Write agent prompt and instructions
4. Agents are automatically available to commands

### Custom Project Rules

- Use `/cm:add-rule` to define project-specific patterns
- Rules are stored in `@.cm/rules.md` and referenced by all commands
- Supports custom coding standards, architectural decisions, and workflows

## Security Considerations

- **File System Access**: Limited to Claude Code directories (`~/.claude`, `./.claude`)
- **Resource Validation**: Files are validated before copying during installation
- **Safe Cleanup**: Uninstall only removes Context Monkey prefixed files (`cm-*`)
- **No Network Access**: Core functionality works entirely offline
- **Permission Model**: Inherits Claude Code's security model and tool restrictions

## Performance Characteristics

- **Installation**: O(n) where n = number of resource files (~20 files typical)
- **Command Loading**: Instant - templates loaded by Claude Code as needed
- **Memory Usage**: Minimal - CLI exits after operation, templates loaded on-demand
- **Disk Usage**: ~100KB for all templates and agents

The architecture prioritizes simplicity, safety, and extensibility while providing powerful project-aware capabilities to Claude Code.
