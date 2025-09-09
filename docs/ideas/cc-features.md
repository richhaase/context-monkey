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

## ✅ Advanced Tool Permissions
**COMPLETED**: Expanded tool permissions for all agents:
- Added `WebSearch` to stack-detective for technology research
- Added `WebFetch` to repository-analyst, project-planner, and code-reviewer for documentation analysis
- Expanded `Bash` permissions across all agents for comprehensive system analysis
- Added cross-language support (python, ruby, php, docker, make, mvn, gradle)

## Command Composition
No meta-commands that chain existing ones:
- Missing workflow commands that run multiple analyses in sequence

## ✅ Dynamic Context Loading
**COMPLETED**: Enhanced `@filepath` reference usage across all agents:
- Added `@.monkey/stack.md` references to all 5 agents for technology awareness
- Added `@.monkey/rules.md` references to all 5 agents for project-specific constraints
- Agents now dynamically load project context for informed analysis

## Recent Improvements
- **Stack Detective Refactored**: Removed subjective recommendations and scoring from stack.md output format. Now generates pure factual documentation for objective reference.
- **Stack Detective Enhanced**: Added Write and Edit capabilities so it can actually create and update stack.md files.
- **Comprehensive Error Handling**: Added robust error recovery protocols to all agents for graceful degradation, clear limitation communication, and professional quality outputs.

## Future Agent Ideas (Deferred)

### Missing Essential Agents
Based on claude-code-expert review, these agents would significantly enhance the toolkit:

#### security-auditor
- **Purpose**: Security vulnerability assessment and compliance checking
- **Tools**: Read, Glob, Grep, Bash(git:*, find:*), WebSearch
- **Impact**: Critical for enterprise adoption
- **Use Cases**: Dependency vulnerability scanning, secret detection, compliance validation

#### doc-generator  
- **Purpose**: Automated documentation generation and maintenance
- **Tools**: Read, Glob, Grep, Write, Edit, WebSearch
- **Impact**: Developer productivity multiplier
- **Use Cases**: README generation, API docs, architecture documentation

#### dependency-manager
- **Purpose**: Dependency analysis, security scanning, and upgrade planning
- **Tools**: Read, Glob, Grep, Bash(package managers), WebSearch, Edit
- **Impact**: Critical for maintenance workflows
- **Use Cases**: Dependency updates, security patching, license compliance

#### performance-profiler
- **Purpose**: Performance analysis and optimization recommendations  
- **Tools**: Read, Glob, Grep, Bash(profiling tools), WebFetch
- **Impact**: Essential for production systems
- **Use Cases**: Performance bottleneck detection, optimization suggestions

### Workflow Orchestration Ideas (Deferred)
Multi-agent workflow commands that chain analyses for complete developer workflows:

#### /onboard-project
- **Flow**: stack-detective → repository-analyst → project-planner
- **Purpose**: Complete project understanding for new team members
- **Output**: Comprehensive project briefing with setup instructions

#### /code-health-audit  
- **Flow**: repository-analyst → code-reviewer → deep-researcher
- **Purpose**: Complete codebase health assessment
- **Output**: Technical debt report with prioritized improvement recommendations

#### /feature-lifecycle
- **Flow**: project-planner → code-reviewer → stack-detective  
- **Purpose**: End-to-end feature development planning and validation
- **Output**: Implementation plan with review criteria and stack impact assessment

#### /security-assessment (requires security-auditor)
- **Flow**: security-auditor → dependency-manager → code-reviewer
- **Purpose**: Comprehensive security evaluation
- **Output**: Security report with vulnerability assessment and remediation plan

## Additional Enhancement Ideas

### Agent Quality Improvements
- **TodoWrite Integration**: Add task tracking to project-planner and code-reviewer for complex workflows
- **NotebookEdit Support**: Add Jupyter notebook editing capabilities to code-reviewer and deep-researcher
- **MultiEdit Capabilities**: Enable multi-file editing for repository-wide changes

### Advanced Tool Permissions
- **Specialized Command Sets**: Add domain-specific commands (e.g., `kubectl` for Kubernetes projects, `terraform` for IaC)
- **Package Manager Integration**: Enhanced support for `composer`, `bundler`, `mix`, `pub`, etc.
- **Cloud CLI Tools**: Add support for `aws`, `gcloud`, `az` for cloud-native projects

### Context Enhancement  
- **Dynamic README References**: Agents could reference `@README.md`, `@CONTRIBUTING.md`, `@ARCHITECTURE.md`
- **Manifest File Loading**: Auto-load `@package.json`, `@Cargo.toml`, `@pyproject.toml` based on detected stack
- **Environment Context**: Reference `@.env.example` and deployment configs

### Workflow Automation
- **Pre-commit Integration**: Hooks that auto-run code review before commits
- **CI/CD Awareness**: Agents that understand GitHub Actions, GitLab CI, Jenkins pipelines
- **Issue Tracker Integration**: Connect planning agents with GitHub Issues, Jira tickets

### Enterprise Features
- **Audit Logging**: Track all agent decisions and changes for compliance
- **Team Collaboration**: Multi-user context sharing and collaborative planning
- **Role-Based Access**: Different agent capabilities based on user roles
- **Custom Rule Templates**: Organization-wide rule templates for consistent development practices

### Performance Enhancements
- **Intelligent Caching**: Cache file content, search results, and external research
- **Progressive Analysis**: Quick/standard/deep analysis modes with different time/depth trade-offs  
- **Context Validation**: Timestamp-based context freshness checking
- **Result Memoization**: Cache common analysis patterns across projects

## Next Steps
Priority focus areas: hooks implementation, MCP integrations, and command composition. Plan mode support, parallel tool execution, advanced tool permissions, dynamic context loading, and comprehensive error handling have been completed.