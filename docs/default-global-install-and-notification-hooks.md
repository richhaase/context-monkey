# Context Monkey Refactor: Default Global Install + Notification Hooks

## Overview

Refactor Context Monkey to install globally by default and include Claude Code notification hooks installation as part of the setup process.

## Goals

1. **Change Default Behavior**: Install to `~/.claude/` instead of `./.claude/` by default
2. **Add Hooks Installation**: Prompt users to install notification hooks during setup
3. **Cross-Platform Awareness**: Skip hooks on non-macOS systems with appropriate messaging
4. **Safe Merging**: Intelligently merge with existing `settings.json` configurations

## Implementation Plan

### Phase 1: Core Installation Changes

#### 1.1 Modify Default Installation Target
- **File**: `lib/commands/install.js`
- **Change**: Flip default for `global` option from `false` to `true`
- **CLI Impact**: 
  - `npx context-monkey install` → installs globally
  - `npx context-monkey install --local` → installs locally

#### 1.2 Update CLI Argument Parsing
- **File**: `bin/context-monkey.js`
- **Change**: Update Commander.js options
- **New Options**:
  - `--local` flag for local installation
  - Remove or deprecate `--global` flag (now default)

#### 1.3 Update Help Text and Messaging
- Update console output messages to reflect global-first approach
- Update CLI help descriptions
- Update README.md examples

### Phase 2: Hooks Installation System

#### 2.1 Platform Detection
- **Location**: New utility function in `lib/utils/platform.js`
- **Function**: `isMacOS()` - returns boolean
- **Usage**: Only offer hooks installation on macOS

#### 2.2 User Prompting System
- **Location**: New utility function in `lib/utils/prompt.js`
- **Dependencies**: Add `readline` for user input (built-in Node.js module)
- **Prompt Text**: 
  ```
  Install notification hooks for Claude Code? 
  This will notify you when agents finish or need attention.
  Requires 'terminal-notifier' (install via: brew install terminal-notifier)
  [Y/n]: 
  ```

#### 2.3 Settings.json Management
- **Location**: New utility functions in `lib/utils/settings.js`
- **Functions**:
  - `loadSettings(installPath)` - safely load existing settings.json
  - `mergeHooks(existingSettings, newHooks)` - merge hook configurations
  - `saveSettings(installPath, settings)` - write settings.json with proper formatting

#### 2.4 Hook Configuration System
- **Location**: New file `lib/config/hooks.js`
- **Purpose**: Configurable hook definitions that can be customized
- **Structure**:
  ```javascript
  // Configuration object for hook definitions
  const HOOK_CONFIGS = {
    stop: {
      title: '🤖 Claude Code',
      message: '✅ Agent finished in {dir}',
      sound: 'Hero'
    },
    subagentStop: {
      title: '🔧 Claude Code', 
      message: '🎯 Subagent finished in {dir}',
      sound: 'Ping'
    },
    notification: {
      title: '⚠️ Claude Code',
      message: '💬 Attention needed in {dir}',
      sound: 'Glass'
    }
  };
  ```

- **Implementation**: New file `lib/templates/hooks.js`
- **Purpose**: Generator functions that create hook JSON from config
- **Functions**:
  ```javascript
  function generateHooks(hookConfigs = HOOK_CONFIGS) {
    return {
      "Stop": [createTerminalNotifierHook(hookConfigs.stop)],
      "SubagentStop": [createTerminalNotifierHook(hookConfigs.subagentStop)],
      "Notification": [createTerminalNotifierHook(hookConfigs.notification)]
    };
  }
  
  function createTerminalNotifierHook(config) {
    return {
      matcher: "",
      hooks: [{
        type: "command",
        command: `dir=$(basename "$CLAUDE_PROJECT_DIR"); terminal-notifier -title '${config.title}' -message "${config.message.replace('{dir}', '$dir')}" -sound ${config.sound}`,
        timeout: 10
      }]
    };
  }
  ```

### Phase 3: Integration

#### 3.1 Install Command Integration
- **File**: `lib/commands/install.js`
- **Flow**:
  1. Install commands and agents (existing logic)
  2. If macOS detected → prompt for hooks installation
  3. If user agrees → generate hooks from config and merge into settings.json
  4. If not macOS → skip hooks with informational message

#### 3.2 Upgrade Command Considerations
- **File**: `lib/commands/upgrade.js`
- **Behavior**: Should upgrade preserve existing hooks and only update commands/agents
- **No re-prompting**: Don't ask about hooks again during upgrades

#### 3.3 Uninstall Command Updates
- **File**: `lib/commands/uninstall.js`
- **Consideration**: Should uninstall remove the hooks we added?
- **Approach**: Remove only Context Monkey hooks, preserve user's other hooks

## Implementation Details

### Hook Configuration Philosophy

The hook system should be:
1. **Configurable**: Easy to modify titles, messages, sounds
2. **Extensible**: Easy to add new hook types
3. **Templatable**: Support variable substitution (e.g., `{dir}`)
4. **Customizable**: Users could eventually override configurations

### Settings.json Merging Strategy

```javascript
// Merge strategy for hooks
function mergeHooks(existingSettings, newHooks) {
  const merged = { ...existingSettings };
  
  if (!merged.hooks) {
    merged.hooks = {};
  }
  
  // For each hook type (Stop, SubagentStop, Notification)
  Object.keys(newHooks).forEach(hookType => {
    if (!merged.hooks[hookType]) {
      // No existing hooks of this type - add ours
      merged.hooks[hookType] = newHooks[hookType];
    } else {
      // Existing hooks - append ours to the array
      merged.hooks[hookType] = [
        ...merged.hooks[hookType],
        ...newHooks[hookType]
      ];
    }
  });
  
  return merged;
}
```

### Error Handling

1. **Settings.json Parse Errors**: If existing settings.json is malformed, create backup and start fresh
2. **Permission Errors**: Clear error messages about directory permissions
3. **terminal-notifier Missing**: Just inform, don't error - hooks will fail gracefully

### User Experience Considerations

1. **Clear Messaging**: Always show what's being installed where
2. **Informational Output**: Show hook installation status
3. **Platform Awareness**: Clear messaging about macOS requirement
4. **Upgrade Path**: Smooth experience for existing users

## Files to Modify

### New Files
- `lib/utils/platform.js` - Platform detection utilities
- `lib/utils/prompt.js` - User input prompting
- `lib/utils/settings.js` - Settings.json management
- `lib/config/hooks.js` - Hook configuration definitions
- `lib/templates/hooks.js` - Hook generator functions

### Modified Files
- `bin/context-monkey.js` - CLI argument changes
- `lib/commands/install.js` - Main installation flow
- `lib/commands/upgrade.js` - Preserve hooks during upgrade
- `lib/commands/uninstall.js` - Hook cleanup considerations
- `package.json` - Update description to reflect global-first approach
- `README.md` - Update examples and documentation

## Testing Strategy

### Manual Testing Scenarios

1. **Fresh Installation (macOS)**:
   - Install on clean system
   - Verify global installation
   - Test hooks prompt and installation
   - Verify hooks work correctly

2. **Fresh Installation (non-macOS)**:
   - Install on Linux/Windows
   - Verify hooks are skipped gracefully
   - Verify commands/agents still install

3. **Existing Installation**:
   - Install over existing Context Monkey
   - Verify hooks merge correctly
   - Test with malformed settings.json

4. **Local Installation**:
   - Test `--local` flag still works
   - Verify hooks work in local context

5. **Upgrade Scenarios**:
   - Upgrade existing installation
   - Verify hooks preserved
   - Verify new commands/agents updated

6. **Hook Configuration Testing**:
   - Test different hook configurations
   - Verify template variable substitution
   - Test hook generation functions

### Automated Testing
- Unit tests for settings merging logic
- Unit tests for platform detection
- Unit tests for hook generation functions
- Unit tests for configuration parsing
- Integration tests for full install flow

## Rollout Considerations

1. **Version Bump**: This is a breaking change in default behavior - major version bump
2. **Migration Guide**: Document how existing users can migrate
3. **Backward Compatibility**: `--local` flag preserves old behavior
4. **Communication**: Clear changelog and README updates

## Success Criteria

- [ ] `npx context-monkey install` installs globally by default
- [ ] Users prompted for hooks installation on macOS
- [ ] Hooks merge safely with existing configurations
- [ ] Hook configurations are easily customizable
- [ ] Hook generation functions work correctly
- [ ] Non-macOS users get clear messaging about platform requirements
- [ ] All existing functionality preserved with `--local` flag
- [ ] Comprehensive testing coverage
- [ ] Updated documentation and examples

## Future Enhancements

1. **Cross-Platform Notifications**: Add support for other notification systems
2. **Hook Customization CLI**: Add commands to customize hook configurations
3. **User Config Override**: Allow users to override hook configs via CLI options
4. **Hook Management**: Add commands to enable/disable specific hooks
5. **Template Sharing**: Allow sharing of hook configurations between users
6. **Configuration Validation**: Add schema validation for hook configurations