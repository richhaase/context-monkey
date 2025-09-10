# Contributing to Context Monkey

Thank you for your interest in contributing to Context Monkey! This guide will help you get started with developing and contributing to this Claude Code extension installer.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Code Standards](#code-standards)
- [Testing](#testing)
- [Submitting Changes](#submitting-changes)
- [Release Process](#release-process)
- [Architecture Guidelines](#architecture-guidelines)
- [Community Guidelines](#community-guidelines)

## Getting Started

### Prerequisites

- **Node.js 16+** (as specified in package.json engines)
- **npm** (comes with Node.js)
- **Git** for version control
- **Claude Code** for testing installed extensions

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/context-monkey.git
   cd context-monkey
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Test Local Installation**
   ```bash
   # Test CLI functionality
   node bin/context-monkey.js --help
   
   # Test installation process
   npx context-monkey install
   ```

4. **Link for Global Development**
   ```bash
   npm link
   context-monkey --help
   ```

### Verify Setup

Ensure your development environment is working:

```bash
# Check CLI works
node bin/context-monkey.js --version

# Test install command
node bin/context-monkey.js install --help

# Verify file structure
ls -la resources/  # Should show agents/ and commands/
```

## Development Workflow

### Branch Strategy

- **main**: Production-ready code
- **feature/feature-name**: New features
- **fix/issue-description**: Bug fixes  
- **docs/documentation-updates**: Documentation changes

### Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
feat(install): add support for custom template directories
fix(uninstall): resolve cleanup issue with global installations
docs(readme): update installation instructions
refactor(commands): extract common file operations
```

### Development Process

1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Follow code standards below
   - Test your changes manually
   - Update documentation if needed

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add your feature description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

## Code Standards

### JavaScript Conventions

- **ES6+ Features**: Use modern JavaScript features
- **No TypeScript**: Project uses vanilla JavaScript
- **Async/Await**: Prefer async/await over promises
- **Error Handling**: Always handle errors appropriately

### File Organization

```
context-monkey/
├── bin/              # CLI entry point
├── lib/              # Core library code
│   ├── commands/     # CLI command implementations
│   └── utils/        # Shared utilities
├── resources/        # Templates and resources
│   ├── agents/       # Claude Code agents
│   └── commands/     # Claude Code slash commands
└── docs/            # Documentation
```

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always include semicolons
- **Naming**: camelCase for variables and functions

**Example:**
```javascript
const fs = require('fs-extra');

async function copyResourceFiles(sourcePath, targetPath) {
  try {
    await fs.ensureDir(targetPath);
    await fs.copy(sourcePath, targetPath);
    console.log(`Resources copied to ${targetPath}`);
  } catch (error) {
    throw new Error(`Failed to copy resources: ${error.message}`);
  }
}
```

### Dependencies

- **Minimal Dependencies**: Only add dependencies when necessary
- **Security**: Keep dependencies up-to-date
- **License Compatibility**: Ensure compatible licenses

## Testing

### Current Testing Approach

Context Monkey currently uses manual testing. Future automated testing is recommended.

### Manual Testing Checklist

Before submitting changes, test:

#### Basic Functionality
- [ ] `node bin/context-monkey.js --help` works
- [ ] `node bin/context-monkey.js --version` shows correct version
- [ ] All commands show help text correctly

#### Installation Testing
- [ ] `npx context-monkey install` works locally
- [ ] `npx context-monkey install --global` works globally
- [ ] Files are copied to correct `.claude/` directories
- [ ] Installed commands work in Claude Code

#### Upgrade/Uninstall Testing
- [ ] `npx context-monkey upgrade` updates existing installations
- [ ] `npx context-monkey uninstall` removes files completely
- [ ] No orphaned files remain after uninstall

#### Resource Testing
- [ ] All resource files copy correctly
- [ ] YAML frontmatter is valid in commands and agents
- [ ] Context references (`@.monkey/stack.md`) work correctly

### Future Testing Framework

Contributors are encouraged to add automated testing:
- **Framework**: Jest or Mocha
- **Coverage**: Unit tests for core functions
- **Integration**: End-to-end CLI testing

## Submitting Changes

### Pull Request Process

1. **Pre-submission Checklist**
   - [ ] All manual tests pass
   - [ ] Code follows style guidelines
   - [ ] Documentation updated if needed
   - [ ] Commit messages follow convention

2. **PR Description Template**
   ```markdown
   ## Description
   Brief description of changes

   ## Type of Change
   - [ ] Bug fix
   - [ ] New feature
   - [ ] Documentation update
   - [ ] Refactoring

   ## Testing
   - [ ] Manual testing completed
   - [ ] All existing functionality works

   ## Documentation
   - [ ] README updated (if needed)
   - [ ] Code comments added (if needed)
   ```

3. **Review Criteria**
   - Code quality and style
   - Functionality correctness
   - Documentation completeness
   - Backward compatibility

### Review Process

- All PRs require review before merging
- Address reviewer feedback promptly
- Keep PR scope focused and manageable
- Rebase when necessary to maintain clean history

## Release Process

### Versioning

Context Monkey follows [Semantic Versioning](https://semver.org/):
- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### Automated Publishing

Releases are automated via GitHub Actions:

1. **Update Version**
   ```bash
   npm version patch  # or minor/major
   ```

2. **Push with Tags**
   ```bash
   git push origin main --tags
   ```

3. **GitHub Actions** automatically:
   - Runs tests (when available)
   - Publishes to npm registry
   - Creates GitHub release

### Release Notes

- Changelog is maintained automatically
- Include breaking changes in release notes
- Document new features and bug fixes

## Architecture Guidelines

### Adding New Commands

1. **Create Command File**
   ```bash
   touch resources/commands/your-command.md
   ```

2. **YAML Frontmatter**
   ```yaml
   ---
   name: your-command
   description: "Your command description"
   subagent: agent-name
   version: "{{version}}"
   ---
   ```

3. **Command Documentation**
   - Clear description and usage
   - Examples and context awareness
   - Follow existing command patterns

### Adding New Agents

1. **Create Agent File**
   ```bash
   touch resources/agents/your-agent.md
   ```

2. **Agent Structure**
   - Clear role definition
   - Tool access specifications
   - Context integration guidelines

### File Copying Principles

- **Direct Copying**: No templating or modification
- **Preserve Structure**: Maintain file organization
- **Context References**: Use `@.monkey/` references appropriately

### Project Context Integration

All extensions should leverage:
- **Stack Awareness**: `@.monkey/stack.md` for technology detection
- **Rule Compliance**: `@.monkey/rules.md` for project conventions
- **Context Preservation**: Maintain project-specific context

## Community Guidelines

### Code of Conduct

- Be respectful and inclusive
- Provide constructive feedback
- Help others learn and contribute
- Follow professional communication standards

### Communication

- **Issues**: Use GitHub issues for bugs and feature requests
- **Discussions**: Use GitHub discussions for questions
- **PRs**: Use pull requests for code contributions

### Attribution

- Contributors are recognized in release notes
- Significant contributions may be highlighted
- Original authors credited for major features

### Getting Help

- **Documentation**: Check README, ARCHITECTURE, and SETUP guides
- **Issues**: Search existing issues before creating new ones
- **Community**: Engage with other contributors respectfully

## Quick Reference

### Common Commands

```bash
# Development
npm install
node bin/context-monkey.js --help
npx context-monkey install

# Testing
npm link
context-monkey --version

# Release
npm version patch
git push origin main --tags
```

### File Structure

```
resources/
├── agents/           # Claude Code AI agents
│   ├── cm-*.md      # Context Monkey agents
│   └── ...
└── commands/         # Claude Code slash commands
    ├── monkey*.md   # Context Monkey commands
    └── ...
```

---

Thank you for contributing to Context Monkey! Your contributions help make Claude Code more powerful for everyone.