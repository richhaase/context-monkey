# Workflow Document Permissions

## Permission Matrix

### Strategic Plan Documents (*strategic-plan.md)
- **architect**: Can update metadata, create/modify phases, set initial status
- **engineer**: Can update phase status (planned → ready_to_implement → in_progress)
- **build**: Can update phase status (in_progress → completed), add build results
- **review**: Can add review feedback, set back to in_progress if rework needed

### Implementation Plan Documents (*implementation-plan.md)  
- **engineer**: Can update metadata, plan content, status
- **build**: Can update build_results section, completion status
- **review**: Can add review_results section, set back to in_progress if issues found

## Section-Based Permissions Schema

Documents use this permissions structure in YAML frontmatter:

```yaml
permissions:
  metadata: [architect]
  phases: [architect, engineer, build]
  build_results: [build]
  review_results: [review]
  feedback: [build, engineer]  # For clarify/escalate commands
```

## Permission Validation Algorithm

Before any document update:

1. **Parse Document**: Load YAML frontmatter and identify permissions section
2. **Identify Agent Role**: Determine current agent from command context
3. **Check Section Permissions**: Verify agent is listed for target section
4. **Validate Operation**: Ensure operation is appropriate for current document state
5. **Proceed or Reject**: Continue with update or explain permission denial

## Valid Status Transitions

- `planned` → `ready_to_implement` (when dependencies satisfied)
- `ready_to_implement` → `in_progress` (when agent begins work)
- `in_progress` → `completed` (when work finished successfully)
- `in_progress` → `needs_specification` (when clarification required)
- `needs_specification` → `ready_to_implement` (when clarification provided)
- `completed` → `in_progress` (when review finds issues requiring rework)

## Conflict Prevention

If you detect potential conflicts:
1. Do not proceed with the update
2. Explain what conflict was detected
3. Suggest how the user should resolve the issue
4. Offer to retry once resolved

## Error Messages

Provide clear permission error messages:

**Permission Denied**:
```
Error: Permission denied
Agent: build
Section: metadata
Allowed: [architect]
Action: Cannot modify document metadata - only architect can update this section
```

## Cross-Agent Coordination

When agents need to coordinate:

1. **Use Feedback Commands**: /clarify for build→engineer, /escalate for engineer→architect
2. **Respect Boundaries**: Don't modify sections outside your permissions
3. **Update Safely**: Use precise Edit tool operations for YAML updates
4. **Communicate Changes**: Update current_agent and last_activity fields
5. **Validate Results**: Ensure document remains valid after modifications