---
description: >-
  Provide comprehensive codebase analysis using the repository explainer
  workflow
argument-hint: '[focus-area]'
allowed-tools: Task
plan_mode: 'true'
---
# Intent

Delegate repository analysis to the specialized cm-repo-explainer subagent for comprehensive architectural understanding.

# Procedure

1. **Gather focus**: Pass any focus area from $ARGUMENTS
2. **Analyze structure**: Map directories, identify patterns, find opportunities
3. **Produce comprehensive output**: Provide:
   - Repository overview and purpose
   - Directory structure mapping
   - Architecture patterns
   - Module dependencies
   - Hot paths and critical code
   - Quick win opportunities
   - Technical debt assessment

# Execution

When this command runs, Claude Code will:

1. Use Task tool to invoke the cm-repo-explainer subagent with:
  - subagent_type: "cm-repo-explainer"
  - prompt: Request repository analysis with optional focus from $ARGUMENTS
  - description: "Analyze repository architecture"

The cm-repo-explainer subagent specializes in:
- Understanding complex codebases
- Identifying architectural patterns
- Finding improvement opportunities
- Mapping module dependencies
- Detecting technical debt

The analyst provides actionable insights for both newcomers and experienced developers.
