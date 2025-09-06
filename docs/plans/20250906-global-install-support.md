# Plan: Add Global Installation Support to Context Monkey

**Generated:** 2025-09-06  
**Goal:** Add support to install Context Monkey globally to ~/.claude

## Goal & Constraints

- **Goal**: Add support to install Context Monkey globally to `~/.claude` directory instead of project-local `.claude` directory
- **Constraints**: Follow existing CLI patterns, maintain backwards compatibility, respect CLAUDE.md directives (small diffs, plan first, respect boundaries)
- **Scope**: Add global installation capability while preserving current per-project installation behavior

## Current State (paths only)

- `bin/context-monkey.js` - CLI entry point with install/upgrade/uninstall commands
- `lib/commands/install.js` - Current project-local installation logic (installs to `.claude/`)
- `lib/commands/upgrade.js` - Upgrade functionality  
- `lib/commands/uninstall.js` - Removal functionality
- `lib/utils/files.js` - File operations and template processing utilities
- `templates/commands/*.md` - Slash command templates (7 files)
- `templates/agents/*.md` - Subagent templates (5 files) 
- `package.json` - npm package configuration with CLI binary

## Options & Trade-offs

**Option A - New `install-global` command**: 
- Add separate command for global installation 
- *Why it fits*: Clear separation of concerns, explicit user intent
- Complexity: Low, Blast radius: Small, Migration cost: None (additive)

**Option B - Flag on existing `install` command**:
- Add `--global` flag to existing install command
- *Why it fits*: Follows npm/CLI conventions, single command interface  
- Complexity: Medium, Blast radius: Medium, Migration cost: Low

**Option C - Auto-detection based on git context**:
- Install globally when not in git repo, locally otherwise
- *Why it fits*: Smart defaults reduce user decisions
- Complexity: High, Blast radius: High, Migration cost: Medium (behavior changes)

**Recommendation**: Option B (--global flag) - follows standard CLI patterns, maintains single command interface, clear user control

## Design Sketch (recommended)

**Interfaces/contracts**:
- `install.js:install(options)` - Add `global: boolean` option support
- `files.js` - Add `getInstallPath(isGlobal)` helper function
- CLI - Add `--global` flag to install command

**Data/schema**: 
- No schema changes, only installation target path changes
- Global path: `~/.claude/` vs local path: `./.claude/`

**Error & boundaries**:
- Validate ~/.claude directory permissions before installation
- Handle case where global directory doesn't exist
- Clear error messages for permission failures

**Compatibility**:
- Existing `install` behavior unchanged (local installation)
- All template processing and file copying logic reused
- No breaking changes to public API

## Plan (≤7 steps)

1. **Add path resolution utility** - Create `getInstallPath(isGlobal)` in `files.js`
2. **Update install command** - Add `--global` flag to CLI and pass to install function  
3. **Modify install logic** - Update `install.js` to use global path when `options.global` is true
4. **Handle global directory creation** - Ensure `~/.claude` directory structure exists
5. **Update upgrade/uninstall** - Add global support to other commands for consistency
6. **Add validation** - Check permissions and provide clear error messages
7. **Update help text** - Document new --global flag in CLI help

## Test Plan

**Unit**:
- `files.js:getInstallPath()` - test local vs global path resolution
- `install.js` - mock file operations, test global vs local installation paths

**Integration**:  
- End-to-end CLI test: `context-monkey install --global` installs to `~/.claude`
- Verify template processing works with global installation
- Test upgrade/uninstall work with globally installed files

**Regression**:
- Existing `context-monkey install` (no flag) still installs locally
- All existing templates and agents install correctly
- Project context loading still works

**Performance**: 
- Installation time should be similar (file copy operations)
- No performance impact on template processing

## Observability & Rollout

**Logs/metrics**:
- Console output should clearly indicate install location (`Installing to ~/.claude...` vs `Installing to .claude...`)
- Success messages should show full installation path

**Rollout strategy**:
- Feature complete in single PR (low risk, additive feature)
- Can be released immediately as it's backwards compatible

## Docs & Comms

**Files to update**:
- `README.md` - Add global installation instructions
- CLI help text - Document `--global` flag
- Command descriptions in install function

**Decision Log**:
"Added --global flag to install command for ~/.claude installation while preserving local .claude default behavior"

## Risks & Mitigations

**Top risks**:
1. **Permission issues with ~/.claude** - Mitigate with clear error messages and permission checks
2. **Path resolution on different OS** - Use Node.js `os.homedir()` for cross-platform support  
3. **Conflict with existing ~/.claude files** - Add --force flag support for global installation

**Detection signals**: Installation failures, permission errors in logs
**Mitigations**: Validate permissions before file operations, provide helpful error messages

## Backout Plan

**Exact steps**:
1. Revert CLI flag addition in `bin/context-monkey.js` 
2. Revert `install.js` changes to remove global option handling
3. Remove `getInstallPath()` utility from `files.js`
4. Revert help text changes

**Files to revert**: `bin/context-monkey.js`, `lib/commands/install.js`, `lib/utils/files.js`

## Acceptance Checklist

- [ ] `context-monkey install --global` installs templates to `~/.claude/commands/monkey/`
- [ ] `context-monkey install --global` installs agents to `~/.claude/agents/`  
- [ ] `context-monkey install` (no flag) still installs to local `.claude/` directory
- [ ] `--help` shows the new `--global` flag with description
- [ ] Installation works on macOS, Linux, and Windows (`~` resolves correctly)
- [ ] Clear success/error messages show installation location
- [ ] Existing project-local installations remain unaffected