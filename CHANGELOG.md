# Changelog

All notable changes to Context Monkey will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.6.0] - 2025-09-09

### Added
- **Security Assessment**: New `/monkey:security-assessment` command for comprehensive vulnerability analysis
- **Dependency Management**: New `/monkey:onboard-project` command for multi-step project onboarding workflows
- **Documentation Generator**: New `/monkey:docs` command for interactive documentation generation
- **Enhanced Agents**: Added `cm-security-auditor`, `cm-dependency-manager`, and `cm-doc-generator` specialized agents

### Changed
- Updated README.md to reflect new security and dependency management features
- Enhanced command descriptions with clearer usage examples

### Security
- Added comprehensive security scanning capabilities through new security assessment commands

## [0.5.0] - 2025-09-09

### Added
- Improved upgrade system with agent prefixing and pattern-based file removal
- Enhanced error handling and reliability for installation/upgrade operations

### Fixed
- Fixed upgrade system to properly handle existing installations
- Resolved issues with agent file management during upgrades

### Changed
- Redesigned intro command for more reliable project context display

## [0.4.2] - 2025-09-09

### Fixed
- Enhanced intro command reliability and project context display
- Improved error handling for edge cases in project analysis

## [0.4.1] - 2025-09-09

### Added
- Enhanced agents with expanded write capabilities and better error handling
- Added future roadmap planning to agent capabilities

### Changed
- Improved agent tool permissions for more comprehensive project analysis

## [0.4.0] - 2025-09-09

### Added
- **Parallel Tool Execution**: All agents now support concurrent tool operations for improved performance
- **Plan Mode Support**: Added plan mode to analytical commands for better workflow management
- **Enhanced Agent Capabilities**: Expanded tool permissions across all agents

### Changed
- Refactored stack-detective to generate more factual, accurate documentation
- Improved `.claude/` directory handling in gitignore

### Removed
- Removed Mustache templating system in favor of simpler file operations

## [0.3.1] - 2025-09-06

### Removed
- Cleaned up outdated documentation and removed obsolete plan files
- Simplified template references for better maintainability

## [0.3.0] - 2025-09-06

### Added
- **Dynamic Help System**: New `/monkey:intro` command provides context-aware project introductions
- **Comprehensive Stack Analysis**: Enhanced technology stack detection and documentation
- **Runtime Context References**: Simplified context file access for better performance

### Fixed
- Fixed template injection issues for Claude agents
- Resolved path traversal vulnerability in file copying operations
- Fixed command names in installation success messages

### Security
- Addressed path traversal security vulnerability in `copyFileWithTemplate` function

## [0.2.2] - 2025-09-06

### Added
- Comprehensive technology stack analysis capabilities
- Enhanced project context detection and documentation

### Fixed
- Fixed path traversal security vulnerability
- Improved file handling security measures

## [0.2.1] - 2025-09-06

### Changed
- Improved `/monkey:stack-scan` to read existing `stack.md` instead of rescanning when available
- Enhanced performance by avoiding unnecessary stack rescans

## [0.2.0] - 2025-09-05

### Added
- **Global Installation Support**: New `--global` flag for system-wide command installation
- **Enhanced Documentation**: Updated README with global installation examples and use cases

### Changed
- Installation system now supports both local (`.claude/`) and global (`~/.claude/`) deployments
- Commands are prefixed with `monkey_` when installed globally to avoid conflicts

## [0.1.0] - 2025-09-03

### Added
- **Project-Aware Subagent Architecture**: Complete implementation of specialized AI agents
- **Full Command Suite**: All core commands now operational with project context awareness
- **Context Integration**: Seamless integration with `@.monkey/stack.md` and `@.monkey/rules.md`

### Commands Added
- `/monkey:stack-scan` - Technology stack detection and documentation
- `/monkey:explain-repo` - Repository structure analysis
- `/monkey:review-code` - Project-aware code review
- `/monkey:deep-dive` - Detailed code analysis
- `/monkey:plan` - Feature planning and implementation strategies
- `/monkey:add-rule` / `/monkey:edit-rule` / `/monkey:list-rules` - Project rule management

### Agents Added
- `cm-stack-profiler` - Technology analysis specialist
- `cm-repo-explainer` - Repository documentation expert  
- `cm-reviewer` - Code review specialist
- `cm-researcher` - Deep code investigation
- `cm-planner` - Strategic planning and architecture

### Changed
- Migrated from proof-of-concept to production-ready architecture
- Implemented non-invasive installation that preserves existing Claude Code setups

## [0.0.5] - 2025-09-02

### Added
- Version tracking in CLAUDE.md for better project context
- Improved version display in install command output

### Changed
- Updated CLAUDE.md with version reference comments

## [0.0.4] - 2025-08-28

### Added
- Version display functionality in install command
- Dynamic version injection into installed CLAUDE.md files

### Changed
- Enhanced version tracking and display across all installations

## [0.0.3] - 2025-08-28

### Added
- **New Command**: `/monkey:list-rules` for viewing all active project rules
- Enhanced rule management workflow

### Changed
- Improved rule management system with comprehensive list functionality

## [0.0.2] - 2025-08-28

### Added
- Dynamic template reading system that automatically discovers commands in `templates/commands/`
- More flexible and maintainable installation process

### Removed
- Static upgrade.md and uninstall.md templates (no longer needed)

### Changed
- Install command now dynamically reads template directory instead of hardcoded file list

## [0.0.1] - 2025-08-28

### Added
- **Initial NPM Package**: Complete migration from bash installer to npm package
- **Commander.js CLI**: Professional command-line interface with proper argument parsing
- **Core Commands**: install, upgrade, uninstall functionality
- **Template System**: Markdown-based Claude Code command templates
- **Project Context**: `.monkey/` directory for project-specific rules and documentation

### Commands Available
- `/monkey:add-rule` - Add project-specific development rules
- `/monkey:edit-rule` - Modify existing development rules  
- `/monkey:explain-repo` - Repository structure analysis with critical assessment
- `/monkey:deep-dive` - Detailed code investigation and analysis
- `/monkey:plan` - Feature planning and implementation strategies (renamed from `/plan-change`)

### Infrastructure
- NPM package distribution system
- Automated template installation to `.claude/` directory
- Version management and upgrade capabilities
- Clean uninstall functionality

---

## Development History

### Pre-Release Development (2025-08-12 to 2025-08-28)

The project began as Context Monkey with a bash-based installation system and evolved through several architectural iterations:

- **Initial Concept** (2025-08-12): Basic context monkey commands for Claude Code
- **NPM Foundation** (2025-08-13): Migration to npm package architecture
- **CLI Development** (2025-08-27): Implementation of install/uninstall system
- **Template System** (2025-08-28): Markdown-based command templates with project awareness
- **Branding Consolidation** (2025-08-28): Unified "monkey" branding throughout codebase

The project maintains the Apache 2.0 license established in the initial release.

---

*This changelog is automatically maintained and reflects the complete development history of Context Monkey. For detailed commit information, see the [GitHub repository](https://github.com/richhaase/context-monkey).*