# Context Monkey

**Smart Claude Code context rules for better AI pair programming**

Context Monkey provides workflow directives and slash commands that help Claude Code understand your project better and follow consistent development practices.

## Quick Start

```bash
curl -fsSL https://raw.githubusercontent.com/richhaase/context-monkey/main/install.sh | bash
```

This installs:
- `CLAUDE.md` - Core context with workflow rules
- `.claude/commands/cxm/` - 5 slash commands for project management

## What You Get

**Workflow Directives:**
- Plan before coding, confirm scope
- Write tests first when feasible  
- Keep diffs small, respect boundaries
- Never edit `.env*` or generated files

**Slash Commands:**
- `/stack-scan` - Auto-detect your tech stack
- `/add-rule` - Add RFC 2119 project rules (MUST/SHOULD/MAY)
- `/edit-rule` - Modify existing rules
- `/plan-change` - Deep planning for complex changes
- `/review-code` - Critical code review with context

## After Installation

1. **Run `/stack-scan`** in Claude Code to detect your languages and tools
2. **Add project rules** with `/add-rule` for team conventions
3. **Start coding** - Claude will follow your context automatically

## Example Project Rule

```md
## No Direct DOM Manipulation

**Level:** MUST NOT  
**Directive:** Components MUST NOT directly manipulate the DOM outside of React lifecycle methods.  
**Scope:** src/components/  
**Rationale:** Maintains React's declarative paradigm and prevents state inconsistencies.
```

## Requirements

- Git repository
- Claude Code CLI