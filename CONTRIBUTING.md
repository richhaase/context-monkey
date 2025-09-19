# Contributing to Context Monkey

Welcome! Context Monkey thrives on community contributions. This guide will help you contribute effectively to the project.

## Quick Start for Contributors

1. **Fork and clone**: Fork the repository and clone your fork
2. **Set up development**: Follow the [SETUP.md](./SETUP.md) guide
3. **Create a branch**: `git checkout -b feature/your-feature`
4. **Make changes**: Follow our coding standards below
5. **Test locally**: Install and test your changes
6. **Submit a PR**: Create a pull request with a clear description

## Development Environment

### Prerequisites

- Node.js 16.0.0+
- Bun (recommended) or npm
- Claude Code CLI for testing
- Git

### Setup

```bash
git clone https://github.com/YOUR-USERNAME/context-monkey.git
cd context-monkey
bun install
bun run build
```

See [SETUP.md](./SETUP.md) for complete development environment setup.

## Code Standards

### TypeScript Guidelines

- **Type Safety**: All code must be properly typed
- **ES Modules**: Use `import/export` syntax exclusively
- **Error Handling**: Use proper error types and comprehensive error handling
- **File Extensions**: Always use `.js` extensions in imports (even for `.ts` files)

### Code Style

```typescript
// Good - Proper TypeScript with ES modules
import path from 'path';
import { InstallOptions } from '../types/index.js';

export async function install(options: InstallOptions): Promise<void> {
  try {
    // Implementation
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    throw new Error(`Installation failed: ${errorMessage}`);
  }
}

// Bad - Missing types and error handling
const install = options => {
  // Implementation without proper error handling
};
```

### Formatting and Linting

- **ESLint**: All code must pass linting
- **Prettier**: Use consistent code formatting
- **Pre-commit hooks**: Automatically run before commits

```bash
# Check code quality
bun run lint
bun run format:check

# Fix issues automatically
bun run lint:fix
bun run format
```

## Project Structure

### Core Architecture

```
src/
├── bin/                    # CLI entry points
├── commands/              # Installation and management commands
├── config/                # Configuration and settings
├── types/                 # TypeScript type definitions
└── utils/                 # Shared utilities

resources/
├── commands/              # Claude Code slash commands
└── agents/                # AI subagent definitions
```

### Key Principles

- **Separation of concerns**: CLI logic separate from resource content
- **Type safety**: Comprehensive TypeScript usage
- **Error resilience**: Graceful error handling and recovery
- **Cross-platform**: Support for macOS, Linux, and Windows

## Contributing Guidelines

### Types of Contributions

#### New Slash Commands

1. Create `resources/commands/command-name.md`
2. Add YAML frontmatter with proper metadata:
   ```yaml
   ---
   description: Brief description of what the command does
   allowed-tools: Read, Grep, Bash
   ---
   ```
3. Write command instructions in clear Markdown
4. Test with Claude Code locally

#### New Subagents

1. Create `resources/agents/cm-agent-name.md`
2. Follow the `cm-` naming prefix convention
3. Define agent capabilities in YAML frontmatter:
   ```yaml
   ---
   name: cm-agent-name
   description: What this agent specializes in
   tools: Read, Glob, Grep, WebSearch
   ---
   ```
4. Write comprehensive agent prompt and behavior

#### CLI Features

1. Add new commands in `src/commands/`
2. Register in `src/bin/context-monkey.ts`
3. Add TypeScript types in `src/types/`
4. Update help text and documentation
5. Add comprehensive error handling

### Development Workflow

#### Branch Naming

- **Features**: `feature/short-description`
- **Bug fixes**: `fix/issue-description`
- **Documentation**: `docs/what-changed`

#### Commit Messages

Use conventional commit format:

```
type(scope): description

feat(agents): add new security audit agent
fix(install): handle permission errors gracefully
docs(readme): update installation instructions
test(cli): add integration tests for install command
```

Types: `feat`, `fix`, `docs`, `test`, `refactor`, `chore`

#### Pull Request Process

1. **Clear title**: Describe what the PR accomplishes
2. **Detailed description**: Explain changes and reasoning
3. **Test verification**: Show that you've tested the changes
4. **Documentation**: Update relevant docs if needed

#### PR Template

```markdown
## What does this PR do?

Brief description of changes

## Testing

- [ ] Tested locally with `bun run build && node dist/bin/context-monkey.js install --local`
- [ ] Verified commands work in Claude Code
- [ ] Ran linting and formatting checks

## Breaking Changes

List any breaking changes and migration steps

## Additional Notes

Any other relevant information
```

### Testing Your Changes

#### Local Testing Workflow

```bash
# 1. Build your changes
bun run build

# 2. Install locally for testing
node dist/bin/context-monkey.js install --local

# 3. Test in Claude Code
claude
    /cm:stack-scan  # Verify installation works
/cm:your-new-command  # Test your specific changes

# 4. Clean up after testing
node dist/bin/context-monkey.js uninstall --local
```

#### Quality Checks

```bash
# Run all quality checks
bun run lint
bun run format:check
bun run build  # Ensure TypeScript compiles

# Fix issues automatically
bun run lint:fix
bun run format
```

## Resource Development

### Command Template Structure

```markdown
---
description: What this command does (shown in Claude Code)
allowed-tools: Read, Glob, Grep, WebSearch, Bash
---

# Command Name

Clear description of the command's purpose.

## Project Context

@.cm/stack.md
@.cm/rules.md

## Instructions

Step-by-step instructions for Claude Code to follow.

### Output Format

Expected output structure and formatting.
```

### Agent Template Structure

```markdown
---
name: cm-agent-name
description: Agent specialization and capabilities
tools: Read, Glob, Grep, WebSearch, Bash
---

You are a specialized AI agent that...

## Project Technology Stack

@.cm/stack.md

## Project Development Rules

@.cm/rules.md

## Your Mission

Clear definition of the agent's role and responsibilities.

## Process

Step-by-step process the agent should follow.

## Output Format

Expected output structure and formatting.
```

### Best Practices for Resources

- **Project awareness**: Always reference `@.cm/stack.md` and `@.cm/rules.md`
- **Clear instructions**: Write step-by-step guidance for Claude Code
- **Consistent formatting**: Follow established patterns
- **Tool specification**: Only request necessary tools in frontmatter
- **Error handling**: Include guidance for common failure scenarios

## Code Review Process

### What Reviewers Look For

- **Code quality**: TypeScript compliance, proper error handling
- **Functionality**: Does the code work as intended?
- **Testing**: Has the contributor tested their changes?
- **Documentation**: Are docs updated for user-facing changes?
- **Breaking changes**: Are they necessary and well-documented?

### Review Criteria

- ✅ **Passes linting and formatting checks**
- ✅ **Includes proper TypeScript types**
- ✅ **Has comprehensive error handling**
- ✅ **Works across supported platforms**
- ✅ **Follows project conventions**
- ✅ **Includes tests or test verification**
- ✅ **Updates relevant documentation**

## Release Process

### Versioning Strategy

- **Major (X.0.0)**: Breaking changes
- **Minor (0.X.0)**: New features, backwards compatible
- **Patch (0.0.X)**: Bug fixes, no breaking changes

### Version Bumping

```bash
# Update version in package.json
npm version patch  # or minor, major

# Update CHANGELOG.md with new version
# Create git tag and commit
git add .
git commit -m "chore: bump version to X.X.X"
git tag vX.X.X
git push origin main --tags
```

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **Pull Requests**: Code review and discussion
- **Discussions**: General questions and ideas

### Common Issues

- **Build errors**: Clear node_modules and reinstall dependencies
- **Import/export issues**: Check file extensions in imports
- **TypeScript errors**: Ensure proper typing throughout
- **Installation issues**: Test with `--local` flag first

### Issue Reporting

When reporting issues:

1. **Clear title**: Summarize the problem
2. **Environment details**: OS, Node.js version, Claude Code version
3. **Steps to reproduce**: Exact steps to trigger the issue
4. **Expected vs actual behavior**: What should happen vs what happens
5. **Relevant logs**: Error messages and stack traces

### Feature Requests

When requesting features:

1. **Use case**: Explain why this feature is needed
2. **Proposed solution**: How you envision it working
3. **Alternatives considered**: Other approaches you've thought about
4. **Implementation thoughts**: Technical considerations if any

## Recognition

Contributors are recognized in several ways:

- **Git commit attribution**: Proper author attribution
- **Release notes**: Major contributors mentioned in releases
- **Documentation**: Contributors section in README (for significant contributions)

## Code of Conduct

- **Be respectful**: Treat all contributors with respect
- **Be constructive**: Provide helpful, actionable feedback
- **Be patient**: Everyone is learning and contributing in their spare time
- **Be inclusive**: Welcome contributors of all skill levels

## Questions?

Don't hesitate to ask questions! You can:

- Open a GitHub issue with the `question` label
- Start a discussion in the repository
- Review existing issues and PRs for similar questions

Thank you for contributing to Context Monkey! Your contributions help make Claude Code more powerful for developers everywhere.
