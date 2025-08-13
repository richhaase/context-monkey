---
metadata:
  type: implementation-plan
  phase: 2
  topic: cli-interface-development
  status: ready_to_implement
  created: 2025-08-13
  updated: 2025-08-13
  current_agent: engineer

permissions:
  metadata: [engineer, build]
  build_results: [build]

dependencies:
  - phase: 1
    status: completed
    verification: NPM package foundation with CLI entry point and utility modules completed

build_results:
  files_changed: []
  findings: []
  deviations: []
---

# Phase 2 Implementation Plan: CLI Interface Development

## Overview

Build the command-line interface for installation management by enhancing the existing CLI foundation with comprehensive argument parsing, subcommand routing, help systems, and user-friendly messaging. This phase transforms the basic CLI entry point from Phase 1 into a production-ready interface supporting install, update, uninstall, status, and list commands.

## Technical Implementation Details

### Project Architecture Analysis
Based on the existing codebase:
- **Language**: Node.js with native modules (no external CLI framework dependencies)
- **Current CLI Foundation**: Enhanced `bin/context-monkey.js` with security validation and debug support
- **Utility Libraries**: `lib/utils.js` and `lib/paths.js` provide file system and path management
- **Architecture Pattern**: Modular CLI with dedicated modules for different concerns

### Key Technical Decisions
1. **Native Node.js CLI**: Continue using built-in argument parsing to maintain zero dependencies
2. **Modular Command Structure**: Create dedicated modules for each command type in `lib/`
3. **Enhanced Error Handling**: Build upon existing error handling with command-specific messaging
4. **Configuration System**: Add support for command-line options and configuration files

## Implementation Sequence

### Step 1: Enhanced Argument Parsing System
**Objective**: Extend the existing CLI to support complex command structures and options

**Current State**: Basic command validation and sanitization exists
**Target State**: Full argument parsing with options, flags, and subcommands

**Implementation**:

**lib/cli-parser.js** - Advanced argument parsing
```javascript
const { debug } = require('../bin/context-monkey');

/**
 * Parse command line arguments into structured format
 * @param {string[]} args - Raw command line arguments
 * @returns {Object} Parsed arguments with command, options, and flags
 */
function parseArguments(args) {
  const result = {
    command: null,
    options: {},
    flags: [],
    positional: []
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    
    if (arg.startsWith('--')) {
      // Long option (--option=value or --option value)
      if (arg.includes('=')) {
        const [key, value] = arg.slice(2).split('=', 2);
        result.options[key] = value || true;
      } else {
        const key = arg.slice(2);
        // Check if next arg is a value (not starting with -)
        if (i + 1 < args.length && !args[i + 1].startsWith('-')) {
          result.options[key] = args[++i];
        } else {
          result.options[key] = true;
        }
      }
    } else if (arg.startsWith('-') && arg.length > 1) {
      // Short flags (-h, -v, etc.)
      result.flags.push(arg);
    } else if (!result.command) {
      // First non-flag argument is the command
      result.command = arg;
    } else {
      // Additional positional arguments
      result.positional.push(arg);
    }
  }

  debug(`Parsed arguments: ${JSON.stringify(result)}`);
  return result;
}

/**
 * Validate parsed command structure
 * @param {Object} parsed - Parsed arguments from parseArguments
 * @returns {Object} Validation result with errors if any
 */
function validateArguments(parsed) {
  const validCommands = ['install', 'update', 'uninstall', 'status', 'list', 'help', 'version'];
  const errors = [];

  if (parsed.command && !validCommands.includes(parsed.command)) {
    errors.push(`Unknown command: ${parsed.command}`);
  }

  // Command-specific option validation
  if (parsed.command === 'install') {
    const validInstallOptions = ['global', 'project', 'commands', 'force', 'backup', 'dry-run'];
    for (const option in parsed.options) {
      if (!validInstallOptions.includes(option)) {
        errors.push(`Unknown option for install command: --${option}`);
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  parseArguments,
  validateArguments
};
```

### Step 2: Command Router System
**Objective**: Create a modular system for routing commands to appropriate handlers

**lib/command-router.js** - Command routing and dispatch
```javascript
const { debug } = require('../bin/context-monkey');

/**
 * Route parsed command to appropriate handler
 * @param {Object} parsed - Parsed command arguments
 * @returns {Promise<void>}
 */
async function routeCommand(parsed) {
  debug(`Routing command: ${parsed.command}`);

  switch (parsed.command) {
    case 'install':
      const { handleInstall } = require('./commands/install');
      await handleInstall(parsed.options, parsed.positional);
      break;
    
    case 'update':
      const { handleUpdate } = require('./commands/update');
      await handleUpdate(parsed.options, parsed.positional);
      break;
    
    case 'uninstall':
      const { handleUninstall } = require('./commands/uninstall');
      await handleUninstall(parsed.options, parsed.positional);
      break;
    
    case 'status':
      const { handleStatus } = require('./commands/status');
      await handleStatus(parsed.options, parsed.positional);
      break;
    
    case 'list':
      const { handleList } = require('./commands/list');
      await handleList(parsed.options, parsed.positional);
      break;
    
    case 'help':
    case undefined:
      const { showHelp } = require('../bin/context-monkey');
      showHelp();
      break;
    
    case 'version':
      const { showVersion } = require('../bin/context-monkey');
      showVersion();
      break;
    
    default:
      throw new Error(`Unhandled command: ${parsed.command}`);
  }
}

module.exports = {
  routeCommand
};
```

### Step 3: Command Implementation Stubs
**Objective**: Create placeholder implementations for all supported commands

**lib/commands/install.js** - Install command handler
```javascript
const { debug } = require('../../bin/context-monkey');

/**
 * Handle install command with options and arguments
 * @param {Object} options - Parsed command line options
 * @param {string[]} positional - Positional arguments
 */
async function handleInstall(options, positional) {
  debug('Install command handler called');
  debug(`Options: ${JSON.stringify(options)}`);
  debug(`Positional args: ${JSON.stringify(positional)}`);

  console.log('🚀 Context Monkey Installation');
  console.log('');

  // Display options that were parsed
  if (options.global) {
    console.log('📍 Target: Global installation (~/.claude/)');
  } else if (options.project) {
    console.log('📍 Target: Project installation (./.claude/)');
  } else {
    console.log('📍 Target: Auto-detect (will be implemented in Phase 3)');
  }

  if (options['dry-run']) {
    console.log('👁️  Mode: Dry run (preview only)');
  }

  if (options.force) {
    console.log('⚠️  Mode: Force overwrite enabled');
  }

  if (options.backup) {
    console.log('💾 Mode: Backup existing files');
  }

  if (options.commands) {
    console.log(`🎯 Scope: Specific commands - ${options.commands}`);
  }

  console.log('');
  console.log('❌ Full installation logic will be implemented in Phase 3');
  console.log('   This phase focuses on CLI interface development');
  console.log('');
  console.log('✅ CLI argument parsing and validation complete!');
}

module.exports = {
  handleInstall
};
```

**lib/commands/status.js** - Status command handler
```javascript
const { debug } = require('../../bin/context-monkey');
const { detectClaudeCode } = require('../paths');

/**
 * Handle status command - show installation status
 * @param {Object} options - Parsed command line options
 * @param {string[]} positional - Positional arguments
 */
async function handleStatus(options, positional) {
  debug('Status command handler called');

  console.log('📊 Context Monkey Status');
  console.log('');

  try {
    // Use existing path detection from Phase 1
    const claudeStatus = await detectClaudeCode();
    
    console.log('Claude Code Detection:');
    console.log(`  Global (~/.claude/): ${claudeStatus.global ? '✅ Found' : '❌ Not found'}`);
    console.log(`  Project (./.claude/): ${claudeStatus.project ? '✅ Found' : '❌ Not found'}`);
    console.log('');
    
    if (claudeStatus.global || claudeStatus.project) {
      console.log('📂 Installation Locations:');
      if (claudeStatus.global) {
        console.log(`  Global: ${claudeStatus.paths.global}`);
      }
      if (claudeStatus.project) {
        console.log(`  Project: ${claudeStatus.paths.project}`);
      }
      console.log('');
    }

    console.log('❌ Detailed status checking will be implemented in Phase 3');
    console.log('   This phase focuses on CLI interface development');
    console.log('');
    console.log('✅ Basic Claude Code detection working!');
    
  } catch (error) {
    console.error('❌ Error checking status:', error.message);
    debug(`Status check error: ${error.stack}`);
  }
}

module.exports = {
  handleStatus
};
```

**lib/commands/update.js**, **lib/commands/uninstall.js**, **lib/commands/list.js** - Other command stubs
```javascript
// Similar structure for each command with placeholder implementations
// showing that the CLI routing works but deferring core logic to Phase 3
```

### Step 4: Enhanced Help System
**Objective**: Provide comprehensive help for all commands and options

**lib/help-system.js** - Advanced help display
```javascript
/**
 * Show detailed help for specific commands
 * @param {string} command - Command to show help for
 */
function showCommandHelp(command) {
  const helpText = {
    install: `
Install Context Monkey commands and workflows

Usage:
  npx context-monkey install [options]

Options:
  --global, -g          Install to ~/.claude/ (personal)
  --project, -p         Install to .claude/ (project)
  --commands <list>     Install specific commands only (comma-separated)
  --force, -f           Overwrite existing files without prompting
  --backup, -b          Create backup before installation
  --dry-run            Show what would be installed without doing it

Examples:
  npx context-monkey install --global
  npx context-monkey install --project --backup
  npx context-monkey install --commands architect,engineer
  npx context-monkey install --dry-run
`,
    status: `
Show Context Monkey installation status

Usage:
  npx context-monkey status

Shows:
  - Claude Code installation detection
  - Context Monkey command locations
  - Installation health check
  - Configuration summary

Examples:
  npx context-monkey status
`,
    // Additional command help...
  };

  console.log(helpText[command] || 'No help available for this command');
}

module.exports = {
  showCommandHelp
};
```

### Step 5: Update Main CLI Entry Point
**Objective**: Integrate new CLI system with existing entry point

**Update bin/context-monkey.js**:
```javascript
// Add imports for new CLI system
const { parseArguments, validateArguments } = require('../lib/cli-parser');
const { routeCommand } = require('../lib/command-router');

// Update main() function to use new parser:
async function main() {
  const args = process.argv.slice(2);
  
  debug(`Arguments received: ${JSON.stringify(args)}`);
  
  // Handle no arguments
  if (args.length === 0) {
    debug('No arguments provided, showing help');
    showHelp();
    return;
  }

  // Parse arguments using new system
  const parsed = parseArguments(args);
  
  // Handle debug flag
  if (parsed.options.debug) {
    debugMode = true;
    debug('Debug mode enabled');
  }

  try {
    // Validate arguments
    const validation = validateArguments(parsed);
    if (!validation.valid) {
      throw new Error(validation.errors.join(', '));
    }

    // Route to appropriate command handler
    await routeCommand(parsed);
    
  } catch (error) {
    console.error(`Error: ${error.message}`);
    console.error('');
    console.error('Use "npx context-monkey help" to see available commands');
    debug(`Full error: ${error.stack}`);
    process.exit(1);
  }
}
```

## File Structure and Changes

### Files to Create:
- `lib/cli-parser.js` - Advanced argument parsing system
- `lib/command-router.js` - Command routing and dispatch
- `lib/help-system.js` - Enhanced help system
- `lib/commands/install.js` - Install command handler stub
- `lib/commands/update.js` - Update command handler stub  
- `lib/commands/uninstall.js` - Uninstall command handler stub
- `lib/commands/status.js` - Status command handler stub
- `lib/commands/list.js` - List command handler stub

### Files to Modify:
- `bin/context-monkey.js` - Integrate new CLI system with existing security features

### Directory Structure:
```
lib/
├── cli-parser.js           # Argument parsing
├── command-router.js       # Command routing
├── help-system.js         # Help system
├── utils.js               # Existing utilities (unchanged)
├── paths.js               # Existing path detection (unchanged)
└── commands/              # Command handlers
    ├── install.js
    ├── update.js
    ├── uninstall.js
    ├── status.js
    └── list.js
```

## Testing Strategy

### CLI Interface Testing:
```bash
# Test argument parsing
npx context-monkey install --global --backup
npx context-monkey status
npx context-monkey help install
npx context-monkey --version --debug

# Test error handling
npx context-monkey invalid-command
npx context-monkey install --invalid-option
npx context-monkey install --commands --global  # Missing value

# Test help system
npx context-monkey help
npx context-monkey help install
npx context-monkey install --help
```

### Integration Testing:
- Verify all command stubs are accessible
- Test option parsing with various combinations
- Validate error messages are user-friendly
- Ensure debug mode works across all commands

## Success Criteria

### Functional Requirements:
- ✅ All planned subcommands are accessible and route correctly
- ✅ CLI provides comprehensive help for each command
- ✅ Command-line argument parsing handles complex option combinations
- ✅ Error handling provides specific, actionable messages
- ✅ Debug mode works for troubleshooting CLI behavior

### Technical Requirements:
- ✅ Modular architecture allows easy extension of commands
- ✅ Existing Phase 1 security features are preserved and enhanced
- ✅ Zero external dependencies maintained (native Node.js only)
- ✅ Command validation prevents invalid operations
- ✅ Argument parsing is robust and handles edge cases

### User Experience Requirements:
- ✅ Help system follows CLI best practices and conventions
- ✅ Error messages guide users toward resolution
- ✅ Command interface is intuitive and discoverable
- ✅ Option names and flags follow standard CLI conventions

## Integration Points

### Phase 1 Integration:
- **Preserve Security**: Maintain existing input validation and sanitization
- **Extend CLI Foundation**: Build upon existing argument parsing framework
- **Leverage Utilities**: Use existing `lib/utils.js` and `lib/paths.js` modules
- **Maintain Error Handling**: Enhance existing global error handlers

### Phase 3 Preparation:
- **Command Handlers**: Provide clear interfaces for implementation logic
- **Option Processing**: Parse and validate all installation options
- **Path Management**: Integrate with existing Claude Code detection
- **User Feedback**: Establish patterns for progress reporting and user interaction

### Node.js Ecosystem Integration:
- **NPM Standards**: Follow Node.js CLI conventions and best practices
- **Process Management**: Proper exit codes and signal handling
- **Cross-platform**: Path handling and file operations work on all platforms
- **Performance**: Efficient argument parsing suitable for CLI usage

## Phase 2 Completion Criteria

**CLI Interface Complete**:
- [x] Advanced argument parsing with options and flags
- [x] Modular command routing system
- [x] Comprehensive help system for all commands
- [x] Command handler stubs for all planned operations
- [x] Enhanced error handling with specific messaging
- [x] Integration with existing security and debug features

**Architecture Foundation**:
- [x] Modular command structure ready for Phase 3 implementation
- [x] Option parsing handles all planned installation scenarios
- [x] Help system provides guidance for all use cases
- [x] Error handling covers edge cases and user mistakes

**User Experience**:
- [x] Intuitive command structure following CLI best practices
- [x] Clear help documentation for all commands and options
- [x] Meaningful error messages that guide user resolution
- [x] Debug support for troubleshooting CLI behavior

Phase 2 establishes a production-ready CLI interface that makes the installation logic implementation in Phase 3 straightforward, while providing immediate value through improved user interaction and command discoverability.