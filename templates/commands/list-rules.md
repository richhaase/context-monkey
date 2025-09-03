---
description: Display all project rules from .monkey/rules.md if it exists
argument-hint: ""
allowed-tools: Read, Glob
---

# Intent

Display the current project development rules from `.monkey/rules.md` to help the user understand what rules are currently in place for the project.

# Behavior

1. **Check for rules file**: Look for `.monkey/rules.md` in the project root
2. **Display rules**: If the file exists, read and display its complete contents
3. **Handle missing file**: If the file doesn't exist, inform the user and suggest using `/add-rule` to create rules

# Implementation

- Use the Read tool to access `.monkey/rules.md`
- Display the full contents without modification
- If the file is missing, provide a helpful message like:
  ```
  No rules file found at .monkey/rules.md
  
  Use `/add-rule` to create your first project rule.
  ```

# Notes

- This is a read-only command that only displays existing rules
- Do not create or modify any files
- Keep the output clean and focused on just showing the rules