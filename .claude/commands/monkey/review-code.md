---
description: Critical code review of specified changes, guided by project stack and rules if available.
argument-hint: "paths… | (paste a diff in chat)"
allowed-tools: Read, Grep, Glob
---

# Intent

Perform a rigorous code review of the provided scope, applying:

- Workflow & safety directives from CLAUDE.md
- Stack-specific norms from .cxm/stack.md (if present)
- Project development rules from .cxm/rules.md (if present)

# Scope rules

- If paths are provided → review exactly those.
- If a diff is pasted in chat → review the diff + referenced files.
- If neither is provided → ask once for paths/diff (no auto-detection).

# Review focus

- **Always apply** CLAUDE.md directives (plan small diffs, respect boundaries, no unsafe edits).
- **If stack.md is loaded**: apply language/framework best practices (e.g. Go error wrapping, Python typing/lint, TS strictness, Rust error handling, etc.).
- **If rules.md is loaded**: enforce project-specific constraints (naming, layering, performance budgets).
- **If stack/rules are missing**: fall back to generic correctness, boundaries, performance, security, and tests; note explicitly that stack/rules context was unavailable.

# Output format (emit inside a fenced markdown block)

````md
## Context

- Scope reviewed: …
- Stack info: present/absent
- Rules: present/absent

## Critical (must fix)

- file:line — issue — why it matters
  ```diff
  - …
  + …
  ```

## Warnings (should fix)

- file:line — issue — suggestion

## Suggestions (nice to have)

- file:line — idea — rationale
- …

## Test Gaps

- path test-name — missing/weak coverage rationale
- …

## Docs to Update

- path — brief change summary
- …
````
