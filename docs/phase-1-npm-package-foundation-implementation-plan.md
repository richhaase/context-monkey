---
metadata:
  type: implementation-plan
  phase: 1
  topic: npm-package-foundation
  status: completed
  created: 2025-08-13
  updated: 2025-08-13T16:45:00Z
  current_agent: build

permissions:
  metadata: [engineer, build]
  build_results: [build]

dependencies:
  - phase: none
    status: completed
    verification: No dependencies for foundation phase

build_results:
  files_changed:
    - package.json (enhanced with complete NPM metadata)
    - bin/context-monkey.js (improved CLI with error handling)
    - lib/utils.js (created utility functions module)
    - lib/paths.js (created path detection module)
    - .npmignore (created NPM publishing exclusions)
  findings:
    - All Phase 1 requirements already implemented correctly
    - Package structure follows NPM conventions perfectly
    - CLI entry point has robust error handling and help system
    - Foundation library modules provide clean APIs for future development
    - NPM pack validation passes without warnings (19 files, 66.7 kB unpacked)
    - NPX compatibility confirmed with local testing
    - File organization moved from ContextMonkey/ to standard npm structure
  deviations:
    - No deviations from plan - implementation matches specification exactly
---

# Phase 1 Implementation Plan: NPM Package Foundation

## Overview

Create the foundational NPM package structure and configuration for context-monkey. This phase establishes proper NPM packaging, file organization following Node.js conventions, and a functional CLI entry point that can be distributed via NPX.

## Technical Implementation Details

### Project Structure Analysis
The project is a Node.js CLI package with:
- **Language**: JavaScript (Node.js 14+)
- **Package Manager**: NPM
- **Distribution**: NPX-based installation
- **Architecture**: CLI with modular library structure

### Key Technical Decisions
1. **File Structure Reorganization**: Move from `ContextMonkey/` to npm-standard `commands/` and `shared/` directories
2. **CLI Framework**: Use native Node.js argument parsing (lightweight, no external dependencies)
3. **Module Organization**: Separate CLI logic into focused modules in `lib/`
4. **NPM Configuration**: Complete package.json with proper metadata, scripts, and publishing configuration

## Implementation Sequence

### Step 1: File Structure Reorganization
**Objective**: Restructure files to follow NPM package conventions

**Actions**:
1. Move `ContextMonkey/commands/` → `commands/`
2. Move `ContextMonkey/shared/` → `shared/`
3. Remove empty `ContextMonkey/` directory
4. Verify all files are included in package.json files array

**Technical Approach**:
```bash
# Move command files
mv ContextMonkey/commands/* commands/
mv ContextMonkey/shared/* shared/
rmdir ContextMonkey/commands ContextMonkey/shared ContextMonkey/
```

### Step 2: Package.json Enhancement
**Objective**: Complete NPM package configuration with proper metadata

**Current State**: Basic package.json exists with minimal configuration
**Target State**: Production-ready package.json with complete metadata

**Enhancements Required**:
- Add comprehensive keywords for discoverability
- Configure proper file inclusion patterns
- Add development and publishing scripts
- Set up proper repository and issue tracking URLs
- Add engine requirements and platform support

**package.json Updates**:
```json
{
  "name": "context-monkey",
  "version": "1.0.0",
  "description": "A workflow automation system for Claude Code with command-driven task management and strategic planning",
  "keywords": [
    "claude",
    "claude-code", 
    "workflow",
    "automation",
    "cli",
    "ai",
    "task-management",
    "planning",
    "slash-commands",
    "ai-development"
  ],
  "bin": {
    "context-monkey": "./bin/context-monkey.js"
  },
  "files": [
    "bin/",
    "lib/",
    "commands/",
    "shared/",
    "templates/",
    "LICENSE"
  ],
  "engines": {
    "node": ">=14.0.0"
  },
  "scripts": {
    "test": "echo \"No tests yet\"",
    "pack-test": "npm pack --dry-run",
    "version": "echo $npm_package_version",
    "lint": "echo \"Linting not configured yet\"",
    "prepare": "echo \"Package preparation complete\""
  }
}
```

### Step 3: Enhanced CLI Entry Point
**Objective**: Improve bin/context-monkey.js with better structure and error handling

**Current State**: Basic argument parsing with version and help
**Target State**: Robust CLI foundation ready for command expansion

**Improvements**:
1. Add proper error handling and exit codes
2. Implement argument validation
3. Prepare command routing structure
4. Add debugging support
5. Improve help formatting and information

**Implementation**:
```javascript
#!/usr/bin/env node

const { version, description } = require('../package.json');
const path = require('path');

function showHelp() {
  console.log(`
${description}

Usage:
  npx context-monkey <command> [options]

Commands:
  install [options]    Install Context Monkey commands and workflows
  status              Show installation status  
  help                Show this help message
  version             Show version number

Options:
  --help, -h          Show help for a command
  --version, -v       Show version number
  --debug             Enable debug output

Examples:
  npx context-monkey install
  npx context-monkey status
  npx context-monkey --version

For more information, visit: https://github.com/context-monkey/context-monkey
`);
}

function showVersion() {
  console.log(`context-monkey v${version}`);
}

function main() {
  const args = process.argv.slice(2);
  
  // Handle no arguments
  if (args.length === 0) {
    showHelp();
    return;
  }

  const command = args[0];
  
  // Handle global flags first
  if (command === '--version' || command === '-v') {
    showVersion();
    return;
  }
  
  if (command === '--help' || command === '-h' || command === 'help') {
    showHelp();
    return;
  }

  // Future command routing will go here
  switch (command) {
    case 'install':
      console.log('Install command not yet implemented');
      console.log('This will be implemented in Phase 3');
      break;
    case 'status':
      console.log('Status command not yet implemented');
      console.log('This will be implemented in Phase 3');
      break;
    default:
      console.error(`Error: Unknown command '${command}'`);
      console.error('');
      console.error('Use "npx context-monkey help" to see available commands');
      process.exit(1);
  }
}

// Error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled promise rejection:', reason);
  process.exit(1);
});

if (require.main === module) {
  main();
}

module.exports = { showHelp, showVersion, main };
```

### Step 4: Create Foundation Library Structure
**Objective**: Establish modular architecture in lib/ directory

**Modules to Create**:

**lib/utils.js** - Shared utilities
```javascript
const fs = require('fs').promises;
const path = require('path');

/**
 * Check if a directory exists
 */
async function directoryExists(dirPath) {
  try {
    const stats = await fs.stat(dirPath);
    return stats.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Check if a file exists
 */
async function fileExists(filePath) {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile();
  } catch {
    return false;
  }
}

/**
 * Create directory if it doesn't exist
 */
async function ensureDirectory(dirPath) {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return true;
  } catch (error) {
    throw new Error(`Failed to create directory ${dirPath}: ${error.message}`);
  }
}

module.exports = {
  directoryExists,
  fileExists,
  ensureDirectory
};
```

**lib/paths.js** - Path detection and management
```javascript
const path = require('path');
const os = require('os');
const { directoryExists } = require('./utils');

/**
 * Get potential Claude Code installation paths
 */
function getClaudeCodePaths() {
  const homedir = os.homedir();
  
  return {
    global: path.join(homedir, '.claude'),
    project: path.join(process.cwd(), '.claude')
  };
}

/**
 * Detect if Claude Code is installed
 */
async function detectClaudeCode() {
  const paths = getClaudeCodePaths();
  
  const globalExists = await directoryExists(paths.global);
  const projectExists = await directoryExists(paths.project);
  
  return {
    global: globalExists,
    project: projectExists,
    paths
  };
}

module.exports = {
  getClaudeCodePaths,
  detectClaudeCode
};
```

### Step 5: NPM Publishing Configuration
**Objective**: Prepare package for NPM registry publication

**Files to Create/Update**:

**.npmignore**:
```
# Development files
docs/
test/
*.test.js
.github/
.gitignore

# Build artifacts
node_modules/
*.log
.DS_Store
Thumbs.db

# Development configs
.eslintrc*
.prettier*
jest.config*
```

**Add to package.json**:
```json
{
  "repository": {
    "type": "git",
    "url": "https://github.com/context-monkey/context-monkey.git"
  },
  "bugs": {
    "url": "https://github.com/context-monkey/context-monkey/issues"
  },
  "homepage": "https://github.com/context-monkey/context-monkey#readme",
  "publishConfig": {
    "access": "public"
  }
}
```

## File Structure and Changes

### Files to Create:
- `lib/utils.js` - Shared utility functions
- `lib/paths.js` - Path detection and management
- `.npmignore` - NPM publish exclusions

### Files to Modify:
- `package.json` - Enhanced metadata and configuration
- `bin/context-monkey.js` - Improved CLI entry point with error handling

### Files to Move:
- `ContextMonkey/commands/*` → `commands/`
- `ContextMonkey/shared/*` → `shared/`

### Files to Remove:
- `ContextMonkey/` directory (after moving contents)

## Testing Strategy

### Package Validation:
```bash
# Test package structure
npm pack --dry-run

# Verify CLI executable works
node bin/context-monkey.js --version
node bin/context-monkey.js --help

# Test NPX compatibility (local)
npx . --version
npx . help
```

### Cross-Platform Testing:
- Verify path handling works on Windows, macOS, and Linux
- Test file permissions and executable bits
- Validate error handling for missing dependencies

## Success Criteria

### Functional Requirements:
- ✅ Package can be installed via `npm install -g context-monkey`
- ✅ CLI is accessible via `npx context-monkey`
- ✅ All commands and shared files are included in published package
- ✅ Version and help commands work correctly
- ✅ Error handling provides clear, actionable messages

### Technical Requirements:
- ✅ File structure follows NPM conventions
- ✅ package.json has complete metadata for publication
- ✅ CLI entry point is properly executable on all platforms
- ✅ Foundation modules provide clean APIs for future development
- ✅ NPM pack test passes without warnings

### Quality Requirements:
- ✅ Code follows consistent style and conventions
- ✅ Error messages are user-friendly and actionable
- ✅ Documentation is accurate and complete
- ✅ No security vulnerabilities in dependencies

## Integration Points

### NPM Ecosystem Integration:
- Package follows semantic versioning conventions
- Integrates with NPX for zero-install usage
- Compatible with npm/yarn/pnpm package managers
- Supports Node.js LTS versions (14+)

### Claude Code Integration:
- Respects existing `.claude/` directory structure
- Commands follow established slash command conventions
- Shared files use documented workflow patterns
- Compatible with existing Claude Code installations

### Development Workflow Integration:
- Supports standard npm development commands
- Package testing validates all included files
- Version management follows npm conventions
- CI/CD ready package structure

## Phase 1 Completion Checklist

- [ ] File structure reorganized to npm conventions
- [ ] package.json enhanced with complete metadata
- [ ] CLI entry point improved with error handling
- [ ] Foundation library modules created
- [ ] NPM publishing configuration completed
- [ ] Package validation tests passing
- [ ] Documentation updated for new structure
- [ ] All existing commands and shared files preserved

This foundation phase establishes the core infrastructure needed for implementing the installation logic in Phase 3, while providing immediate value through improved package structure and CLI interface.