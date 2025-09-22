# Development Setup

Complete guide for setting up the Context Monkey development environment.

## Prerequisites

### Required Tools

- **Node.js** 16.0.0 or higher
- **Bun** (recommended) or **npm** for package management
- **TypeScript** 5.3+ (installed via dev dependencies)
- **Git** for version control

### Recommended Tools

- **Claude Code CLI** - For testing commands and agents
- **VS Code** or similar editor with TypeScript support
- **terminal-notifier** (macOS only) - For notification hooks testing

### Platform Support

- **macOS** - Full support including notifications
- **Linux** - Core functionality supported
- **Windows** - Core functionality supported

## Installation

### 1. Clone Repository

```bash
git clone https://github.com/richhaase/context-monkey.git
cd context-monkey
```

### 2. Install Dependencies

```bash
# Using Bun (recommended)
bun install

# Using npm (alternative)
npm install
```

### 3. Build Project

```bash
# Build once
bun run build

# Watch mode for development
bun run dev
```

### 4. Verify Installation

```bash
# Check version
node dist/bin/context-monkey.js --version

# Test installation
node dist/bin/context-monkey.js install
```

## Development Workflow

### Build Commands

| Command         | Purpose                          |
| --------------- | -------------------------------- |
| `bun run build` | Compile TypeScript to JavaScript |
| `bun run dev`   | Watch mode compilation           |
| `bun run clean` | Remove build artifacts           |

### Code Quality Commands

| Command                | Purpose                   |
| ---------------------- | ------------------------- |
| `bun run lint`         | Run ESLint on source code |
| `bun run lint:fix`     | Auto-fix ESLint issues    |
| `bun run format`       | Format code with Prettier |
| `bun run format:check` | Check code formatting     |

### Testing Commands

| Command              | Purpose            |
| -------------------- | ------------------ |
| `bun test`           | Run test suite     |
| `bun run test:watch` | Watch mode testing |

## Project Structure

```
context-monkey/
├── src/                     # TypeScript source code
│   ├── bin/                # CLI entry points
│   ├── commands/           # Installation commands
│   ├── config/             # Configuration management
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── resources/              # Command and agent templates
│   ├── commands/           # Slash commands for Claude Code
│   └── agents/             # AI subagent definitions
├── dist/                   # Compiled JavaScript (generated)
├── tests/                  # Test files (if any)
└── node_modules/           # Dependencies
```

## Configuration Files

### TypeScript Configuration

- **`tsconfig.json`** - TypeScript compiler settings
  - Target: ES2022
  - Module: ES2022
  - Output: `dist/` directory
  - Source maps enabled for debugging

### Code Quality

- **`eslint.config.js`** - ESLint configuration
  - TypeScript support
  - Prettier integration
  - Node.js environment rules
- **`.prettierrc`** - Code formatting rules
- **`lint-staged` config** - Pre-commit hooks in `package.json`

### Git Hooks

- **Husky** - Git hooks management
- **Pre-commit**: Runs linting and formatting
- **Pre-push**: Runs tests (when available)

## Development Guidelines

### Code Standards

- **TypeScript**: All new code must be TypeScript
- **ES Modules**: Use `import/export`, not `require()`
- **Error Handling**: Use proper error types and handling
- **File Naming**: kebab-case for files, PascalCase for types

### Resource Development

- **Commands**: Use `.md` files with YAML frontmatter
- **Agents**: Follow `cm-*.md` naming pattern
- **Testing**: Test commands locally before committing
- **Documentation**: Update docs for new commands/agents

### Git Workflow

```bash
# Create feature branch
git checkout -b feature/new-command

# Make changes and commit
git add .
git commit -m "feat: add new command for X"

# Push and create PR
git push origin feature/new-command
```

## Testing Your Changes

### Local Testing

1. **Build the project**:

   ```bash
   bun run build
   ```

2. **Install for testing**:

```bash
node dist/bin/context-monkey.js install
```

3. **Test in Claude Code**:

   ```bash
   claude
   /cm:stack-scan  # Verify installation
   ```

4. **Test specific commands**:
   ```bash
   /cm:stack-scan  # Test your changes
   ```

### Cleanup After Testing

```bash
# Remove installation
node dist/bin/context-monkey.js uninstall
```

## Debugging

### Common Issues

**Build Errors**:

```bash
# Clear node_modules and reinstall
rm -rf node_modules dist
bun install
bun run build
```

**Import/Export Issues**:

- Ensure all imports use `.js` extensions (even for `.ts` files)
- Check `tsconfig.json` module resolution settings
- Use `import.meta.dirname` instead of `__dirname`

**File Path Issues**:

- Use `path.join()` for cross-platform compatibility
- Test on different operating systems if possible
- Check file permissions in target directories

### Debug Mode

```bash
# Enable verbose logging (if implemented)
DEBUG=1 node dist/bin/context-monkey.js install

# Check file operations
node -e "console.log(require('os').homedir())"
```

## Adding New Features

### New Slash Command

1. Create `resources/commands/new-command.md`
2. Add YAML frontmatter with metadata
3. Write command instructions in Markdown
4. Test installation and functionality

### New Subagent

1. Create `resources/agents/cm-new-agent.md`
2. Define agent capabilities and tools
3. Write agent prompt and behavior
4. Test agent integration with commands

### New CLI Command

1. Add command handler in `src/commands/`
2. Register in `src/bin/context-monkey.ts`
3. Add TypeScript types in `src/types/`
4. Update help text and documentation

## Release Process

### Version Bumping

```bash
# Update package.json version
npm version patch  # or minor, major

# Build and test
bun run build
bun test

# Commit and tag
git add .
git commit -m "chore: bump version to X.X.X"
git tag vX.X.X
```

### Publishing

```bash
# Clean build
bun run clean
bun run build

# Publish (if configured)
npm publish
```

## Environment Variables

Currently Context Monkey doesn't use environment variables, but if needed:

| Variable          | Purpose                   | Default    |
| ----------------- | ------------------------- | ---------- |
| `DEBUG`           | Enable debug logging      | `false`    |
| `CM_INSTALL_PATH` | Override install location | OS default |

## Troubleshooting

### Build Issues

- Check Node.js version compatibility
- Clear `node_modules` and reinstall dependencies
- Verify TypeScript configuration

### Installation Issues

- Check Claude Code directory permissions
- Verify target directory exists
- Capture any installer prompts or messages when debugging issues

### Agent/Command Issues

- Validate YAML frontmatter syntax
- Check Markdown formatting
- Test command registration in Claude Code

For additional support, check the [issues page](https://github.com/richhaase/context-monkey/issues) or create a new issue with detailed information about your problem.
