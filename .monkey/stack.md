# Context Monkey Technology Stack

**Generated**: 2025-09-06 18:16:18 UTC  
**Repository**: context-monkey

## Languages & Frameworks

### Primary Stack
- **Language**: JavaScript (ES6+)
- **Runtime**: Node.js 16+ (as specified in package.json engines)
- **Framework**: CLI application using Commander.js
- **Type System**: None (vanilla JavaScript)

### Secondary Technologies
- **Templating**: Mustache.js for dynamic template generation
- **File System**: fs-extra for enhanced file operations

## Package Management
- **Manager**: npm
- **Lock File**: Present (package-lock.json)
- **Workspaces**: Not configured (single package)
- **Registry**: Public (npmjs.org)

## Build & Development

### Build System
```bash
# No explicit build step (vanilla JavaScript)
npm install

# Development testing
node bin/context-monkey.js --help

# Global installation testing  
npm link
```

### Testing
```bash
# No formal test suite configured
# Manual testing via CLI commands

# Installation testing
npx context-monkey install
```

### Code Quality
```bash
# No linting configured
# Consider adding: ESLint for code quality

# No formatting configured  
# Consider adding: Prettier for code formatting

# No type checking
# Consider adding: JSDoc or TypeScript
```

## Deployment & Operations

### Containerization
- **Docker**: Not present
- **Compose**: Not configured
- **Kubernetes**: Not configured

### CI/CD
- **Platform**: GitHub Actions
- **Pipelines**: 
  1. publish.yml - Automated NPM publishing on version tags

### Infrastructure
- **IaC**: Not applicable (CLI tool)
- **Cloud**: NPM registry for distribution

## External Services
- **Database**: None
- **Cache**: None  
- **Message Queue**: None
- **Storage**: Local filesystem only
- **Monitoring**: None

## Entry Points
1. **CLI Tool**: `bin/context-monkey.js` (main executable)
2. **Install Command**: `lib/commands/install.js`
3. **Upgrade Command**: `lib/commands/upgrade.js`
4. **Uninstall Command**: `lib/commands/uninstall.js`

## Architecture Indicators
- **Pattern**: CLI Tool / Command-line utility
- **API Style**: Command-line interface with subcommands
- **Database Pattern**: File system operations only
- **State Management**: Stateless (file-based configuration)

## Development Setup

### Quick Start
```bash
# Clone and install
git clone https://github.com/richhaase/context-monkey.git
cd context-monkey
npm install

# Test locally
node bin/context-monkey.js --help

# Test installation
npx context-monkey install
```

### Environment Variables
- Required: None
- Optional: NODE_AUTH_TOKEN (for publishing only)
- Example file: Not present

## Recommendations

### Immediate Improvements
1. **Add Testing**: Consider adding Jest or Mocha for unit tests
2. **Code Quality**: Add ESLint and Prettier for consistency
3. **Type Safety**: Consider adding JSDoc annotations or TypeScript

### Tool Suggestions
- Consider adding: Jest for testing framework
- Consider adding: ESLint for code linting
- Consider adding: Prettier for code formatting
- Consider adding: Husky for git hooks

### Performance Optimizations
- Template caching could be added for repeated installations
- Async operations are already properly implemented with fs-extra

## Stack Health Score

**Overall**: B+

- **Dependencies**: Up-to-date and minimal (good security posture)
- **Tooling**: Basic but adequate for a CLI tool
- **Documentation**: Excellent README and inline documentation
- **Testing**: Minimal (opportunity for improvement)
- **Build Speed**: Fast (no build step required)

## Key Technologies Summary

- **Primary**: Node.js + Commander.js CLI framework
- **Templates**: Mustache.js for dynamic content generation
- **File System**: fs-extra for robust file operations
- **Distribution**: NPM with GitHub Actions CI/CD
- **Architecture**: Stateless CLI tool with template-based subagent generation

## Essential Commands

```bash
# Install dependencies
npm install

# Run locally
node bin/context-monkey.js --help

# Test installation
npx context-monkey install

# Link for global development
npm link

# Publish (automated via GitHub Actions)
npm publish
```

## Architecture Overview

Context Monkey is a Node.js CLI tool that generates specialized Claude Code subagents through a template-based system:

1. **CLI Layer**: Commander.js handles command parsing and routing
2. **Command Layer**: Install/upgrade/uninstall operations in `lib/commands/`
3. **Template System**: Mustache templates in `templates/` for agent generation
4. **File Operations**: fs-extra handles robust file system operations
5. **Context Injection**: Project-aware templates that embed `.monkey/stack.md` and `.monkey/rules.md` content

The tool operates by:
1. Reading project context from `.monkey/` files
2. Processing Mustache templates with project data
3. Installing customized commands and agents to Claude Code directories
4. Providing specialized AI workflows with embedded project knowledge
