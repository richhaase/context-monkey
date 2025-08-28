---
description: Uninstall Context Monkey from the current repository
argument-hint: ""
allowed-tools: Read, Bash, Glob, LS
---

# Intent

Remove Context Monkey files from the current repository: `.cxm/`, `.claude/commands/cxm/`, and `CLAUDE.md`.

# Implementation

Simply remove the Context Monkey files directly:

1. Remove `.cxm/` directory and all contents
2. Remove `.claude/commands/cxm/` directory and all contents  
3. Remove `CLAUDE.md` file
4. Clean up empty parent directories if they become empty
5. Remove Context Monkey entries from `.gitignore` if present

# Commands to run

```bash
rm -rf .cxm/
rm -rf .claude/commands/cxm/
rm -f CLAUDE.md

# Clean up empty directories
rmdir .claude/commands/ 2>/dev/null || true
rmdir .claude/ 2>/dev/null || true

# Clean .gitignore
sed -i '' '/# Context Monkey generated files/d' .gitignore 2>/dev/null || true
sed -i '' '/\.cxm\/\*\.md/d' .gitignore 2>/dev/null || true
```

# Output

Show what was removed:

```
🗑️  Uninstalling Context Monkey...

Removed:
  .cxm/ directory
  .claude/commands/cxm/ directory
  CLAUDE.md file

✅ Context Monkey uninstalled successfully!
```