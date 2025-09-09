# Unused Claude Code Features for Context Monkey

This document identifies specific Claude Code capabilities that context-monkey is not currently leveraging.

## Hooks System
Currently not implemented. Hooks enable workflow automation:
- `PreToolUse` hooks to validate before file edits
- `SessionStart` hooks to auto-load project context  
- `PostToolUse` hooks for automatic testing after code changes

## Plan Mode Integration
Commands don't support plan mode analysis:
- Add `plan_mode: true` to command frontmatter for safe analysis
- Allows repository exploration without file modification risk

## MCP (Model Context Protocol)
No external integrations currently:
- Database connections for data-driven analysis
- GitHub API integration for issue/PR context
- Monitoring service connections (Sentry, DataDog)

## Multi-tool Parallel Execution
Agents use tools sequentially instead of batching:
- Batch multiple `Read`/`Glob`/`Grep` calls in single responses
- Parallel `Bash` commands for faster analysis

## Advanced Tool Permissions
Overly restrictive `allowed-tools` in current commands:
- Missing `WebSearch` for technology research
- No `WebFetch` for documentation analysis  
- Limited `Bash` permissions (only specific commands)

## Command Composition
No meta-commands that chain existing ones:
- Missing workflow commands that run multiple analyses in sequence

## Dynamic Context Loading
Not using `@filepath` references effectively:
- Could reference external documentation or configuration files
- Missing integration with project-specific context files

## Next Steps
Focus on implementing hooks, MCP integrations, plan mode support, and better tool utilization rather than creating more commands.