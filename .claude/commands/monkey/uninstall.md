---
description: Uninstall Context Monkey from the current repository
argument-hint: ""
allowed-tools: Bash
---

# Intent

Remove Context Monkey files from the current repository.

# Implementation

```bash
rm -rf .monkey/ .claude/commands/monkey/ CLAUDE.md
rmdir .claude/commands/ .claude/ 2>/dev/null || true
```