# Escalate Command

Engineer-to-architect feedback command for requesting strategic guidance or scope revisions.

Usage: `/escalate <strategic-plan.md>`

## Purpose

The escalate command allows the engineer to request guidance from the architect when implementation planning reveals scope issues, strategic conflicts, or architectural decisions beyond engineering authority.

## Validation

```bash
# Validate strategic plan file exists
if [[ ! -f "$ARGUMENTS" ]]; then
  echo "Error: Strategic plan not found: $ARGUMENTS"
  echo ""
  echo "Usage: /escalate <strategic-plan.md>"
  echo ""
  echo "Available strategic plans:"
  find docs/ -name "*strategic-plan.md" -type f 2>/dev/null | head -10 | sed 's/^/  /'
  exit 1
fi

# Validate it's a strategic plan (not implementation plan)
if ! head -20 "$ARGUMENTS" 2>/dev/null | grep -q "type: strategic-plan"; then
  echo "Error: Target file is not a strategic plan"
  echo "File: $ARGUMENTS"
  echo ""
  echo "Escalate command is for strategic plans only."
  echo "Use /clarify for implementation plan issues."
  exit 1
fi

echo "Escalation Request System"
echo "Target: $ARGUMENTS"
echo ""
echo "Adding feedback section to request architect guidance..."
```

## Escalation Request Process

You are the engineer escalating strategic or scope issues to the architect.

### Context Loading
First, load the strategic plan and any related implementation plans:
@$ARGUMENTS

Also load related implementation plans to understand the full context:
```bash
# Find related implementation plans
TOPIC=$(grep "topic:" "$ARGUMENTS" | head -1 | cut -d' ' -f2-)
find docs/ -name "*${TOPIC}*implementation-plan.md" -type f
```

### Identify Escalation Triggers

Valid reasons for escalation include:
1. **Scope Expansion Required**: Implementation needs features not in original strategic design
2. **Architectural Conflicts**: Strategic plan conflicts with technical constraints
3. **Resource Constraints**: Timeline or complexity exceeds strategic estimates
4. **Strategic Ambiguity**: High-level strategy lacks sufficient detail for engineering
5. **Priority Conflicts**: Multiple strategic objectives conflict during implementation

### Add Feedback Section

Add a feedback section to the strategic plan using the Edit tool:

```yaml
feedback:
  - id: "feedback_[timestamp]"
    from_agent: "engineer"
    to_agent: "architect"
    timestamp: "[current_timestamp]"
    type: "[escalation_type]"
    context: "[brief_description_of_engineering_context]"
    issues:
      - "[Specific strategic issue 1]"
      - "[Strategic issue 2]"
      - "[Additional issues as needed]"
    recommendations:
      - "[Suggested strategic approach 1]"
      - "[Alternative consideration 2]"
    impact: "[description_of_impact_on_project]"
    status: "open"
```

### Escalation Types

**scope_expansion**: Implementation requires features beyond original scope
**architectural_conflict**: Strategic plan conflicts with technical reality  
**resource_constraint**: Strategic timeline or complexity estimates are unrealistic
**strategic_ambiguity**: Strategic guidance insufficient for engineering decisions
**priority_conflict**: Strategic objectives conflict during implementation

### Provide Engineering Context

When escalating, include:
- **Technical Analysis**: What engineering discovered during implementation planning
- **Constraint Details**: Specific technical or resource limitations encountered
- **Implementation Implications**: How the issue affects delivery timeline and quality
- **Alternative Approaches**: Engineering suggestions for strategic consideration

### Update Related Implementation Plans

If escalation blocks implementation planning:
1. Update related implementation plan status to reflect dependency on strategic guidance
2. Document the escalation in the implementation plan's metadata
3. Prevent further engineering work until architectural guidance is provided

### Maintain Engineering Scope

**Don't Make Strategic Decisions**: Present options and analysis, don't choose strategic direction
**Document Technical Reality**: Provide clear technical assessment without strategic judgment
**Suggest Alternatives**: Offer engineering perspectives on strategic options
**Respect Architectural Authority**: Wait for architectural guidance before proceeding

### Notification and Next Steps

After escalation:
1. Explain what strategic guidance was requested
2. Recommend user run `/architect [strategic-plan]` to address feedback
3. Indicate that engineering can resume once architectural guidance is provided
4. Document any blocked implementation plans waiting for resolution