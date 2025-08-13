# Clarify Command

Build-to-engineer feedback command for requesting clarification on implementation issues.

Usage: `/clarify <implementation-plan.md>`

## Purpose

The clarify command allows the build agent to request clarification from the engineer when implementation plans have unclear requirements, missing specifications, or technical blockers.

## Validation

```bash
# Validate implementation plan file exists
if [[ ! -f "$ARGUMENTS" ]]; then
  echo "Error: Implementation plan not found: $ARGUMENTS"
  echo ""
  echo "Usage: /clarify <implementation-plan.md>"
  echo ""
  echo "Available implementation plans:"
  find docs/ -name "*implementation-plan.md" -type f 2>/dev/null | head -10 | sed 's/^/  /'
  exit 1
fi

# Validate it's an implementation plan (not strategic plan)
if ! head -20 "$ARGUMENTS" 2>/dev/null | grep -q "type: implementation-plan"; then
  echo "Error: Target file is not an implementation plan"
  echo "File: $ARGUMENTS"
  echo ""
  echo "Clarify command is for implementation plans only."
  echo "Use /escalate for strategic plan issues."
  exit 1
fi

echo "Clarify Request System"
echo "Target: $ARGUMENTS"
echo ""
echo "Adding feedback section to request engineer clarification..."
```

## Clarification Request Process

You are the build agent requesting clarification from the engineer about unclear implementation requirements.

### Context Loading
First, load the implementation plan to understand current issues:
@$ARGUMENTS

### Identify Clarification Needs

Analyze the implementation plan for:
1. **Missing Specifications**: Requirements that are too vague to implement
2. **Technical Ambiguities**: Unclear technical approaches or dependencies
3. **Incomplete Definitions**: Schema, API, or interface definitions that lack detail
4. **Conflicting Requirements**: Specifications that contradict each other

### Add Feedback Section

Add a feedback section to the implementation plan using the Edit tool with this structure:

```yaml
feedback:
  - id: "feedback_[timestamp]"
    from_agent: "build"
    to_agent: "engineer"
    timestamp: "[current_timestamp]"
    type: "clarification_needed"
    issues:
      - "[Specific issue 1]"
      - "[Specific issue 2]" 
      - "[Additional issues as needed]"
    status: "open"
```

### Feedback Guidelines

**Be Specific**: 
- Don't say "this is unclear" - explain exactly what information is missing
- Provide context about why the clarification is needed for implementation
- Suggest what level of detail would be helpful

**Examples of Good Feedback**:
- "Permission schema needs concrete YAML structure with field names and validation rules"
- "State update mechanics require implementation details: should we use Edit tool or read/write pattern?"
- "Session tracking fields are undefined - need specific field names and data types"

**Examples of Poor Feedback**:
- "This section is confusing"
- "More details needed"
- "Implementation unclear"

### Update Implementation Plan Status

If significant clarification is needed that blocks implementation:
1. Change status from `ready_to_implement` to `needs_specification`
2. Add reasoning to the metadata section

### Notify User

After adding feedback:
1. Explain what clarification was requested
2. Recommend that user run `/engineer [implementation-plan]` to address the feedback
3. Indicate that `/build` can be re-run once clarification is provided

### Scope Control

**Stay Focused**: Only request clarification on items directly blocking implementation
**Don't Expand Scope**: Don't suggest new features or requirements
**Document Blockers**: Focus on what prevents moving forward with current scope