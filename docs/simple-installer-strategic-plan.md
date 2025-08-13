---
metadata:
  type: strategic-plan
  topic: simple-installer
  created: 2025-08-13
  updated: 2025-08-13
  status: active

permissions:
  metadata: [architect]
  phases: [architect, engineer, build]

phases:
  - id: 1
    name: Simple Context-Monkey Installer
    status: ready_to_implement
    implementation_plan: docs/phase-1-simple-installer-implementation-plan.md
    dependencies: []
---

# Strategic Plan: Simple Context-Monkey Installer

## Executive Summary

Create a straightforward installer that prompts users for deployment location, shows what will be copied, asks for confirmation, then deploys the ContextMonkey workflow files and provides helpful next steps.

## Implementation Approach

### User Experience Flow
1. **Prompt for location** (default: current directory)
2. **Show deployment plan**:
   - `ContextMonkey/commands/*` → `{location}/.claude/commands/`
   - `ContextMonkey/shared/*` → `{location}/.monkey/shared/`
3. **Ask for approval** (default: yes)
4. **Deploy files** if approved
5. **Show brief help message** about using the commands

### Example Session
```bash
$ npx context-monkey install

Context-Monkey Installer
========================

Where would you like to deploy Context-Monkey? [.]: 
/Users/username/my-project

This will:
• Copy commands to: /Users/username/my-project/.claude/commands/
• Copy workflows to: /Users/username/my-project/.monkey/shared/

Proceed? [Y/n]: 

✓ Copied 9 commands to .claude/commands/
✓ Copied 5 workflow files to .monkey/shared/

Context-Monkey installed successfully!

Quick Start:
• Try: /architect "improve error handling"
• Try: /engineer docs/my-plan.md
• See all commands: /status

For more help, see: https://github.com/context-monkey/context-monkey
```

## Technical Implementation

**Core Logic**:
```javascript
// 1. Prompt for location (readline)
const targetDir = await prompt('Where would you like to deploy Context-Monkey?', '.');

// 2. Show what will happen
console.log('This will:');
console.log(`• Copy commands to: ${targetDir}/.claude/commands/`);
console.log(`• Copy workflows to: ${targetDir}/.monkey/shared/`);

// 3. Ask for approval  
const proceed = await confirm('Proceed?', true);

// 4. Copy files if approved
if (proceed) {
  copyDirectory('ContextMonkey/commands', `${targetDir}/.claude/commands`);
  copyDirectory('ContextMonkey/shared', `${targetDir}/.monkey/shared`);
  showSuccessMessage();
}
```

**File Structure**:
```
bin/context-monkey.js         # Main CLI entry point
lib/
├── installer.js             # Core installation logic  
├── prompts.js              # User interaction (readline)
└── files.js                # Directory copying utilities
```

**CLI Commands**:
- `npx context-monkey install` - Interactive installer
- `npx context-monkey --help` - Show usage

## Success Criteria

- Prompts user for deployment location with sensible default
- Shows clear deployment plan before proceeding  
- Copies files to correct locations following the established pattern
- Provides helpful post-install guidance
- Takes 2-3 minutes to implement, not days
- Works reliably for the intended use case

This focuses on the essential user experience while leveraging the proven file structure from this project.