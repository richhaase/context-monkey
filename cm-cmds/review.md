---
description: Expert review system with architecture and code/functional modes
allowed-tools: Read, Write, Edit, Bash
---

# Review Command

@.monkey/shared/workflow-state-management.md
@.monkey/shared/workflow-permissions.md
@.monkey/shared/workflow-validation.md
@.monkey/shared/project-analysis-guide.md

## Validation and Context Loading

!if [[ -z "$ARGUMENTS" ]]; then
    echo "What would you like me to review?"
    echo "Available options:"
    echo "  Strategic Plans: $(find docs/ -name "*strategic-plan.md" -type f)"
    echo "  Implementation Plans: $(find docs/ -name "*implementation-plan.md" -type f)"
    exit 0
fi

!if [[ ! -f "$ARGUMENTS" ]]; then
  echo "Error: File not found: $ARGUMENTS"
  exit 1
fi

## Context

- Review Target: @$ARGUMENTS
- Review Mode: !`if [[ "$ARGUMENTS" =~ strategic-plan ]]; then echo "Architecture Review"; elif [[ "$ARGUMENTS" =~ implementation-plan ]]; then echo "Code/Functional Review"; else echo "General Review"; fi`
- Project Type: !`if [[ -f "go.mod" ]]; then echo "Go"; elif [[ -f "package.json" ]]; then echo "JavaScript/TypeScript"; elif [[ -f "pyproject.toml" || -f "requirements.txt" ]]; then echo "Python"; elif [[ -f "Cargo.toml" ]]; then echo "Rust"; else echo "Unknown"; fi`
- Project Context: !`if [[ -f "go.mod" ]]; then cat go.mod | head -5; elif [[ -f "package.json" ]]; then cat package.json | head -10; fi`
- Related Documents: !`if [[ "$ARGUMENTS" =~ strategic-plan ]]; then find docs/ -name "*implementation-plan.md" -type f | head -2; elif [[ "$ARGUMENTS" =~ implementation-plan ]]; then find docs/ -name "*strategic-plan.md" -type f | head -1; fi`

## Your Task

You are conducting an expert review with full project awareness and tech stack understanding.

**First, analyze the project:**
1. Understand the tech stack and development patterns from the project files
2. Note the architectural conventions and code organization
3. Understand the build system and testing frameworks in use
4. Review related documents for context and dependencies

**Then conduct your review based on mode:**

### Architecture Review Mode (for strategic plans)
**Focus Areas:**
- Strategic alignment and coherence with project architecture
- Phase dependency logic and feasibility within project constraints
- Risk assessment adequacy for the specific tech stack
- Implementation feasibility using existing project infrastructure
- Integration strategy with current codebase and patterns

**Analysis Framework:**
- Does the plan respect existing architectural patterns?
- Are the proposed technologies appropriate for this project's stack?
- Do the phases build logically on existing infrastructure?
- Are the timelines realistic given the current codebase?

### Code/Functional Review Mode (for implementation plans)
**Focus Areas:**
- Implementation completeness vs plan goals
- Adherence to project-specific coding standards and patterns
- Proper use of existing frameworks and libraries
- Integration quality with current architecture
- Testing adequacy using project's testing infrastructure

**Analysis Framework:**
- Does the implementation follow established project conventions?
- Are the right frameworks and patterns being used?
- Is the code quality consistent with existing codebase?
- Will this integrate seamlessly with current architecture?

**Tech Stack Specific Considerations:**
- **Go projects**: Standard layout compliance, error handling patterns, CLI framework usage
- **Python projects**: PEP 8 compliance, package structure, virtual environment integration
- **JavaScript/TypeScript**: Build tool integration, framework conventions, npm/yarn patterns
- **Rust projects**: Cargo conventions, ownership patterns, crate organization

**Provide your analysis in this format:**

For Architecture Reviews:
```markdown
# Architecture Review: [Plan Name]

## Strategic Assessment
[Overall strategic soundness within project context]

## Tech Stack Alignment
[How well the plan fits the project's technology choices]

## Critical Issues
- [High-impact problems requiring immediate attention]

## Integration Analysis
[How well this will integrate with existing codebase]

## Recommendations
1. [Prioritized improvements specific to this project]

## Architecture Rating: [Solid/Needs Revision/Major Concerns]
```

For Code/Functional Reviews:
```markdown
# Code/Functional Review: [Plan Name]

## Implementation Assessment
[Completeness vs goals and project integration quality]

## Pattern Compliance
[How well implementation follows established project patterns]

## Code Quality Analysis
### Strengths
- [Well-implemented aspects that match project standards]

### Issues
- **Critical**: [Must-fix issues for project integration]
- **Important**: [Should-fix for consistency and quality]
- **Minor**: [Nice-to-fix for optimization]

## Tech Stack Integration
[How well the implementation uses existing frameworks and tools]

## Recommendations
1. [Actionable improvements specific to this project's patterns]

## Implementation Rating: [Complete/Nearly Complete/Needs Work]
```

Conduct your expert review now, ensuring it's perfectly tailored to this project's characteristics and provides actionable, project-specific feedback.
