# Context Monkey Development Setup

> **Generated**: 2025-09-09  
> **Version**: 0.6.0  
> **Repository**: context-monkey

Complete guide for setting up Context Monkey for development, testing, and contribution.

## Prerequisites

### System Requirements

#### Option 1: Node.js (traditional)
- **Node.js**: Version 16.0.0 or higher
- **npm**: Version 7.0.0 or higher (included with Node.js 16+)
- **Git**: For version control and repository management
- **Claude Code**: For testing installed extensions

#### Option 2: Bun (faster, recommended)
- **Bun**: Version 1.0.0 or higher
- **Git**: For version control and repository management  
- **Claude Code**: For testing installed extensions

### Verify Prerequisites

#### Node.js Setup
```bash
# Check Node.js version
node --version  # Should be >= 16.0.0

# Check npm version  
npm --version   # Should be >= 7.0.0

# Check Git installation
git --version

# Verify Claude Code is available
claude --version  # Optional but recommended for testing
```

#### Bun Setup  
```bash
# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Check Bun version
bun --version   # Should be >= 1.0.0

# Check Git installation
git --version

# Verify Claude Code is available  
claude --version  # Optional but recommended for testing
```

## Quick Start

### 1. Clone Repository
```bash
git clone https://github.com/richhaase/context-monkey.git
cd context-monkey
```

### 2. Install Dependencies

#### Using Node.js
```bash
npm install
```

#### Using Bun (faster)
```bash
bun install
```

### 3. Verify Installation

#### Using Node.js
```bash
# Test CLI help
node bin/context-monkey.js --help

# Test local installation
npx context-monkey install --local
```

#### Using Bun (faster)  
```bash
# Test CLI help
bun bin/context-monkey.js --help

# Test local installation
bunx context-monkey install --local

# Verify commands installed  
ls .claude/commands/
ls .claude/agents/
```

## Development Environment

### Project Structure
```
context-monkey/
├── bin/
│   └── context-monkey.js           # CLI entry point
├── lib/
│   └── commands/                   # Core command implementations
│       ├── install.js
│       ├── upgrade.js
│       └── uninstall.js
├── templates/
│   ├── commands/                   # Claude Code slash commands
│   └── agents/                     # AI subagent definitions
├── .cm/                        # Project context (generated)
│   ├── stack.md
│   └── rules.md
├── package.json                    # Project metadata
├── package-lock.json               # Dependency lock file
└── README.md                       # Project documentation
```

### Key Files to Understand

#### Entry Point (`bin/context-monkey.js`)
- CLI interface using Commander.js
- Routes commands to handlers in `lib/commands/`
- Handles global options and help

#### Command Implementations (`lib/commands/`)
- **install.js**: Core installation logic
- **upgrade.js**: Update existing installations  
- **uninstall.js**: Clean removal of extensions

#### Templates (`templates/`)
- Pre-written Claude Code commands and agents
- Static markdown files with embedded YAML metadata
- Project-aware via `@.cm/` file references

## Development Workflow

### Local Development
```bash
# Install dependencies
npm install

# Test CLI commands
node bin/context-monkey.js --help
node bin/context-monkey.js install
node bin/context-monkey.js upgrade
node bin/context-monkey.js uninstall

# Link for global testing
npm link
context-monkey --help
```

### Testing Changes

#### 1. Template Development
```bash
# Edit templates in templates/commands/ or templates/agents/
# Test by installing locally
node bin/context-monkey.js install

# Test the installed commands in Claude Code
# Example: /cm:stack-scan
```

#### 2. Core Logic Changes
```bash
# Modify files in lib/commands/
# Test installation/upgrade/uninstall flows
node bin/context-monkey.js install
node bin/context-monkey.js upgrade  
node bin/context-monkey.js uninstall
```

#### 3. CLI Interface Changes
```bash
# Modify bin/context-monkey.js
# Test help and argument parsing
node bin/context-monkey.js --help
node bin/context-monkey.js --version
```

### Manual Testing Checklist

#### Installation Testing
- [ ] Local installation (`install`)
- [ ] Global installation (`install --global`) 
- [ ] Installation with existing `.claude/` directory
- [ ] Installation with permission issues
- [ ] Installation in clean directory

#### Upgrade Testing  
- [ ] Local upgrade from previous version
- [ ] Global upgrade from previous version
- [ ] Upgrade with modified templates
- [ ] Upgrade with missing source files

#### Uninstall Testing
- [ ] Local uninstall (preserves `.cm/`)
- [ ] Global uninstall  
- [ ] Uninstall with partial installation
- [ ] Uninstall with modified files

#### Command Testing (in Claude Code)
- [ ] `/cm:stack-scan` generates accurate stack.md
- [ ] `/cm:explain-repo` analyzes repository structure
- [ ] `/cm:review-code` provides project-aware feedback
- [ ] `/cm:plan` creates detailed implementation plans
- [ ] `/cm:deep-dive` performs thorough code analysis
- [ ] Context files (`@.cm/stack.md`, `@.cm/rules.md`) load correctly

## Environment Setup

### Local Development
```bash
# Clone and setup
git clone https://github.com/richhaase/context-monkey.git
cd context-monkey
npm install

# Create test environment
mkdir test-project
cd test-project
npm init -y

# Test local installation
node ../bin/context-monkey.js install
```

### Global Development  
```bash
# Link for global access
npm link

# Test globally
cd /tmp
mkdir global-test
cd global-test
context-monkey install --global
```

### Testing with Different Projects
```bash
# Test with React project
npx create-react-app test-react
cd test-react
context-monkey install
# Test: /cm:stack-scan should detect React

# Test with Node.js project  
mkdir test-node
cd test-node
npm init -y
npm install express
context-monkey install
# Test: /cm:stack-scan should detect Node.js + Express
```

## Debugging

### Common Issues

#### Permission Errors
```bash
# Check directory permissions
ls -la ~/.claude/
ls -la .claude/

# Fix permissions if needed
chmod -R 755 ~/.claude/
chmod -R 755 .claude/
```

#### Template Not Found
```bash
# Verify template structure
ls templates/commands/
ls templates/agents/

# Check file contents
cat templates/commands/stack-scan.md
```

#### Installation Failures
```bash
# Enable verbose logging (modify code temporarily)
# Add console.log statements in lib/commands/install.js

# Check target directories exist
ls -la .claude/
ls -la ~/.claude/
```

### Debug Commands
```bash
# Show installation paths
node -e "console.log('Global:', require('os').homedir() + '/.claude')"
node -e "console.log('Local:', process.cwd() + '/.claude')"

# List installed files
find .claude/ -type f 2>/dev/null || echo "No local installation"
find ~/.claude/ -name "monkey_*" 2>/dev/null || echo "No global installation"
```

## Contributing

### Development Setup for Contributors
```bash
# Fork the repository on GitHub
# Clone your fork
git clone https://github.com/YOUR_USERNAME/context-monkey.git
cd context-monkey

# Add upstream remote
git remote add upstream https://github.com/richhaase/context-monkey.git

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
# ... development work ...

# Test thoroughly
node bin/context-monkey.js install
# Test all commands in Claude Code

# Commit and push
git add .
git commit -m "Add your feature description"
git push origin feature/your-feature-name

# Create pull request on GitHub
```

### Code Standards
- Use vanilla JavaScript (ES6+)
- Follow existing code style and patterns
- Add comments for complex logic
- Test all changes manually
- Update documentation when needed

### Template Guidelines
- Commands should reference `@.cm/stack.md` and `@.cm/rules.md`
- Include proper YAML frontmatter with metadata
- Write clear descriptions and usage examples
- Test with multiple project types

## Publishing (Maintainers Only)

### Release Process
```bash
# Ensure clean working directory
git status

# Update version
npm version patch  # or minor/major
# This creates a git tag automatically

# Push changes and tags
git push origin main
git push origin --tags

# GitHub Actions will automatically publish to NPM
```

### Manual Publishing (if needed)
```bash
# Build is not required (vanilla JavaScript)
# Ensure correct files in package.json "files" array

# Login to NPM
npm login

# Publish
npm publish
```

## Performance Testing

### Installation Speed
```bash
# Time local installation
time node bin/context-monkey.js install

# Time global installation  
time node bin/context-monkey.js install --global

# Time upgrade
time node bin/context-monkey.js upgrade
```

### Memory Usage
```bash
# Monitor memory during installation
/usr/bin/time -v node bin/context-monkey.js install
```

### File Size Analysis
```bash
# Check template sizes
du -sh templates/
find templates/ -name "*.md" -exec wc -c {} +

# Check total package size
npm pack
ls -lh context-monkey-*.tgz
rm context-monkey-*.tgz
```

## Troubleshooting

### Reset Development Environment
```bash
# Remove all installations
node bin/context-monkey.js uninstall
node bin/context-monkey.js uninstall --global

# Clean npm
rm -rf node_modules package-lock.json
npm install

# Verify clean state
ls .claude/ 2>/dev/null || echo "Local: Clean"
ls ~/.claude/monkey_* 2>/dev/null || echo "Global: Clean"
```

### Test Different Node.js Versions
```bash
# Using nvm (if installed)
nvm install 16
nvm use 16
npm install
node bin/context-monkey.js --help

nvm install 18  
nvm use 18
npm install
node bin/context-monkey.js --help
```

---

*This setup guide covers all aspects of Context Monkey development. For questions or issues, please check the [GitHub Issues](https://github.com/richhaase/context-monkey/issues) or create a new issue.*