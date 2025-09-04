# Context Monkey v0.1.0 Implementation Plan (Focused)

**Generated:** 2025-09-03  
**Revised:** 2025-09-03  
**Goal:** Transform Context Monkey into a prompt engineering framework using Claude Code subagents

## Goal & Constraints
- **Build Context Monkey v0.1.0 as a specialized subagent suite for Claude Code**
- Replace simple template system with intelligent subagent delegation
- Focus on improving conversation quality through specialized reasoning contexts
- Scope: Subagents, command shims, and simple installer (no hooks, no settings management)

## Current State (paths only)
- `bin/context-monkey.js` - CLI entry point (will be rewritten)
- `lib/commands/install.js` - Simple file copying (will be replaced)  
- `lib/commands/upgrade.js` - Basic overwrite (will be replaced)
- `lib/commands/uninstall.js` - File removal (will be enhanced)
- `lib/utils/files.js` - Basic utilities (will be extended)
- `templates/commands/*.md` - Legacy slash commands (will be replaced with subagent shims)
- `templates/context.md` - Old CLAUDE.md template (will be redesigned)

## Options & Trade-offs
- **Option A — Focused Subagent Framework**: v0.1.0 with just subagents and command delegation
  - *Why it fits*: Delivers core value (better AI outputs) without complexity
  - *Complexity*: Low - simple file copying and prompt engineering
  - *Blast radius*: Zero - no existing users to break
  - *Migration cost*: None - fresh start

**Recommendation:** Option A - Focus on prompt engineering excellence without operational complexity.

## Design Sketch (recommended)
- **Interfaces/contracts**:
  - `templates/.claude/agents/{reviewer,planner,repo-explainer,stack-profiler,researcher}.md` - Core subagents with focused prompts
  - `templates/.claude/commands/*.md` - Command shims that delegate to subagents
  - `lib/installer.js` - Simple file copying installer
  - `templates/.claude/settings.json.example` - Sample configuration (not installed, just documented)
- **Data/schema**: `Generated-by: context-monkey v0.1.0` headers on all generated files
- **Subagent contracts**: Each agent has clear input expectations and output format
- **Compatibility**: None needed - fresh architectural foundation

## Plan (2 Phases)

### Phase 1: Proof of Concept (Reviewer Subagent)
1. **Build reviewer subagent** - Create single agent with focused prompt for code review
2. **Convert /review-code command** - Implement delegation pattern with git diff context passing
3. **Test end-to-end** - Validate subagent invocation, context injection, and output quality
4. **Document patterns** - Capture learnings about delegation, context passing, and prompt structure

### Phase 2: Scale Out (If PoC Succeeds)
5. **Build remaining subagents** - planner, repo-explainer, stack-profiler, researcher
6. **Convert remaining commands** - Apply proven delegation pattern to all commands
7. **Update installer** - Modify to copy new `.claude/agents/` and `.claude/commands/` structure
8. **Update documentation** - Version bump to 0.1.0, usage examples, customization guide

## Test Plan

### Phase 1 Tests (Proof of Concept)
- **Functional**: `/review-code` successfully delegates to reviewer subagent
- **Context**: Git diff is properly passed to subagent
- **Output**: Reviewer produces structured code review with categories
- **Performance**: Measure baseline subagent invocation latency

### Phase 2 Tests (Full Implementation)
- **Unit**: 
  - `test/installer.spec.js` - File copying, directory creation
  - `test/subagents.spec.js` - All agent YAML structures valid
- **Integration**:
  - All commands delegate to appropriate subagents
  - Each subagent produces expected output format
  - Context passing works for all command types
- **Performance**: Installation <2s, subagent latency documented

## Observability & Rollout
- **Visibility**: Commands will output which subagent they're delegating to
- **Rollout**: Direct release as v0.1.0

## Docs & Comms
- **Files to update**:
  - `README.md` - Showcase subagent delegation and quality improvements
  - `package.json` - Version bump to 0.1.0
  - New `docs/subagents.md` - Explain each agent's purpose and capabilities
- **Decision Log**: "Launch Context Monkey v0.1.0 as prompt engineering framework using Claude Code subagents"

## Risks & Mitigations
- **Risk**: Subagent prompts produce inconsistent outputs
  - *Mitigation*: Strict output contracts, extensive prompt testing, clear examples
- **Risk**: Context passing between command and subagent fails
  - *Mitigation*: Clear documentation of context injection pattern, validation in commands
- **Risk**: Performance degradation from subagent invocation  
  - *Mitigation*: Set user expectations, document latency trade-off for quality

## Backout Plan
- **Immediate**: `npm uninstall -g context-monkey && npm install -g context-monkey@0.0.5`
- **Files to clean**: `rm -rf .claude/` (if needed)
- **Verification**: Previous version installs and works correctly

## Acceptance Checklist

### Phase 1 (Proof of Concept)
- [ ] Reviewer subagent created at `templates/.claude/agents/reviewer.md`
- [ ] `/review-code` command successfully delegates to reviewer
- [ ] Git diff context properly injected into subagent prompt
- [ ] Reviewer outputs structured review (Critical/Warnings/Suggestions)
- [ ] Delegation pattern documented for remaining commands

### Phase 2 (Full Implementation)
- [ ] All 5 core subagents have focused prompts with clear output contracts
- [ ] All commands (`/plan`, `/explain-repo`, `/stack-scan`, `/deep-dive`) delegate properly
- [ ] Clean install creates `.claude/agents/` and `.claude/commands/` directories
- [ ] Commands clearly indicate which subagent they're delegating to
- [ ] Documentation explains subagent purposes and customization
- [ ] Installation completes in <2 seconds on typical systems