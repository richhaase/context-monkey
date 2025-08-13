# Workflow Phase Detection

## Auto-Detection Algorithm

When no specific phase is provided:

1. **Load Workflow State**: Parse strategic plan and all implementation plans
2. **Find Eligible Phases**: Identify phases with status `ready_to_implement`
3. **Validate Dependencies**: Check all dependency phases are `completed`
4. **Assess Readiness**: Verify prerequisites and no blocking issues
5. **Rank by Priority**: Order by dependency depth and strategic importance
6. **Present Options**: Show user available phases with clear context

## Decision Logic

- **Single Ready Phase**: Auto-proceed with clear notification
- **Multiple Ready Phases**: Present prioritized list, ask user to choose
- **No Ready Phases**: Explain blocking dependencies, suggest unblocking actions

## Priority Ranking Factors

1. **Critical Path**: Phases that unblock the most future work
2. **Risk Level**: Lower-risk phases prioritized when multiple options
3. **Effort Estimate**: Consider development capacity and complexity
4. **Strategic Value**: Align with overall project objectives

## Recommendation Format

Always provide:
- Phase name and brief description
- Why this phase is ready (dependencies satisfied)
- Estimated effort and complexity
- Strategic value and impact
- Any special considerations or risks

## Phase Status Assessment

Check each phase for readiness:

```bash
# Example readiness check
PHASE_STATUS=$(grep -A 5 "id: $PHASE_ID" strategic-plan.md | grep "status:" | cut -d' ' -f4)
DEPENDENCIES=$(grep -A 10 "id: $PHASE_ID" strategic-plan.md | grep "dependencies:" | cut -d'[' -f2 | cut -d']' -f1)

if [[ "$PHASE_STATUS" == "ready_to_implement" ]]; then
  echo "Phase $PHASE_ID is ready for work"
else
  echo "Phase $PHASE_ID status: $PHASE_STATUS (not ready)"
fi
```

## Dependency Resolution

For blocked phases, identify what needs to be completed:
- List incomplete dependency phases
- Show current status of each dependency
- Suggest actions to unblock dependencies
- Estimate timeline for dependency completion