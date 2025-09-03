---
description: Generate or update .monkey/stack.md by scanning repo structure & top-level configs only.
argument-hint: "[overwrite|append|skip] (optional)"
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(git ls-files:*), Bash(git rev-parse:*)
---

# Intent

Create `.monkey/stack.md` with detected languages, build/test/run, entrypoints, and external services.

# Rules

- If `.monkey/stack.md` **does not exist**: auto-create `.monkey/` and write the file (no prompt).
- If it **exists** and the user passed an action arg:
  - `overwrite` → replace the file
  - `append` → add a new dated section
  - `skip` → show the profile in chat only
- If it **exists** and no action arg was given → ASK the user what to do.

# Output format

```md
# Stack Profile (generated)

**Generated:** <UTC timestamp>

## Languages / Frameworks

- …

## Build / Test / Run

- …

## Entrypoints / Hot paths

- …

## External services

- …
```
