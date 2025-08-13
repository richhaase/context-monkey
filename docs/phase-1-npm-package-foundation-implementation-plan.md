---
metadata:
  type: implementation-plan
  phase: 1
  topic: npm-package-foundation
  status: ready_to_implement
  created: 2025-08-13
  updated: 2025-08-13
  current_agent: engineer

permissions:
  metadata: [engineer, build]
  build_results: [build]

dependencies: []

build_results:
  files_changed: []
  findings: []
  deviations: []
---

# Phase 1 Implementation Plan: NPM Package Foundation

## Overview
Transform the context-monkey workflow system from a collection of markdown files into a proper NPM package that can be distributed via NPX. This phase creates the foundational package structure, configuration, and basic CLI entry point needed for NPM distribution.

## Technical Implementation Details

### Package Configuration Strategy
Create a comprehensive `package.json` following NPM conventions for CLI packages:
- Set up proper entry points for CLI execution via NPX
- Configure file inclusion/exclusion for package distribution  
- Establish metadata for discoverability (keywords, description, author)
- Define Node.js version requirements and dependencies
- Configure bin field for CLI executable access

### File Structure Reorganization
Restructure project to follow NPM package conventions:
- Move `cm-cmds/` → `commands/` for clarity and convention
- Move `cm-shared/` → `shared/` for consistency
- Create `bin/` directory for CLI executable
- Create `lib/` directory for future JavaScript modules
- Establish `templates/` for configuration templates
- Set up proper `.npmignore` for selective file publishing

### CLI Entry Point Development
Create a minimal but functional CLI entry point:
- Set up Node.js shebang and executable permissions
- Implement basic command parsing structure
- Add version and help command support
- Establish foundation for future command expansion
- Ensure proper error handling and user messaging

## Implementation Sequence

### Step 1: Create Package Configuration
**File**: `package.json`
- Set package name to "context-monkey" (check availability)
- Configure CLI binary access via bin field
- Set up proper file inclusion patterns
- Define Node.js 14+ requirement for broad compatibility
- Add essential NPM metadata (description, keywords, license, repository)

### Step 2: Reorganize File Structure
**Actions**:
- Rename `cm-cmds/` to `commands/` directory
- Rename `cm-shared/` to `shared/` directory  
- Create `bin/` directory structure
- Create `lib/` directory for future modules
- Create `.npmignore` file to control package contents
- Update any internal file references in command files

### Step 3: Create CLI Entry Point
**File**: `bin/context-monkey.js`
- Implement Node.js executable with proper shebang
- Add basic command line argument parsing
- Support `--version` and `--help` flags
- Create placeholder for future command routing
- Ensure proper exit codes and error handling

### Step 4: Configure NPM Publishing
**Files**: `.npmignore`, `package.json` scripts
- Define which files to include/exclude from package
- Set up version management scripts
- Configure package validation commands
- Test local package installation flow

### Step 5: Validate Package Structure
**Actions**:
- Test `npm pack` to verify package contents
- Validate `npx context-monkey` execution works
- Confirm file structure matches NPM conventions
- Verify all commands and shared files are properly included

## File Structure and Changes

### New Directory Structure
```
context-monkey/
├── package.json              # NPM package configuration
├── .npmignore               # NPM publish exclusions  
├── bin/
│   └── context-monkey.js     # CLI entry point
├── lib/                      # Future JavaScript modules
├── commands/                 # Renamed from cm-cmds/
│   ├── architect.md
│   ├── brainstorm.md
│   ├── build.md
│   ├── engineer.md
│   ├── review.md
│   ├── workflow-status.md
│   ├── clarify.md
│   └── escalate.md
├── shared/                   # Renamed from cm-shared/
│   ├── workflow-state-management.md
│   ├── workflow-permissions.md
│   ├── workflow-validation.md
│   ├── project-analysis-guide.md
│   └── workflow-detection.md
├── templates/                # Future configuration templates
└── docs/                     # Keep existing docs
    └── npx-deployment-strategic-plan.md
```

### Files to Create
- `package.json` - NPM package configuration
- `bin/context-monkey.js` - CLI entry point executable
- `.npmignore` - Package publishing exclusions
- `lib/` directory - Future module location

### Files to Rename/Move
- `cm-cmds/` → `commands/`
- `cm-shared/` → `shared/`

### Files to Update
- Any internal references to old directory paths in command files
- Documentation references to old file structure

## Testing Strategy

### Package Validation Testing
- Verify `npm pack` creates expected package contents
- Test package installation with `npm install -g ./` locally
- Confirm `npx context-monkey` execution works from package
- Validate all expected files are included in package

### CLI Entry Point Testing  
- Test `--version` flag displays correct version
- Test `--help` flag displays usage information
- Verify executable permissions and shebang functionality
- Test error handling for invalid arguments

### File Structure Validation
- Confirm all command files are accessible in new structure
- Verify shared files are properly located
- Test that no essential files are excluded by `.npmignore`
- Validate directory structure follows NPM conventions

## Success Criteria

### Package Publishing Readiness
- `npm pack` generates a complete, installable package
- Package can be installed locally via `npm install -g ./`
- All command and shared files are included in package distribution
- Package metadata is complete and follows NPM conventions

### CLI Functionality
- `npx context-monkey --version` displays version information
- `npx context-monkey --help` displays usage instructions
- CLI executable has proper permissions and runs without errors
- Error messages are clear and helpful for invalid usage

### File Structure Compliance
- Directory structure follows standard NPM package layout
- File naming and organization is clear and logical
- No unnecessary files are included in package distribution
- Documentation accurately reflects new file structure

## Integration Points

### NPM Ecosystem Integration
- Package name is unique and available on NPM registry
- Follows semantic versioning conventions for future updates
- Uses standard NPM fields and metadata structure
- Compatible with standard Node.js package management tools

### Claude Code Workflow Integration  
- Command files maintain compatibility with Claude Code slash command system
- Shared files remain accessible for workflow state management
- File references in commands updated to reflect new structure
- Future CLI will install to proper Claude Code directories

### Development Workflow Integration
- Package structure supports future development of JavaScript modules
- CLI entry point provides foundation for command expansion
- File organization enables clear separation of concerns
- Documentation structure supports future contributor onboarding

## Technical Considerations

### Node.js Version Compatibility
- Target Node.js 14+ for broad compatibility
- Use standard library features available in Node 14
- Avoid cutting-edge JavaScript features requiring newer versions
- Test compatibility across supported Node.js versions

### Package Size Optimization
- Use `.npmignore` to exclude development-only files
- Minimize package size while including all essential files
- Exclude git-specific files and directories from package
- Consider future binary distribution for better performance

### Cross-Platform Compatibility
- Ensure shebang and executable permissions work on Unix-like systems
- Plan for Windows compatibility in CLI implementation
- Use cross-platform path handling in future JavaScript modules
- Test package installation on multiple operating systems