# Project Analysis Guide

This guide provides consistent instructions for project analysis across all Claude Code workflow commands. Commands should reference this guide to ensure consistent project detection and adaptation.

## Project Analysis Process

When analyzing a project, Claude should follow these steps in order:

### 1. Language and Framework Detection

**Primary Language Detection**:
- Look for key indicator files:
  - Go: `go.mod`, `go.sum`, `*.go` files
  - Python: `pyproject.toml`, `setup.py`, `requirements.txt`, `*.py` files  
  - JavaScript/TypeScript: `package.json`, `package-lock.json`, `*.js`, `*.ts` files
  - Rust: `Cargo.toml`, `Cargo.lock`, `*.rs` files
  - Java: `pom.xml`, `build.gradle`, `*.java` files
  - C#: `*.csproj`, `*.sln`, `*.cs` files

**Framework Detection**:
- Examine dependencies and project structure:
  - Web frameworks: React, Vue, Angular, Django, Flask, Express, etc.
  - CLI frameworks: Cobra (Go), Click (Python), Commander (JS), Clap (Rust)
  - Testing frameworks: Go testing, pytest, Jest, cargo test, etc.

### 2. Project Structure Analysis

**Directory Structure Patterns**:
- Examine key directories and their purposes
- Identify architectural patterns (MVC, microservices, monorepo, etc.)
- Understand module/package organization
- Note configuration and build directories

**Naming Conventions**:
- Study existing file and directory naming patterns
- Observe variable and function naming conventions
- Identify project-specific terminology and patterns

### 3. Build System and Tools Detection

**Build Systems**:
- Make, Just, npm scripts, Go toolchain, Cargo, Poetry, etc.
- Identify build configuration files and scripts
- Understand compilation and packaging processes

**Development Tools**:
- Linters: golangci-lint, eslint, pylint, clippy, etc.
- Formatters: gofmt, prettier, black, rustfmt, etc.
- Test runners and coverage tools
- CI/CD configuration files

### 4. Context Loading Strategy

**Essential Files to Load** (using `@filename` syntax):
- Primary configuration files (go.mod, package.json, etc.)
- Build/task configuration (justfile, Makefile, etc.)
- Project documentation (README.md, docs/)
- Example code files showing patterns (1-2 representative files)

**Code Pattern Files**:
- Load 1-2 example files from main source directories
- Choose files that demonstrate project conventions
- Focus on files that show architectural patterns

### 5. Adaptation Instructions

**Language-Specific Adaptations**:
- **Go**: Follow standard Go project layout, use standard library patterns, implement interfaces appropriately
- **Python**: Respect PEP standards, use virtual environments, follow packaging conventions
- **JavaScript**: Use modern ES features, follow npm/yarn conventions, respect framework patterns
- **Rust**: Follow Rust conventions, use cargo features, implement traits appropriately

**Framework-Specific Adaptations**:
- Web frameworks: Follow MVC/component patterns, use framework conventions
- CLI frameworks: Use flag parsing patterns, follow command structure conventions
- Testing frameworks: Use framework testing patterns and assertion styles

## Integration with Commands

### Context Loading Pattern

Commands should include these instructions:

```markdown
# Analyze project characteristics
1. Examine the project structure to understand the primary language and framework
2. Load essential configuration files:
   - @go.mod (if Go project)
   - @package.json (if JavaScript/TypeScript project)  
   - @pyproject.toml or @requirements.txt (if Python project)
   - @Cargo.toml (if Rust project)
3. Load build/task configuration:
   - @justfile or @Makefile (if present)
   - @.github/workflows/*.yml (if using GitHub Actions)
4. Load 1-2 example source files to understand code patterns
5. Load project documentation: @README.md
```

### Adaptation Instructions

```markdown
# Adapt guidance to project characteristics
1. Follow the established code patterns and conventions you observe
2. Use appropriate language idioms and best practices
3. Leverage existing frameworks and libraries found in the project
4. Maintain consistency with existing naming and organization patterns
5. Use appropriate build tools and testing frameworks for the detected tech stack
```

## Language-Specific Guidance

### Go Projects
- Follow standard Go project layout (cmd/, internal/, pkg/)
- Use Go modules and standard library patterns
- Implement interfaces and error handling idiomatically
- Use golangci-lint and gofmt standards
- Follow Go testing conventions

### Python Projects  
- Respect PEP 8 style guidelines
- Use appropriate dependency management (pip, poetry, pipenv)
- Follow package structure conventions
- Use pytest or unittest patterns
- Implement proper __init__.py usage

### JavaScript/TypeScript Projects
- Use modern ES6+ features appropriately
- Follow npm/yarn dependency conventions
- Respect framework patterns (React, Vue, etc.)
- Use appropriate bundling and transpilation
- Follow Jest or other testing framework patterns

### Rust Projects
- Follow Cargo conventions and project structure
- Use appropriate ownership and borrowing patterns
- Implement traits and error handling idiomatically
- Use cargo test and rustfmt standards
- Follow Rust API guidelines

## Error Handling

### When Project Analysis Fails
- If language detection is unclear, default to generic best practices
- If framework detection fails, focus on language-level conventions
- If context loading fails, continue with available information
- Provide fallback guidance that works across project types

### Graceful Degradation
- Commands should work even when project analysis is incomplete
- Focus on language-level patterns when framework detection fails
- Use generic programming best practices as fallback guidance
- Maintain core command functionality regardless of project detection accuracy

## Quality Assurance

### Validation Checks
- Verify that detected language matches actual project files
- Confirm that framework detection aligns with dependencies
- Validate that loaded context files are relevant and useful
- Ensure adaptation recommendations match project characteristics

### Consistency Principles
- All commands should use identical project analysis steps
- Context loading should follow the same patterns across commands
- Adaptation instructions should be consistent and complementary
- Error handling should be uniform across all commands