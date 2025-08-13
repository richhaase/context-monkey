# Workflow State Management Instructions

## Reading Workflow State

Always start by loading current workflow state:
1. Load strategic plan: @docs/*strategic-plan.md
2. Parse YAML frontmatter to understand current phases and status
3. Load any relevant implementation plans based on context
4. Understand the current workflow position and recent activity

## Understanding Phase Status

Phase status meanings:
- `planned`: Phase defined but dependencies not yet satisfied
- `ready_to_implement`: All dependencies met, phase can be started
- `in_progress`: Phase actively being worked on
- `completed`: Phase finished and validated

## YAML Frontmatter Structure

### Strategic Plan Documents
```yaml
---
metadata:
  type: strategic-plan
  topic: <topic-name>
  created: <timestamp>
  updated: <timestamp>
  status: active

permissions:
  metadata: [architect]
  phases: [architect, engineer]
  
phases:
  - id: 1
    name: <phase-name>
    status: planned|ready_to_implement|in_progress|completed
    implementation_plan: docs/phase-1-<topic>-implementation-plan.md
    dependencies: []
    current_agent: <agent-name>
    last_activity: <timestamp>
---
```

### Implementation Plan Documents
```yaml
---
metadata:
  type: implementation-plan
  phase: 1
  topic: <topic-name>
  status: ready_to_implement|in_progress|completed|needs_specification
  created: <timestamp>
  updated: <timestamp>
  current_agent: <agent-name>

permissions:
  metadata: [engineer, build]
  build_results: [build]
  
dependencies:
  - phase: <phase-id>
    status: <required-status>
    verification: <description>

build_results:
  files_changed: []
  findings: []
  deviations: []
---
```

## State Update Patterns

When updating workflow documents:
1. Preserve exact YAML structure and formatting
2. Update only sections within your permission scope
3. Always update `metadata.updated` timestamp
4. Update `current_agent` and `last_activity` when taking ownership
5. Validate document structure after changes

## Edit Tool Usage for State Updates

Use precise string matching with the Edit tool:

**Update Phase Status**:
```
old_string: "    status: ready_to_implement"
new_string: "    status: in_progress"
```

**Update Current Agent**:
```
old_string: "    current_agent: engineer"
new_string: "    current_agent: build"
```

**Update Timestamp**:
```
old_string: "  updated: 2025-08-12"
new_string: "  updated: 2025-08-12T10:30:00Z"
```

## Dependency Validation

Before marking any phase as ready_to_implement:
1. Verify all dependency phases are in `completed` status
2. Check that implementation plans exist for dependencies
3. Validate no blocking issues exist
4. Confirm prerequisites are satisfied

## Document State Reading

When loading workflow documents:
1. Always check for YAML frontmatter first
2. Parse metadata section for document type and status
3. Extract phase information and dependency relationships
4. Note last update timestamps and modification history
5. Validate document structure integrity

## Session Tracking

Track basic session information:
- `current_agent`: Which agent is currently working on this document
- `last_activity`: Timestamp of most recent significant activity
- `updated`: Document last modification timestamp

## Error Handling

When YAML parsing fails:
1. Do not proceed with state updates
2. Report specific parsing error
3. Suggest manual inspection of document structure
4. Offer to help fix common YAML syntax issues

## State Transition Rules

Valid status transitions:
- `planned` → `ready_to_implement` (when dependencies satisfied)
- `ready_to_implement` → `in_progress` (when agent begins work)
- `in_progress` → `completed` (when work finished successfully)
- `in_progress` → `needs_specification` (when clarification required)
- `needs_specification` → `ready_to_implement` (when clarification provided)

Invalid transitions should be prevented and explained to user.

## State Update Safety

Before making any document changes:
1. Backup current state information
2. Validate you have permissions for the specific updates
3. Check for potential conflicts with other agents
4. Ensure atomic updates that maintain consistency
5. Verify changes don't break workflow progression logic