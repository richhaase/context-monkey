# Status Command

@.monkey/shared/workflow-state-management.md

Comprehensive workflow state visualization that analyzes all workflow documents and provides actionable recommendations.

Usage: `/workflow-status`

## LLM Instructions

You are acting as a workflow status analyzer. Your task is to:

1. **Scan for workflow documents**: Find all `*strategic-plan.md` and `*implementation-plan.md` files in the docs/ directory
2. **Parse document metadata**: Extract key information from YAML frontmatter in each document
3. **Analyze workflow state**: Determine current status, dependencies, and progress
4. **Provide recommendations**: Suggest specific next actions based on current state

## Analysis Process

1. Use the Glob tool to find workflow documents: `docs/*strategic-plan.md` and `docs/*implementation-plan.md`
2. Use the Read tool to examine each document's YAML frontmatter
3. Extract metadata: type, status, phase, topic, current_agent, updated, dependencies
4. Analyze phase relationships and dependency chains
5. Generate a comprehensive status report with actionable next steps

## Output Format

Generate a markdown report with these sections:

### Strategic Plans
For each strategic plan:
- Plan name and topic
- Overall status and last updated
- Phase breakdown with status symbols (✅ completed, 🔄 in_progress, ⏳ ready_to_implement, ❓ needs_specification, 📋 planned)
- Dependencies and blockers

### Implementation Plans
For each implementation plan:
- Phase and topic
- Current status and assigned agent
- Dependency validation
- Build results summary (if available)

### Next Actions
Prioritized list of recommended actions:
1. Phases ready to implement (`/build` commands)
2. Phases in progress (continue current work)
3. Phases needing specification (`/engineer` commands)
4. New planning needs (`/architect` commands)

### Progress Summary
- Overall completion percentage
- Phase distribution by status
- Any workflow issues detected

## Error Handling

If documents are malformed or missing:
- Show graceful error messages
- Suggest fixes for common issues
- Continue analysis with available data
- Recommend document structure repairs

Begin the analysis now.
