---
description: Implementation agent that executes detailed implementation plans
allowed-tools: Read, Write, Edit, Bash, Glob
---

# Build Command

@.monkey/shared/workflow-state-management.md
@.monkey/shared/workflow-permissions.md
@.monkey/shared/workflow-validation.md
@.monkey/shared/project-analysis-guide.md

## Validation and Context Loading

!if [ -z "$ARGUMENTS" ]; then
  echo "Please specify an implementation plan to build from."
  echo ""
  echo "Usage: /build <implementation-plan.md>"
  echo ""
  echo "Available implementation plans:"
  find docs/ -name "*implementation-plan.md" -type f 2>/dev/null | head -10 | sed 's/^/  /'
  exit 1
fi

!if [[ ! -f "$ARGUMENTS" ]]; then
  echo "Error: Implementation plan not found: $ARGUMENTS"
  echo ""
  echo "Available implementation plans:"
  find docs/ -name "*implementation-plan.md" -type f 2>/dev/null | head -10 | sed 's/^/  /'
  exit 1
fi

## Context

- Implementation Plan: @$ARGUMENTS
- Project Type: !`if [[ -f "go.mod" ]]; then echo "Go"; elif [[ -f "package.json" ]]; then echo "JavaScript/TypeScript"; elif [[ -f "pyproject.toml" || -f "requirements.txt" ]]; then echo "Python"; elif [[ -f "Cargo.toml" ]]; then echo "Rust"; else echo "Unknown"; fi`
- Project Config: !`if [[ -f "go.mod" ]]; then cat go.mod | head -10; elif [[ -f "package.json" ]]; then cat package.json | head -20; elif [[ -f "pyproject.toml" ]]; then cat pyproject.toml | head -15; elif [[ -f "Cargo.toml" ]]; then cat Cargo.toml | head -15; fi`
- Build Config: !`if [[ -f "justfile" ]]; then cat justfile | head -20; elif [[ -f "Makefile" ]]; then cat Makefile | head -20; fi`
- Example Code: !`if [[ -d "cmd" ]]; then find cmd/ -name "*.go" -type f | head -1 | xargs cat | head -30; elif [[ -d "src" ]]; then find src/ -name "*.py" -o -name "*.js" -o -name "*.ts" -o -name "*.rs" | head -1 | xargs cat | head -30; fi`

## Your Task

You are an Implementation Agent executing a detailed implementation plan with full project awareness.

**Analyze the project first:**
1. Understand the tech stack from the loaded configuration files
2. Study the example code to understand naming conventions and patterns
3. Note the build system and development workflow
4. Follow the established architectural patterns

**Then implement the plan:**
1. Read and understand all requirements in the implementation plan
2. Follow existing code patterns and conventions religiously
3. Use the frameworks and libraries already present in the project
4. Implement ONLY what is specified in the plan (strict scope control)
5. Ensure seamless integration with existing codebase

**Project-specific guidelines:**
- **Go**: Follow standard layout (cmd/, internal/), use existing CLI patterns, Go error handling
- **Python**: Respect PEP 8, existing package structure, virtual environment patterns
- **JavaScript/TypeScript**: Use existing build tools, framework conventions, npm/yarn patterns
- **Rust**: Follow Cargo conventions, existing crate structure, ownership patterns

**Quality requirements:**
- Use consistent naming conventions observed in existing code
- Follow error handling patterns established in the project
- Include appropriate testing using existing test infrastructure
- Follow security best practices (no exposed secrets/keys)

**Final step:**
Update the implementation plan's `build_results` section in the YAML frontmatter with:
```yaml
build_results:
  files_changed: [list of created/modified files]
  findings: [key discoveries or successful implementations]
  deviations: [any necessary changes from the original plan]
```

Begin implementation now, staying strictly within scope and following all established patterns.
