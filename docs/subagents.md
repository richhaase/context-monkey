# Context Monkey Subagents

Context Monkey v0.1.0 transforms your Claude Code experience through specialized subagents that provide focused, high-quality outputs for specific tasks.

## Overview

Instead of using a single general-purpose agent for all tasks, Context Monkey delegates to specialized subagents, each with:
- **Focused expertise** in their domain
- **Isolated context** for cleaner reasoning
- **Structured output** formats
- **Consistent quality** through prompt engineering

## Available Subagents

### 🔍 Code Reviewer (`code-reviewer`)
**Command**: `/review-code [commit-range | file-paths]`

Senior software engineer specializing in thorough code reviews.

**Capabilities**:
- Analyzes git diffs for correctness and design
- Checks security vulnerabilities and performance
- Provides structured feedback by severity
- Balances criticism with recognition

**Output Structure**:
- 🔴 **CRITICAL** (Must Fix) - bugs, security issues
- 🟡 **WARNINGS** (Should Fix) - maintainability, performance  
- 🟢 **SUGGESTIONS** (Consider) - enhancements, alternatives
- ✅ **GOOD PRACTICES** - positive reinforcement

### 📋 Project Planner (`project-planner`)
**Command**: `/plan <goal>`

Experienced technical architect for breaking down complex tasks.

**Capabilities**:
- Analyzes requirements and constraints
- Explores multiple implementation approaches
- Provides risk assessment and mitigations
- Creates actionable step-by-step plans

**Output Structure**:
- Goal & constraints clarification
- Current state analysis
- Options with trade-offs
- Recommended technical design
- Implementation plan with time estimates
- Risk matrix and acceptance criteria

### 🗂️ Repository Analyst (`repository-analyst`)
**Command**: `/explain-repo [focus-area]`

Software architect specializing in codebase analysis and documentation.

**Capabilities**:
- Maps directory structures and purposes
- Identifies architectural patterns
- Traces module dependencies
- Suggests improvement opportunities

**Output Structure**:
- Repository overview and structure
- Key entry points and hot paths
- Architecture patterns used
- Technical debt assessment
- Quick win opportunities

### 🔍 Stack Detective (`stack-detective`)
**Command**: `/stack-scan [overwrite|append|skip]`

Polyglot developer expert in technology stack analysis.

**Capabilities**:
- Detects languages, frameworks, and tools
- Identifies build/test/run commands
- Maps external service dependencies
- Provides optimization recommendations

**Output Structure**:
- Complete technology inventory
- Development workflow commands
- External integrations
- Performance and tooling suggestions
- Stack health assessment

### 🔬 Deep Researcher (`deep-researcher`)
**Command**: `/deep-dive <topic>`

Thorough research analyst for technical investigations.

**Capabilities**:
- Combines codebase analysis with external research
- Investigates patterns and implementations
- Synthesizes findings from multiple sources
- Provides evidence-based conclusions

**Output Structure**:
- Key findings with citations
- Detailed analysis and insights
- Code patterns discovered
- External research integration
- Actionable recommendations

## How Delegation Works

When you run a command like `/review-code`, here's what happens:

1. **Command receives request** with your arguments
2. **Command gathers context** (e.g., git diff for code review)
3. **Command invokes subagent** using Claude Code's Task tool
4. **Subagent analyzes** with specialized expertise
5. **Structured output** returned to you

## Benefits of Subagent Architecture

### 🎯 **Focused Expertise**
Each subagent has deep knowledge in its domain, leading to more relevant and actionable advice.

### 🧹 **Clean Context**
Subagents start with fresh context windows, avoiding the "context pollution" that degrades output quality.

### 📊 **Consistent Structure**
Predictable output formats make it easier to scan and act on recommendations.

### ⚡ **Specialized Tools**
Each subagent only has access to tools relevant to its task, reducing confusion and improving focus.

### 🔄 **Iterative Improvement**
Individual subagent prompts can be refined without affecting others.

## Performance Considerations

- **Latency**: Subagent invocation adds ~1-2 seconds per command
- **Quality**: The latency trade-off delivers significantly better, more focused outputs
- **Context**: Each subagent starts fresh, preventing context overflow issues

## Customization

All subagent prompts are stored in `.claude/agents/` and can be customized:

```bash
# View a subagent prompt
cat .claude/agents/reviewer.md

# Edit for project-specific requirements
# (Changes persist until next Context Monkey upgrade)
```

## Future Subagents

Context Monkey is designed to grow. Potential future subagents:
- **Security Auditor** - Specialized vulnerability assessment
- **Performance Optimizer** - Bottleneck identification and fixes
- **Documentation Writer** - API docs and README generation
- **Test Engineer** - Comprehensive test strategy and implementation

---

*Context Monkey v0.1.0 - Transform your Claude Code experience through specialized intelligence.*