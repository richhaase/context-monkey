# Engineer Command

@.monkey/shared/workflow-state-management.md
@.monkey/shared/workflow-permissions.md
@.monkey/shared/workflow-detection.md
@.monkey/shared/workflow-validation.md
@.monkey/shared/project-analysis-guide.md

Detailed design agent that creates technical implementation plans from strategic plans or direct issue descriptions.

Usage:
- `/engineer` - Auto-detect next phase from strategic plan
- `/engineer <phase-number>` - Create implementation plan for specific phase
- `/engineer "<issue-description>"` - Create implementation plan for direct issue

## Multi-Mode Operation

The engineer operates in different modes based on input:

### Strategic Phase Mode
When working with strategic plans, the engineer:
- Auto-detects next "planned" phase not yet "ready to implement"
- Checks phase dependencies (previous phases completed)
- Creates detailed technical implementation plans
- Updates strategic plan phase status to "ready to implement"

### Direct Issue Mode
When given direct issue descriptions, the engineer:
- Analyzes bugs, small changes, or targeted improvements
- Creates focused implementation plans without strategic overhead
- Handles issues that don't require full architectural planning

## Process

1. **Input Analysis** - Determine mode and validate requirements
2. **Context Loading** - Read strategic plan + all implementation plans (strategic mode) OR analyze issue (direct mode)
3. **Phase Validation** - Check dependencies and prerequisites (strategic mode)
4. **Technical Design** - Create detailed implementation specifications
5. **Documentation** - Generate implementation plan with clear action items

## Auto-Detection Logic

In strategic mode without specific phase:
1. Find strategic plan document in docs/ directory
2. Identify next "planned" phase not yet "ready to implement"
3. Validate phase dependencies (previous phases completed)
4. Confirm suggested phase with user
5. If declined, present all available phases

## Validation and Context Loading

!if [ -z "$ARGUMENTS" ]; then
  # Auto-detect mode - look for strategic plan
  STRATEGIC_PLAN=$(find docs/ -name "*strategic-plan.md" -type f | head -1)
  if [[ -n "$STRATEGIC_PLAN" ]]; then
    echo "Strategic Plan Detection Mode"
    echo "Found strategic plan: $STRATEGIC_PLAN"
    echo ""
    echo "I'll analyze the strategic plan and auto-detect the next phase ready for implementation."
  else
    echo "No strategic plan found. Please provide input for implementation planning."
    echo ""
    echo "Usage:"
    echo "  /engineer                                    # Auto-detect next phase from strategic plan"
    echo "  /engineer 1                                  # Create plan for specific phase number"
    echo "  /engineer \"fix error handling in CLI\"        # Direct issue implementation planning"
    echo ""
    echo "Examples:"
    echo "  /engineer                                    # Auto-detect next phase"
    echo "  /engineer 2                                  # Plan phase 2 implementation"
    echo "  /engineer \"add progress bars to commands\"    # Direct issue planning"
    exit 1
  fi
elif [[ "$ARGUMENTS" =~ ^[0-9]+$ ]]; then
  # Phase number mode
  STRATEGIC_PLAN=$(find docs/ -name "*strategic-plan.md" -type f | head -1)
  if [[ -n "$STRATEGIC_PLAN" ]]; then
    echo "Strategic Phase Planning Mode"
    echo "Target Phase: $ARGUMENTS"
    echo "Strategic Plan: $STRATEGIC_PLAN"
    echo ""
    echo "I'll create a detailed implementation plan for phase $ARGUMENTS."
  else
    echo "Error: Strategic plan not found for phase-based planning."
    echo "Phase numbers require an existing strategic plan document."
    exit 1
  fi
else
  # Direct issue mode
  echo "Direct Issue Planning Mode"
  echo "Issue Description: $ARGUMENTS"
  echo ""
  echo "I'll create a focused implementation plan for this specific issue."
fi

echo ""

# Load context based on mode
if [[ "$ARGUMENTS" =~ ^[0-9]+$ ]] || [[ -z "$ARGUMENTS" ]]; then
  # Strategic phase mode - load strategic plan and existing implementation plans
  STRATEGIC_PLAN=$(find docs/ -name "*strategic-plan.md" -type f | head -1)
  if [[ -n "$STRATEGIC_PLAN" ]]; then
    @$STRATEGIC_PLAN
  fi

  # Load existing implementation plans for context
  find docs/ -name "*implementation-plan.md" -type f | head -3 | while read plan; do
    @$plan
  done
else
  # Direct issue mode - load minimal project context
  !if [[ -f "README.md" ]]; then @README.md; fi
fi

# Load project context for analysis
!if [[ -f "go.mod" ]]; then @go.mod; fi
!if [[ -f "package.json" ]]; then @package.json; fi
!if [[ -f "pyproject.toml" ]]; then @pyproject.toml; elif [[ -f "requirements.txt" ]]; then @requirements.txt; fi
!if [[ -f "Cargo.toml" ]]; then @Cargo.toml; fi
!if [[ -f "justfile" ]]; then @justfile; fi
!if [[ -f "Makefile" ]]; then @Makefile; fi

# Load example source files for pattern understanding
!if [[ -d "cmd" ]]; then find cmd/ -name "*.go" -type f | head -1 | xargs -I {} bash -c 'echo "@{}" && cat "{}"' | head -50; fi
!if [[ -d "src" ]]; then find src/ -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.rs" | head -1 | xargs -I {} bash -c 'echo "@{}" && cat "{}"' | head -50; fi

echo ""

# LLM Instructions for Claude
You are acting as a Technical Engineer creating detailed, project-aware implementation plans.

## Your Task

Analyze the requirements and create a comprehensive technical implementation plan that perfectly integrates with this project's architecture, conventions, and tech stack.

## Project Analysis Required

Before creating your implementation plan:

1. **Understand the project type**: Examine the loaded configuration files to identify the primary language, framework, and development ecosystem
2. **Study code patterns**: Review the example code files to understand naming conventions, architectural patterns, and coding standards
3. **Analyze existing architecture**: Based on the project structure, understand how components are organized and how they interact
4. **Identify build/test patterns**: Note the build tools, testing frameworks, and development workflow

## Implementation Planning Process

Create an implementation plan that:

1. **Follows project conventions**: Use the naming patterns, directory structures, and coding standards you observe
2. **Leverages existing infrastructure**: Build upon existing frameworks, libraries, and architectural patterns
3. **Uses appropriate tech stack patterns**: Apply language-specific and framework-specific best practices
4. **Integrates seamlessly**: Design implementation that fits naturally with existing code

## Mode-Specific Instructions

if [[ "$ARGUMENTS" =~ ^[0-9]+$ ]] || [[ -z "$ARGUMENTS" ]]; then

### Strategic Phase Mode

You are creating an implementation plan for a specific phase of a strategic plan.

**Your specific tasks:**
- Analyze the strategic plan to identify the target phase for implementation
- Create a comprehensive technical implementation plan adapted to this project's tech stack
- Break down the phase into specific, actionable tasks that follow project conventions
- Define clear interfaces, file structures, and integration points using existing patterns
- Specify testing approaches using the project's testing framework
- Update the strategic plan phase status to 'ready_to_implement'

**Output Format:**

Generate an implementation plan document following this structure:

```markdown
---
metadata:
  type: implementation-plan
  phase: [X]
  topic: [topic-name]
  status: ready_to_implement
  created: [current-date]
  updated: [current-date]
  current_agent: engineer

permissions:
  metadata: [engineer, build]
  build_results: [build]

dependencies:
  - phase: [dependency-phase-id]
    status: completed
    verification: [what must be completed first]

build_results:
  files_changed: []
  findings: []
  deviations: []
---

# Phase [X] Implementation Plan: [Phase Name]

## Overview
[Clear description of what this phase accomplishes and how it fits the project architecture]

## Technical Implementation Details
[Detailed technical approach using project-appropriate patterns and frameworks]

## Implementation Sequence
[Step-by-step breakdown following project conventions and build patterns]

## File Structure and Changes
[Specific files to create/modify using project's directory structure and naming conventions]

## Testing Strategy
[How to validate using the project's testing framework and patterns]

## Success Criteria
[Measurable outcomes that define completion]

## Integration Points
[How this integrates with existing architecture and follows established patterns]
```

**Tech Stack Considerations:**
- **Go projects**: Follow standard Go project layout, use existing CLI patterns, leverage go.mod dependencies
- **Python projects**: Use existing package structure, respect virtual environment setup, follow PEP standards
- **JavaScript projects**: Use existing build tools, follow npm/yarn patterns, respect framework conventions
- **Rust projects**: Follow Cargo conventions, use existing crate structure, leverage type system appropriately

else

### Direct Issue Mode

You are creating an implementation plan for a specific issue or improvement.

**Your specific tasks:**
- Analyze the specific issue within the context of this project's architecture
- Create a focused implementation plan that follows existing patterns
- Define technical approach using appropriate frameworks and libraries already in use
- Identify integration points that respect existing code conventions
- Specify testing approach using the project's testing infrastructure

**Output Format:**

```markdown
---
metadata:
  type: implementation-plan
  topic: [issue-name]
  status: ready_to_implement
  created: [current-date]
  updated: [current-date]
  current_agent: engineer

permissions:
  metadata: [engineer, build]
  build_results: [build]

build_results:
  files_changed: []
  findings: []
  deviations: []
---

# Implementation Plan: [Issue Description]

## Issue Analysis
[Analysis of the problem within the context of this project's architecture]

## Technical Approach
[Implementation strategy using project-appropriate patterns and existing infrastructure]

## Implementation Steps
[Specific, actionable tasks that follow project conventions]

## Integration Points
[How this integrates with existing codebase and respects established patterns]

## Testing Strategy
[Validation approach using existing testing framework and conventions]

## Success Criteria
[Definition of done with measurable outcomes]

## File Structure and Changes
[Specific files to modify/create following project's organization patterns]
```

fi

## Quality Standards

Your implementation plan must:
- Be immediately actionable by the build agent
- Follow all observed project conventions and patterns
- Use appropriate technology choices for the detected tech stack
- Include realistic task breakdown and dependencies
- Address integration challenges specific to this codebase
- Specify testing that works with existing infrastructure
- Consider the project's build system and deployment patterns

## Project Pattern Adaptation

Based on your analysis of the loaded files, adapt your plan to use:
- **Existing directory structures**: Follow the project's organization patterns
- **Established naming conventions**: Use consistent naming for files, functions, and variables
- **Current frameworks and libraries**: Leverage what's already installed and configured
- **Existing build and test patterns**: Use the established development workflow
- **Language-specific idioms**: Apply best practices appropriate to the detected language and ecosystem

Begin your technical analysis and create a detailed implementation plan that seamlessly integrates with this project's characteristics and existing architecture.
