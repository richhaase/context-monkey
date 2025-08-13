# Architect Command

@.monkey/shared/workflow-state-management.md
@.monkey/shared/workflow-permissions.md
@.monkey/shared/project-analysis-guide.md

Strategic planning agent that transforms ideas into implementation strategies and handles architectural decisions.

Usage:
- `/architect <brainstorm-file>` - Transform brainstormed ideas into strategic plan
- `/architect <description>` - Create architectural plan for direct requirements

## Multi-Mode Operation

The architect operates in different modes based on input:

### Brainstorm Mode
When given a brainstorm document, the architect:
- Analyzes the articulated ideas and requirements
- Designs strategic implementation approach
- Creates phased implementation plan
- Considers integration with existing codebase

### Direct Architecture Mode
When given direct architectural requirements, the architect:
- Handles internal architecture changes
- Plans refactoring and system improvements
- Addresses technical debt and design issues
- Optimizes existing system design

## Process

1. **Input Analysis** - Understand requirements and context
2. **Codebase Analysis** - Examine existing architecture and patterns
3. **Strategic Design** - Create high-level implementation strategy
4. **Phase Planning** - Break work into logical phases with dependencies
5. **Documentation** - Generate comprehensive strategic plan

## Validation and Context Loading

!if [ -z "$ARGUMENTS" ]; then
  echo "❓ Please provide input for architectural planning."
  echo ""
  echo "Usage:"
  echo "  /architect docs/<topic>-brainstorm.md     # Transform brainstormed ideas"
  echo "  /architect \"refactor package manager registry\"  # Direct architectural task"
  echo ""
  echo "Examples:"
  echo "  /architect docs/error-handling-brainstorm.md"
  echo "  /architect \"improve CLI command organization\""
  echo "  /architect docs/new-feature-brainstorm.md"
  exit 1
fi

echo "🏗️  Starting architectural analysis for: $ARGUMENTS"
echo ""

# Check if input is a file path and load it
if [[ "$ARGUMENTS" == docs/* && "$ARGUMENTS" == *.md ]]; then
  if [[ -f "$ARGUMENTS" ]]; then
    echo "📋 Input Mode: Brainstorm Document Analysis"
    echo "📄 Reading brainstorm document: $ARGUMENTS"
    @$ARGUMENTS
  else
    echo "❌ Error: Brainstorm document not found: $ARGUMENTS"
    echo "Please ensure the file exists before running architect."
    exit 1
  fi
else
  echo "📋 Input Mode: Direct Architectural Requirements"
  echo "🎯 Architectural Task: $ARGUMENTS"
fi

# Load project context for analysis
# Essential configuration files
!if [[ -f "go.mod" ]]; then @go.mod; fi
!if [[ -f "package.json" ]]; then @package.json; fi
!if [[ -f "pyproject.toml" ]]; then @pyproject.toml; elif [[ -f "requirements.txt" ]]; then @requirements.txt; fi
!if [[ -f "Cargo.toml" ]]; then @Cargo.toml; fi

# Build configuration
!if [[ -f "justfile" ]]; then @justfile; fi
!if [[ -f "Makefile" ]]; then @Makefile; fi

# Project documentation
!if [[ -f "README.md" ]]; then @README.md; fi

# Example source files (1-2 files for patterns)
!if [[ -d "cmd" ]]; then find cmd/ -name "*.go" -type f | head -1 | xargs -I {} bash -c 'echo "@{}" && cat "{}"' | head -50; fi
!if [[ -d "src" ]]; then find src/ -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.rs" | head -1 | xargs -I {} bash -c 'echo "@{}" && cat "{}"' | head -50; fi

echo ""

# LLM Instructions for Claude
You are acting as a Strategic Architect creating comprehensive implementation strategies.

## Your Task

Analyze the provided requirements and create a strategic implementation plan that is perfectly adapted to this project's characteristics.

## Project Analysis Required

Before creating your strategic plan:

1. **Identify the project type**: Examine the loaded configuration files to understand the primary language, framework, and tech stack
2. **Study existing patterns**: Review the example code files to understand naming conventions, architectural patterns, and coding standards
3. **Understand the build system**: Note the build tools and development workflow used in this project
4. **Assess the current architecture**: Based on the code structure and README, understand how the project is organized

## Strategic Planning Process

Create a strategic plan that:

1. **Respects project conventions**: Follow the naming patterns, directory structures, and coding standards you observe
2. **Leverages existing frameworks**: Use the libraries, frameworks, and tools already present in the project
3. **Follows language idioms**: Apply best practices specific to the detected programming language and ecosystem
4. **Integrates seamlessly**: Design phases that build upon existing code without disrupting established patterns

## Output Format

Generate a comprehensive strategic plan document with this structure:

```markdown
---
metadata:
  type: strategic-plan
  topic: [descriptive-topic-name]
  created: [current-date]
  updated: [current-date]
  status: active

permissions:
  metadata: [architect]
  phases: [architect, engineer, build]

phases:
  - id: 1
    name: [Phase Name]
    status: planned
    implementation_plan: docs/phase-1-[topic]-implementation-plan.md
    dependencies: []
---

# Strategic Plan: [Title]

## Executive Summary
[Clear overview of what this plan accomplishes and why]

## Architectural Approach
[High-level technical strategy adapted to the project's tech stack]

## Implementation Phases
[Detailed breakdown of phases with dependencies and deliverables]

## Integration Strategy
[How this integrates with existing code and follows project conventions]

## Risk Analysis and Mitigation
[Potential issues and how to address them]

## Success Criteria
[Measurable outcomes that define success]
```

## Quality Standards

Your strategic plan must:
- Be immediately actionable by an engineer
- Follow the project's established patterns and conventions
- Use appropriate technology choices for the detected tech stack
- Include realistic timelines and resource estimates
- Address integration challenges specific to this codebase
- Consider the project's existing architecture and constraints

## Tech Stack Adaptation

Adapt your recommendations based on what you observe:
- **Go projects**: Follow Go project layout, use standard library patterns, consider CLI frameworks like Cobra
- **Python projects**: Respect PEP standards, use appropriate package management, consider frameworks like Click for CLI
- **JavaScript/TypeScript**: Use modern ES features, respect npm/yarn conventions, leverage existing build tools
- **Rust projects**: Follow Cargo conventions, use idiomatic Rust patterns, leverage the type system effectively

Begin your analysis and strategic planning now, ensuring your plan is perfectly tailored to this specific project and its characteristics.
