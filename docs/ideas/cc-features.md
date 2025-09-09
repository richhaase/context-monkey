# Unused Claude Code Features for Context Monkey

This document identifies specific Claude Code capabilities that context-monkey is not currently leveraging.

## Hooks System
Currently not implemented. Hooks enable workflow automation:
- `PreToolUse` hooks to validate before file edits
- `SessionStart` hooks to auto-load project context  
- `PostToolUse` hooks for automatic testing after code changes

## ✅ Plan Mode Integration
**COMPLETED**: All analytical commands now support plan mode:
- Added `plan_mode: true` to `/stack-scan`, `/explain-repo`, `/deep-dive`, `/review-code`, `/intro`
- Enables safe repository exploration without file modification risk

## MCP (Model Context Protocol)
No external integrations currently:
- Database connections for data-driven analysis
- GitHub API integration for issue/PR context
- Monitoring service connections (Sentry, DataDog)

## ✅ Multi-tool Parallel Execution
**COMPLETED**: All agents now use parallel tool execution:
- Added performance optimization guidance to all 5 agents
- Batch multiple `Read`/`Glob`/`Grep` calls in single responses
- Language-agnostic examples for universal compatibility

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
Focus on implementing hooks, MCP integrations, and better tool utilization rather than creating more commands. Plan mode support and parallel tool execution have been completed.