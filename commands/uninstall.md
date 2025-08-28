---
description: Uninstall Context Monkey from the current repository
argument-hint: ""
allowed-tools: Read, Bash, Glob, LS
---

# Intent

Safely remove all Context Monkey files from the current repository, with user confirmation for potentially important files.

# Interaction flow

1. **Check for Context Monkey installation**:
   - Look for `CLAUDE.md`, `.claude/commands/cxm/`, and `.cxm/` directory
   - If none found, inform user nothing to uninstall

2. **Show what will be removed**:
   - List all files and directories to be deleted
   - Distinguish between generated files (safe to delete) and context files (ask user)

3. **Get user confirmation**:
   - For `.cxm/` directory: Delete without asking (generated files only)
   - For `.claude/commands/cxm/` directory: Delete without asking (command files)
   - For `CLAUDE.md`: **Ask user** - this might contain customizations

4. **Perform cleanup**:
   - Remove directories and files as confirmed
   - Clean up empty parent directories if they become empty
   - Remove Context Monkey entries from `.gitignore` if present

# Files to remove

**Always safe to delete** (no confirmation needed):
- `.cxm/` directory and all contents
- `.claude/commands/cxm/` directory and all contents
- Empty `.claude/commands/` directory (if no other commands remain)
- Empty `.claude/` directory (if completely empty)

**Ask user before deleting**:
- `CLAUDE.md` - May contain user customizations

# Cleanup process

1. Remove `.cxm/` directory recursively
2. Remove `.claude/commands/cxm/` directory recursively  
3. Check if `.claude/commands/` is empty and remove if so
4. Check if `.claude/` is empty and remove if so
5. Ask about `CLAUDE.md` removal
6. Clean `.gitignore` entries:
   - Remove "# Context Monkey generated files" comment
   - Remove ".cxm/*.md" entry
   - Clean up extra blank lines

# Output format

Show clear feedback about what was removed:

```
🗑️  Uninstalling Context Monkey...

Removed:
  .cxm/ directory (3 files)
  .claude/commands/cxm/ (5 files)  
  .claude/ directory (now empty)

CLAUDE.md: Keep this file? It may contain your customizations. [y/N] 

✅ Context Monkey uninstalled successfully!
```

# Notes

- Never remove files outside of Context Monkey's scope
- Always preserve user customizations when possible
- Provide clear feedback about what was actually removed
- Handle edge cases gracefully (partial installations, missing files)